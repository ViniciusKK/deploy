import { Module } from '@nestjs/common';
import { OpenAiModule } from '../openai/openai.module';
import { QueuesModule } from '../queues/queues.module';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';

@Module({
  imports: [QueuesModule, OpenAiModule],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
