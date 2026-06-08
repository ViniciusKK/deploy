import { Module } from '@nestjs/common';
import { AggregationModule } from '../aggregation/aggregation.module';
import { AnalysisModule } from '../analysis/analysis.module';
import { ArticlesModule } from '../articles/articles.module';
import { ClusteringModule } from '../clustering/clustering.module';
import {
  ArticleAnalyzeProcessor,
  ArticleExtractProcessor,
  CandidateFetchProcessor,
  StoryAggregateProcessor,
  StoryClusterProcessor,
  StoryDiscoveryProcessor,
} from './pipeline.processor';

@Module({
  imports: [ArticlesModule, ClusteringModule, AnalysisModule, AggregationModule],
  providers: [
    StoryDiscoveryProcessor,
    CandidateFetchProcessor,
    ArticleExtractProcessor,
    StoryClusterProcessor,
    ArticleAnalyzeProcessor,
    StoryAggregateProcessor,
  ],
})
export class WorkerModule {}
