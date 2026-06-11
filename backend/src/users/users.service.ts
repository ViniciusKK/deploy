import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient, type ClerkClient } from '@clerk/backend';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly clerk: ClerkClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.clerk = createClerkClient({
      secretKey: this.configService.get<string>('app.clerkSecretKey', ''),
    });
  }

  /**
   * Upserts the signed-in Clerk user into the local database. Profile data is
   * fetched from Clerk's API (not trusted from the client request body).
   */
  async syncFromClerk(clerkUserId: string): Promise<User> {
    const clerkUser = await this.clerk.users.getUser(clerkUserId);
    const email =
      clerkUser.primaryEmailAddress?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      '';

    const profile = {
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    };

    const user = await this.prisma.user.upsert({
      where: { clerkId: clerkUserId },
      create: { clerkId: clerkUserId, ...profile },
      update: profile,
    });

    this.logger.log(`Synced Clerk user ${clerkUserId} (${email})`);
    return user;
  }

  findByClerkId(clerkUserId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  }
}
