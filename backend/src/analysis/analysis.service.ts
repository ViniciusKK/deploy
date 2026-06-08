import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAiService } from '../openai/openai.service';
import { AnalyzeArticleDto } from './dto/analyze-article.dto';
import { QUEUE_NAMES, StoryAggregateJob } from '../common/pipeline.constants';

@Injectable()
export class AnalysisService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly openAiService: OpenAiService,
    @InjectQueue(QUEUE_NAMES.STORY_AGGREGATE)
    private readonly storyAggregateQueue: Queue<StoryAggregateJob>,
  ) {}

  async analyzeArticle(storyId: string, articleId: string, dto: AnalyzeArticleDto = {}) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });
    if (!story) {
      throw new NotFoundException(`Story ${storyId} not found.`);
    }

    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: {
        publisher: true,
        rawContent: true,
        storyLinks: {
          where: {
            storyId,
          },
        },
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    if (!article) {
      throw new NotFoundException(`Article ${articleId} not found.`);
    }

    const storyLink = article.storyLinks[0];
    if (!storyLink || storyLink.decision === 'NO_MATCH') {
      throw new BadRequestException(`Article ${articleId} is not linked to story ${storyId}.`);
    }

    if (!article.rawContent?.extractedText) {
      throw new BadRequestException(`Article ${articleId} has no extracted text.`);
    }

    if (!dto.force && article.analyses[0]) {
      return article.analyses[0];
    }

    const result = await this.openAiService.analyzeArticle({
      storyTitle: story.title,
      storySummary: story.canonicalSummary,
      publisherName: article.publisher.name,
      publisherBiasLabel: article.publisher.biasLabel,
      articleTitle: article.title,
      articleText: article.rawContent.extractedText,
    });

    const existing = await this.prisma.articleAnalysis.findFirst({
      where: { articleId },
      orderBy: { createdAt: 'desc' },
    });

    const framingSignalsPayload = { editorialReading: result.editorialReading };

    const analysis = existing
      ? await this.prisma.articleAnalysis.update({
          where: { id: existing.id },
          data: {
            coreFactsJson: result.coreFacts,
            framingSignalsJson: framingSignalsPayload,
            tone: result.tone,
          },
        })
      : await this.prisma.articleAnalysis.create({
          data: {
            articleId,
            coreFactsJson: result.coreFacts,
            framingSignalsJson: framingSignalsPayload,
            tone: result.tone,
          },
        });

    await this.prisma.article.update({
      where: { id: articleId },
      data: {
        analysisStatus: 'READY',
      },
    });

    await this.storyAggregateQueue.add('aggregate-story', { storyId });
    return analysis;
  }
}
