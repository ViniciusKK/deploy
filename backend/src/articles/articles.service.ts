import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CreateManualArticleDto } from './dto/create-manual-article.dto';
import { UpsertArticleRawTextDto } from './dto/upsert-article-raw-text.dto';
import { ArticleExtractJob, QUEUE_NAMES } from '../common/pipeline.constants';
import { normalizeWhitespace, stripHtmlTags } from '../common/text.utils';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.ARTICLE_EXTRACT)
    private readonly articleExtractQueue: Queue<ArticleExtractJob>,
  ) {}

  async createManualArticle(dto: CreateManualArticleDto) {
    const publisher = await this.prisma.publisher.upsert({
      where: { domain: dto.publisherDomain },
      update: {
        name: dto.publisherName,
        biasLabel: dto.biasLabel,
        biasScore: dto.biasScore,
      },
      create: {
        name: dto.publisherName,
        domain: dto.publisherDomain,
        biasLabel: dto.biasLabel,
        biasScore: dto.biasScore,
      },
    });

    const article = await this.prisma.article.create({
      data: {
        publisherId: publisher.id,
        url: dto.url,
        title: dto.title,
      },
      include: {
        publisher: true,
      },
    });

    if (dto.rawHtml || dto.rawText) {
      await this.prisma.articleRawContent.create({
        data: {
          articleId: article.id,
          rawHtml: dto.rawHtml,
          extractedText: dto.rawText ? normalizeWhitespace(dto.rawText) : undefined,
        },
      });

      await this.articleExtractQueue.add('extract-article', { articleId: article.id });
    }

    return this.getArticleById(article.id);
  }

  async upsertRawText(articleId: string, dto: UpsertArticleRawTextDto) {
    await this.ensureArticle(articleId);

    if (!dto.rawHtml && !dto.rawText) {
      throw new BadRequestException('rawHtml or rawText is required.');
    }

    const rawContent = await this.prisma.articleRawContent.upsert({
      where: { articleId },
      update: {
        rawHtml: dto.rawHtml,
        extractedText: dto.rawText ? normalizeWhitespace(dto.rawText) : undefined,
      },
      create: {
        articleId,
        rawHtml: dto.rawHtml,
        extractedText: dto.rawText ? normalizeWhitespace(dto.rawText) : undefined,
      },
    });

    await this.prisma.article.update({
      where: { id: articleId },
      data: {
        extractionStatus: 'PENDING',
        analysisStatus: 'PENDING',
      },
    });

    return rawContent;
  }

  async extractArticle(articleId: string) {
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

    if (!article.rawContent) {
      throw new BadRequestException(`Article ${articleId} has no raw content.`);
    }

    const extractedText = article.rawContent.extractedText
      ? normalizeWhitespace(article.rawContent.extractedText)
      : article.rawContent.rawHtml
        ? stripHtmlTags(article.rawContent.rawHtml)
        : '';

    if (!extractedText) {
      await this.prisma.article.update({
        where: { id: articleId },
        data: {
          extractionStatus: 'FAILED',
        },
      });

      throw new BadRequestException(`Article ${articleId} could not be extracted.`);
    }

    await this.prisma.articleRawContent.update({
      where: { articleId },
      data: {
        extractedText,
      },
    });

    await this.prisma.article.update({
      where: { id: articleId },
      data: {
        extractionStatus: 'READY',
        analysisStatus: 'PENDING',
      },
    });

    return this.getArticleById(articleId);
  }

  async getArticleById(articleId: string) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: {
        publisher: true,
        rawContent: true,
        storyLinks: true,
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!article) {
      throw new NotFoundException(`Article ${articleId} not found.`);
    }

    return article;
  }

  private async ensureArticle(articleId: string) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException(`Article ${articleId} not found.`);
    }
  }
}
