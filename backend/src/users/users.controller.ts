import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ClerkAuthGuard,
  AuthenticatedRequest,
} from '../auth/clerk-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sync')
  @UseGuards(ClerkAuthGuard)
  sync(@Req() request: AuthenticatedRequest) {
    return this.usersService.syncFromClerk(request.clerkUserId);
  }
}
