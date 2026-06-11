import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';

@Module({
  imports: [UsersModule],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
