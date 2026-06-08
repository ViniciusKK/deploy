import { Module } from '@nestjs/common';
import { QueuesModule } from '../queues/queues.module';
import { ClusteringController } from './clustering.controller';
import { ClusteringService } from './clustering.service';

@Module({
  imports: [QueuesModule],
  controllers: [ClusteringController],
  providers: [ClusteringService],
  exports: [ClusteringService],
})
export class ClusteringModule {}
