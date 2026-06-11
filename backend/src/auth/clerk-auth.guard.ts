import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';
import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  clerkUserId: string;
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token.');
    }

    const secretKey = this.configService.get<string>('app.clerkSecretKey');
    if (!secretKey) {
      throw new UnauthorizedException('CLERK_SECRET_KEY is not configured.');
    }

    try {
      const payload = await verifyToken(authHeader.slice('Bearer '.length), {
        secretKey,
      });
      request.clerkUserId = payload.sub;
      return true;
    } catch (error) {
      this.logger.error(
        `Clerk token verification failed: ${(error as Error).message}`,
      );
      throw new UnauthorizedException('Invalid Clerk session token.');
    }
  }
}
