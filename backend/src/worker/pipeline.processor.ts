import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  ArticleAnalyzeJob,
  ArticleExtractJob,
  CandidateFetchJob,
  QUEUE_NAMES,
  StoryAggregateJob,
  StoryClusterJob,
  StoryDiscoveryJob,
} from '../common/pipeline.constants';
import { ArticlesService } from '../articles/articles.service';
import { ClusteringService } from '../clustering/clustering.service';
import { AnalysisService } from '../analysis/analysis.service';
import { AggregationService } from '../aggregation/aggregation.service';

@Processor(QUEUE_NAMES.STORY_DISCOVERY)
export class StoryDiscoveryProcessor extends WorkerHost {
  async process(job: Job<StoryDiscoveryJob>) {
    return {
      queue: job.queueName,
      storyId: job.data.storyId,
      status: 'stubbed',
      message: 'Discovery is intentionally stubbed in the MVP. Seed stories are created via API.',
    };
  }
}

@Processor(QUEUE_NAMES.CANDIDATE_FETCH)
export class CandidateFetchProcessor extends WorkerHost {
  async process(job: Job<CandidateFetchJob>) {
    return {
      queue: job.queueName,
      candidateArticleId: job.data.candidateArticleId,
      status: 'stubbed',
      message: 'Candidate fetch is intentionally stubbed in the MVP.',
    };
  }
}

@Processor(QUEUE_NAMES.ARTICLE_EXTRACT)
export class ArticleExtractProcessor extends WorkerHost {
  constructor(private readonly articlesService: ArticlesService) {
    super();
  }

  async process(job: Job<ArticleExtractJob>) {
    return this.articlesService.extractArticle(job.data.articleId);
  }
}

@Processor(QUEUE_NAMES.STORY_CLUSTER)
export class StoryClusterProcessor extends WorkerHost {
  constructor(private readonly clusteringService: ClusteringService) {
    super();
  }

  async process(job: Job<StoryClusterJob>) {
    return this.clusteringService.runClustering(job.data.storyId, job.data.articleId);
  }
}

@Processor(QUEUE_NAMES.ARTICLE_ANALYZE)
export class ArticleAnalyzeProcessor extends WorkerHost {
  constructor(private readonly analysisService: AnalysisService) {
    super();
  }

  async process(job: Job<ArticleAnalyzeJob>) {
    return this.analysisService.analyzeArticle(job.data.storyId, job.data.articleId, { force: true });
  }
}

@Processor(QUEUE_NAMES.STORY_AGGREGATE)
export class StoryAggregateProcessor extends WorkerHost {
  constructor(private readonly aggregationService: AggregationService) {
    super();
  }

  async process(job: Job<StoryAggregateJob>) {
    return this.aggregationService.aggregateStory(job.data.storyId, { force: true });
  }
}
