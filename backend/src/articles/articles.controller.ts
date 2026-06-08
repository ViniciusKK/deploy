import { Body, Controller, Param, Post } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateManualArticleDto } from './dto/create-manual-article.dto';
import { UpsertArticleRawTextDto } from './dto/upsert-article-raw-text.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post('manual')
  createManual(@Body() dto: CreateManualArticleDto) {
    return this.articlesService.createManualArticle(dto);
  }

  @Post(':id/raw-text')
  upsertRawText(@Param('id') id: string, @Body() dto: UpsertArticleRawTextDto) {
    return this.articlesService.upsertRawText(id, dto);
  }

  @Post(':id/extract')
  extract(@Param('id') id: string) {
    return this.articlesService.extractArticle(id);
  }
}
