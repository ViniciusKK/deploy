import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AggregateStoryDto } from './dto/aggregate-story.dto';

interface DistributionSnapshot {
  totalArticles: number;
  byPublisher: Record<string, number>;
  byBiasLabel: Record<string, number>;
  byTone: Record<string, number>;
}

interface BlindspotsSnapshot {
  missingBiasLabels: string[];
  uniqueFactsByPublisher: Array<{
    publisher: string;
    facts: string[];
  }>;
}

@Injectable()
export class AggregationService {
  constructor(private readonly prisma: PrismaService) {}

  async aggregateStory(storyId: string, _dto: AggregateStoryDto = {}) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
      include: {
        storyArticleLinks: {
          where: {
            decision: 'MATCH',
          },
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
      },
    });

    if (!story) {
      throw new NotFoundException(`Story ${storyId} not found.`);
    }

    const distribution = this.buildDistribution(story.storyArticleLinks);
    const blindspots = await this.buildBlindspots(story.storyArticleLinks);

    const aggregation = await this.prisma.storyAggregation.create({
      data: {
        storyId,
        distributionJson: distribution as unknown as Prisma.InputJsonValue,
        blindspotsJson: blindspots as unknown as Prisma.InputJsonValue,
      },
    });

    return aggregation;
  }

  async getLatestAggregation(storyId: string) {
    const aggregation = await this.prisma.storyAggregation.findFirst({
      where: { storyId },
      orderBy: { createdAt: 'desc' },
    });

    if (!aggregation) {
      throw new NotFoundException(`No aggregation found for story ${storyId}.`);
    }

    return aggregation;
  }

  private buildDistribution(
    links: Array<{
      article: {
        publisher: {
          name: string;
          biasLabel: string;
        };
        analyses: Array<{
          tone: string;
        }>;
      };
    }>,
  ): DistributionSnapshot {
    const distribution: DistributionSnapshot = {
      totalArticles: links.length,
      byPublisher: {},
      byBiasLabel: {},
      byTone: {},
    };

    for (const link of links) {
      const publisherName = link.article.publisher.name;
      const biasLabel = link.article.publisher.biasLabel;
      const tone = link.article.analyses[0]?.tone ?? 'unknown';

      distribution.byPublisher[publisherName] = (distribution.byPublisher[publisherName] ?? 0) + 1;
      distribution.byBiasLabel[biasLabel] = (distribution.byBiasLabel[biasLabel] ?? 0) + 1;
      distribution.byTone[tone] = (distribution.byTone[tone] ?? 0) + 1;
    }

    return distribution;
  }

  private async buildBlindspots(
    links: Array<{
      article: {
        publisher: {
          name: string;
          biasLabel: string;
        };
        analyses: Array<{
          coreFactsJson: unknown;
        }>;
      };
    }>,
  ): Promise<BlindspotsSnapshot> {
    const publishers = await this.prisma.publisher.findMany({
      select: {
        biasLabel: true,
      },
    });

    const presentBiases = new Set(links.map((link) => link.article.publisher.biasLabel));
    const knownBiases = [...new Set(publishers.map((publisher) => publisher.biasLabel))];
    const missingBiasLabels = knownBiases.filter((bias) => !presentBiases.has(bias));

    const factOwners = new Map<string, Set<string>>();
    for (const link of links) {
      const facts = Array.isArray(link.article.analyses[0]?.coreFactsJson)
        ? link.article.analyses[0].coreFactsJson.filter(
            (fact): fact is string => typeof fact === 'string' && fact.trim().length > 0,
          )
        : [];

      for (const fact of facts) {
        const normalizedFact = fact.trim();
        if (!factOwners.has(normalizedFact)) {
          factOwners.set(normalizedFact, new Set());
        }
        factOwners.get(normalizedFact)?.add(link.article.publisher.name);
      }
    }

    const uniqueFactsByPublisher = links.map((link) => {
      const facts = Array.isArray(link.article.analyses[0]?.coreFactsJson)
        ? link.article.analyses[0].coreFactsJson.filter(
            (fact): fact is string => typeof fact === 'string' && fact.trim().length > 0,
          )
        : [];

      return {
        publisher: link.article.publisher.name,
        facts: facts.filter((fact) => factOwners.get(fact)?.size === 1).slice(0, 5),
      };
    });

    return {
      missingBiasLabels,
      uniqueFactsByPublisher,
    };
  }
}
