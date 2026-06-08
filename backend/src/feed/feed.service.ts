import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface FeedSource {
  articleId: string;
  publisherName: string;
  publisherDomain: string;
  biasLabel: string;
  biasScore: number;
  tone: string | null;
  url: string;
  title: string;
}

export interface FeedStory {
  id: string;
  title: string;
  summary: string | null;
  sourceCount: number;
  sources: FeedSource[];
  biasDistribution: Record<string, number>;
  toneDistribution: Record<string, number>;
  missingBiasLabels: string[];
  uniqueFactsByPublisher: Array<{ publisher: string; facts: string[] }>;
  publishedAt: string;
}

export interface FeedDispatch {
  articleId: string;
  storyId: string;
  storyTitle: string;
  title: string;
  publisherName: string;
  publisherDomain: string;
  biasLabel: string;
  publishedAt: string;
}

interface DistributionSnapshot {
  totalArticles?: number;
  byPublisher?: Record<string, number>;
  byBiasLabel?: Record<string, number>;
  byTone?: Record<string, number>;
}

interface BlindspotsSnapshot {
  missingBiasLabels?: string[];
  uniqueFactsByPublisher?: Array<{ publisher: string; facts: string[] }>;
}

export interface ComparisonPerspective {
  articleId: string;
  publisherName: string;
  publisherDomain: string;
  biasLabel: string;
  biasScore: number;
  tone: string | null;
  url: string;
  title: string;
  coreFacts: string[];
  editorialReading: string | null;
  excerpt: string | null;
}

export interface StoryComparison {
  id: string;
  title: string;
  summary: string | null;
  publishedAt: string;
  sourceCount: number;
  biasDistribution: Record<string, number>;
  toneDistribution: Record<string, number>;
  missingBiasLabels: string[];
  uniqueFactsByPublisher: Array<{ publisher: string; facts: string[] }>;
  perspectives: ComparisonPerspective[];
  sharedFacts: string[];
}

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailableDates(): Promise<string[]> {
    const stories = await this.prisma.story.findMany({
      select: { createdAt: true },
      where: { storyArticleLinks: { some: { decision: 'MATCH' } } },
    });
    const dateSet = new Set(stories.map((s) => s.createdAt.toISOString().slice(0, 10)));
    return [...dateSet].sort().reverse();
  }

  async buildHomepage(date?: string) {
    const targetDate = date ?? new Date().toISOString().slice(0, 10);
    const gte = new Date(`${targetDate}T00:00:00.000Z`);
    const lt = new Date(gte);
    lt.setUTCDate(lt.getUTCDate() + 1);

    const stories = await this.prisma.story.findMany({
      where: { createdAt: { gte, lt } },
      orderBy: { createdAt: 'desc' },
      include: {
        storyArticleLinks: {
          where: { decision: 'MATCH' },
          include: {
            article: {
              include: {
                publisher: true,
                analyses: {
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
        aggregations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const feedStories: FeedStory[] = stories.map((story) => {
      const sources: FeedSource[] = story.storyArticleLinks.map((link) => ({
        articleId: link.article.id,
        publisherName: link.article.publisher.name,
        publisherDomain: link.article.publisher.domain,
        biasLabel: link.article.publisher.biasLabel,
        biasScore: link.article.publisher.biasScore,
        tone: link.article.analyses[0]?.tone ?? null,
        url: link.article.url,
        title: link.article.title,
      }));

      const latest = story.aggregations[0];
      const distribution = (latest?.distributionJson as DistributionSnapshot | null) ?? {};
      const blindspots = (latest?.blindspotsJson as BlindspotsSnapshot | null) ?? {};

      return {
        id: story.id,
        title: story.title,
        summary: story.canonicalSummary,
        sourceCount: sources.length,
        sources,
        biasDistribution: distribution.byBiasLabel ?? {},
        toneDistribution: distribution.byTone ?? {},
        missingBiasLabels: blindspots.missingBiasLabels ?? [],
        uniqueFactsByPublisher: blindspots.uniqueFactsByPublisher ?? [],
        publishedAt: story.createdAt.toISOString(),
      };
    });

    const withCoverage = feedStories.filter((s) => s.sourceCount > 0);
    const hero = withCoverage[0] ?? null;
    const comparison = withCoverage.slice(hero ? 1 : 0);

    const dispatches: FeedDispatch[] = withCoverage
      .flatMap((story) =>
        story.sources.map<FeedDispatch>((source) => ({
          articleId: source.articleId,
          storyId: story.id,
          storyTitle: story.title,
          title: source.title,
          publisherName: source.publisherName,
          publisherDomain: source.publisherDomain,
          biasLabel: source.biasLabel,
          publishedAt: story.publishedAt,
        })),
      )
      .slice(0, 6);

    const blindspots = withCoverage
      .filter((story) => story.missingBiasLabels.length > 0)
      .map((story) => ({
        storyId: story.id,
        storyTitle: story.title,
        missingBiasLabels: story.missingBiasLabels,
        coveredBy: story.sources.map((s) => ({
          publisherName: s.publisherName,
          biasLabel: s.biasLabel,
        })),
      }))
      .slice(0, 2);

    return {
      hero,
      comparison,
      dispatches,
      blindspots,
      generatedAt: new Date().toISOString(),
    };
  }

  async buildStoryComparison(storyId: string): Promise<StoryComparison> {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
      include: {
        storyArticleLinks: {
          where: { decision: 'MATCH' },
          include: {
            article: {
              include: {
                publisher: true,
                rawContent: true,
                analyses: { orderBy: { createdAt: 'desc' }, take: 1 },
              },
            },
          },
        },
        aggregations: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!story) {
      throw new NotFoundException(`Story ${storyId} not found.`);
    }

    const perspectives: ComparisonPerspective[] = story.storyArticleLinks.map((link) => {
      const analysis = link.article.analyses[0];
      const coreFacts = Array.isArray(analysis?.coreFactsJson)
        ? (analysis!.coreFactsJson as unknown[]).filter((f): f is string => typeof f === 'string')
        : [];
      const framingPayload = analysis?.framingSignalsJson;
      let editorialReading: string | null = null;
      if (
        framingPayload &&
        typeof framingPayload === 'object' &&
        !Array.isArray(framingPayload) &&
        'editorialReading' in framingPayload &&
        typeof (framingPayload as { editorialReading?: unknown }).editorialReading === 'string'
      ) {
        const value = (framingPayload as { editorialReading: string }).editorialReading.trim();
        editorialReading = value.length > 0 ? value : null;
      }

      const extracted = link.article.rawContent?.extractedText ?? null;
      const excerpt = extracted ? extracted.slice(0, 480) : null;

      return {
        articleId: link.article.id,
        publisherName: link.article.publisher.name,
        publisherDomain: link.article.publisher.domain,
        biasLabel: link.article.publisher.biasLabel,
        biasScore: link.article.publisher.biasScore,
        tone: analysis?.tone ?? null,
        url: link.article.url,
        title: link.article.title,
        coreFacts,
        editorialReading,
        excerpt,
      };
    });

    const factCounts = new Map<string, number>();
    for (const p of perspectives) {
      for (const fact of p.coreFacts) {
        factCounts.set(fact, (factCounts.get(fact) ?? 0) + 1);
      }
    }
    const sharedFacts = [...factCounts.entries()]
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([fact]) => fact)
      .slice(0, 6);

    const latest = story.aggregations[0];
    const distribution = (latest?.distributionJson as DistributionSnapshot | null) ?? {};
    const blindspots = (latest?.blindspotsJson as BlindspotsSnapshot | null) ?? {};

    const biasOrder: Record<string, number> = {
      LEFT: 0,
      LEAN_LEFT: 1,
      CENTER: 2,
      LEAN_RIGHT: 3,
      RIGHT: 4,
    };
    perspectives.sort((a, b) => (biasOrder[a.biasLabel] ?? 99) - (biasOrder[b.biasLabel] ?? 99));

    return {
      id: story.id,
      title: story.title,
      summary: story.canonicalSummary,
      publishedAt: story.createdAt.toISOString(),
      sourceCount: perspectives.length,
      biasDistribution: distribution.byBiasLabel ?? {},
      toneDistribution: distribution.byTone ?? {},
      missingBiasLabels: blindspots.missingBiasLabels ?? [],
      uniqueFactsByPublisher: blindspots.uniqueFactsByPublisher ?? [],
      perspectives,
      sharedFacts,
    };
  }
}
