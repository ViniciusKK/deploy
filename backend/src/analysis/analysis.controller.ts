import { Body, Controller, Param, Post } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalyzeArticleDto } from './dto/analyze-article.dto';

@Controller('stories')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post(':storyId/articles/:articleId/analyze')
  analyze(
    @Param('storyId') storyId: string,
    @Param('articleId') articleId: string,
    @Body() dto: AnalyzeArticleDto,
  ) {
    return this.analysisService.analyzeArticle(storyId, articleId, dto);
  }
}
