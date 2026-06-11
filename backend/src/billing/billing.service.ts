import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { SubscriptionStatus } from '@prisma/client';

const PLAN_NAME = 'Espectro Premium';
const PLAN_AMOUNT_CENTS = 1500; // R$ 15,00

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripeClient: Stripe | null = null;
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>(
      'app.frontendUrl',
      'http://localhost:3001',
    );
  }

  private get stripe(): Stripe {
    if (!this.stripeClient) {
      const secretKey = this.configService.get<string>('app.stripeSecretKey');
      if (!secretKey) {
        throw new BadRequestException('STRIPE_SECRET_KEY is not configured.');
      }
      this.stripeClient = new Stripe(secretKey);
    }
    return this.stripeClient;
  }

  async createCheckoutSession(clerkUserId: string): Promise<{ url: string }> {
    // Garante que o usuário exista localmente mesmo se o sync ainda não rodou.
    let user = await this.usersService.findByClerkId(clerkUserId);
    if (!user) {
      user = await this.usersService.syncFromClerk(clerkUserId);
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email || undefined,
        name:
          [user.firstName, user.lastName].filter(Boolean).join(' ') ||
          undefined,
        metadata: { clerkId: user.clerkId },
      });
      customerId = customer.id;
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceId = this.configService.get<string>('app.stripePriceId');
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        priceId
          ? { price: priceId, quantity: 1 }
          : {
              price_data: {
                currency: 'brl',
                product_data: {
                  name: PLAN_NAME,
                  description:
                    'Acesso ilimitado a comparações, pontos cegos e despachos.',
                },
                recurring: { interval: 'month' },
                unit_amount: PLAN_AMOUNT_CENTS,
              },
              quantity: 1,
            },
      ],
      metadata: { clerkId: user.clerkId },
      success_url: `${this.frontendUrl}/assinatura/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.frontendUrl}/?assinatura=cancelada`,
    });

    if (!session.url) {
      throw new BadRequestException('Stripe did not return a checkout URL.');
    }
    return { url: session.url };
  }

  /**
   * Confirma a assinatura a partir do session_id da página de sucesso.
   * Permite fechar o ciclo localmente sem depender do webhook (útil em dev).
   */
  async confirmCheckoutSession(clerkUserId: string, sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.metadata?.clerkId !== clerkUserId) {
      throw new NotFoundException('Checkout session not found for this user.');
    }
    if (session.payment_status !== 'paid') {
      return { status: 'pending' as const };
    }

    const subscription = session.subscription as Stripe.Subscription | null;
    await this.applySubscription(clerkUserId, subscription);
    return { status: 'active' as const };
  }

  async getStatus(clerkUserId: string) {
    const user = await this.usersService.findByClerkId(clerkUserId);
    return {
      subscriptionStatus: user?.subscriptionStatus ?? SubscriptionStatus.NONE,
      currentPeriodEnd: user?.subscriptionCurrentPeriodEnd ?? null,
    };
  }

  async handleWebhookEvent(payload: Buffer, signature: string | undefined) {
    const webhookSecret = this.configService.get<string>(
      'app.stripeWebhookSecret',
    );
    if (!webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET is not configured.');
    }
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header.');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature.');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const clerkId = session.metadata?.clerkId;
        if (clerkId && session.subscription) {
          const subscription = await this.stripe.subscriptions.retrieve(
            session.subscription as string,
          );
          await this.applySubscription(clerkId, subscription);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const user = await this.prisma.user.findUnique({
          where: { stripeCustomerId: subscription.customer as string },
        });
        if (user) {
          await this.applySubscription(user.clerkId, subscription);
        }
        break;
      }
      default:
        this.logger.debug(`Ignoring Stripe event ${event.type}`);
    }

    return { received: true };
  }

  private async applySubscription(
    clerkUserId: string,
    subscription: Stripe.Subscription | null,
  ) {
    if (!subscription) return;

    const status = this.mapStripeStatus(subscription.status);
    const periodEnd = subscription.items.data[0]?.current_period_end;
    await this.prisma.user.update({
      where: { clerkId: clerkUserId },
      data: {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: status,
        subscriptionCurrentPeriodEnd: periodEnd
          ? new Date(periodEnd * 1000)
          : null,
      },
    });
    this.logger.log(
      `Subscription ${subscription.id} for ${clerkUserId} is now ${status}`,
    );
  }

  private mapStripeStatus(status: Stripe.Subscription.Status) {
    switch (status) {
      case 'active':
      case 'trialing':
        return SubscriptionStatus.ACTIVE;
      case 'past_due':
      case 'unpaid':
        return SubscriptionStatus.PAST_DUE;
      default:
        return SubscriptionStatus.CANCELED;
    }
  }
}
