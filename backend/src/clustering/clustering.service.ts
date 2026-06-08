import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ClusterArticleDto } from './dto/cluster-article.dto';
import {
  ArticleAnalyzeJob,
  LinkDecisionValue,
  QUEUE_NAMES,
} from '../common/pipeline.constants';
import { keywordOverlap, tokenize, uniqueTokens } from '../common/text.utils';

@Injectable()
export class ClusteringService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.ARTICLE_ANALYZE)
    private readonly articleAnalyzeQueue: Queue<ArticleAnalyzeJob>,
  ) {}

  async runClustering(storyId: string, articleId: string, dto: ClusterArticleDto = {}) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });
    if (!story) {
      throw new NotFoundException(`Story ${storyId} not found.`);
    }

    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: {
        rawContent: true,
        publisher: true,
      },
    });
    if (!article) {
      throw new NotFoundException(`Article ${articleId} not found.`);
    }

    const automated = this.buildAutomatedDecision({
      storyTitle: story.title,
      storySummary: story.canonicalSummary,
      seedKeywords: Array.isArray(story.seedKeywordsJson) ? story.seedKeywordsJson : [],
      articleTitle: article.title,
      articleText: article.rawContent?.extractedText ?? '',
    });

    const decision = dto.overrideDecision ?? automated.decision;
    const rationale = dto.rationale ?? automated.rationale;

    const link = await this.prisma.storyArticleLink.upsert({
      where: {
        storyId_articleId: {
          storyId,
          articleId,
        },
      },
      update: {
        decision,
        rationale,
      },
      create: {
        storyId,
        articleId,
        decision,
        rationale,
      },
    });

    await this.prisma.article.update({
      where: { id: articleId },
      data: {
        clusterStatus: this.mapClusterStatus(decision),
        analysisStatus: decision === 'MATCH' ? 'PENDING' : undefined,
      },
    });

    if (decision === 'MATCH') {
      await this.articleAnalyzeQueue.add('analyze-article', { storyId, articleId });
    }

    return {
      link,
      automated,
    };
  }

  private buildAutomatedDecision(input: {
    storyTitle: string;
    storySummary?: string | null;
    seedKeywords: unknown[];
    articleTitle: string;
    articleText: string;
  }): { decision: LinkDecisionValue; rationale: string; overlap: string[] } {
    const storyKeywords = uniqueTokens([
      ...input.seedKeywords.filter((value): value is string => typeof value === 'string'),
      ...tokenize(`${input.storyTitle} ${input.storySummary ?? ''}`),
    ]);
    const articleTokens = uniqueTokens(tokenize(`${input.articleTitle} ${input.articleText}`));
    const overlap = keywordOverlap(storyKeywords, articleTokens);

    if (overlap.length >= 3) {
      return {
        decision: 'MATCH',
        rationale: `Matched by keyword overlap: ${overlap.slice(0, 6).join(', ')}.`,
        overlap,
      };
    }

    if (overlap.length >= 1) {
      return {
        decision: 'NEEDS_REVIEW',
        rationale: `Partial overlap found: ${overlap.slice(0, 6).join(', ')}.`,
        overlap,
      };
    }

    return {
      decision: 'NO_MATCH',
      rationale: 'No relevant overlap found between story seed keywords and article text.',
      overlap,
    };
  }

  private mapClusterStatus(decision: LinkDecisionValue): 'LINKED' | 'REJECTED' | 'PENDING' {
    if (decision === 'MATCH') {
      return 'LINKED';
    }

    if (decision === 'NO_MATCH') {
      return 'REJECTED';
    }

    return 'PENDING';
  }
}
