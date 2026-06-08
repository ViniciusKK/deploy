import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../common/pipeline.constants';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.STORY_DISCOVERY },
      { name: QUEUE_NAMES.CANDIDATE_FETCH },
      { name: QUEUE_NAMES.ARTICLE_EXTRACT },
      { name: QUEUE_NAMES.STORY_CLUSTER },
      { name: QUEUE_NAMES.ARTICLE_ANALYZE },
      { name: QUEUE_NAMES.STORY_AGGREGATE },
    ),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
