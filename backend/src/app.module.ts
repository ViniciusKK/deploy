import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app.config';
import { PrismaModule } from './prisma/prisma.module';
import { QueuesModule } from './queues/queues.module';
import { OpenAiModule } from './openai/openai.module';
import { StoriesModule } from './stories/stories.module';
import { ArticlesModule } from './articles/articles.module';
import { ClusteringModule } from './clustering/clustering.module';
import { AnalysisModule } from './analysis/analysis.module';
import { AggregationModule } from './aggregation/aggregation.module';
import { FeedModule } from './feed/feed.module';
import { WorkerModule } from './worker/worker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('app.redisHost', 'localhost'),
          port: configService.get<number>('app.redisPort', 6379),
        },
      }),
    }),
    PrismaModule,
    QueuesModule,
    OpenAiModule,
    StoriesModule,
    ArticlesModule,
    ClusteringModule,
    AnalysisModule,
    AggregationModule,
    FeedModule,
    WorkerModule,
  ],
})
export class AppModule {}
