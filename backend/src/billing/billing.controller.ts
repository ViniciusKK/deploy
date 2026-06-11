import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { BillingService } from './billing.service';
import {
  ClerkAuthGuard,
  AuthenticatedRequest,
} from '../auth/clerk-auth.guard';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  @UseGuards(ClerkAuthGuard)
  createCheckout(@Req() request: AuthenticatedRequest) {
    return this.billingService.createCheckoutSession(request.clerkUserId);
  }

  @Get('confirm')
  @UseGuards(ClerkAuthGuard)
  confirm(
    @Req() request: AuthenticatedRequest,
    @Query('session_id') sessionId?: string,
  ) {
    if (!sessionId) {
      throw new BadRequestException('session_id is required.');
    }
    return this.billingService.confirmCheckoutSession(
      request.clerkUserId,
      sessionId,
    );
  }

  @Get('status')
  @UseGuards(ClerkAuthGuard)
  getStatus(@Req() request: AuthenticatedRequest) {
    return this.billingService.getStatus(request.clerkUserId);
  }

  @Post('webhook')
  handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ) {
    if (!request.rawBody) {
      throw new BadRequestException('Raw body unavailable.');
    }
    return this.billingService.handleWebhookEvent(request.rawBody, signature);
  }
}
