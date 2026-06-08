import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { QUEUE_NAMES, StoryDiscoveryJob } from '../common/pipeline.constants';
import { tokenize, uniqueTokens } from '../common/text.utils';

@Injectable()
export class StoriesService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.STORY_DISCOVERY)
    private readonly storyDiscoveryQueue: Queue<StoryDiscoveryJob>,
  ) {}

  async createStory(dto: CreateStoryDto) {
    const story = await this.prisma.story.create({
      data: {
        title: dto.title,
        canonicalSummary: dto.canonicalSummary,
        seedKeywordsJson: this.buildSeedKeywords(dto),
      },
    });

    await this.storyDiscoveryQueue.add('discover-story', { storyId: story.id });
    return story;
  }

  async listStories() {
    return this.prisma.story.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        storyArticleLinks: {
          include: {
            article: {
              include: {
                publisher: true,
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
  }

  async getStoryById(id: string) {
    const story = await this.prisma.story.findUnique({
      where: { id },
      include: {
        candidateArticles: {
          include: {
            publisher: true,
          },
        },
        storyArticleLinks: {
          include: {
            article: {
              include: {
                publisher: true,
                rawContent: true,
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
          take: 5,
        },
      },
    });

    if (!story) {
      throw new NotFoundException(`Story ${id} not found.`);
    }

    return story;
  }

  private buildSeedKeywords(dto: CreateStoryDto): string[] {
    const provided = dto.seedKeywords ?? [];
    const derived = tokenize(`${dto.title} ${dto.canonicalSummary ?? ''}`);
    return uniqueTokens([...provided.map((item) => item.toLowerCase()), ...derived]).slice(0, 20);
  }
}
