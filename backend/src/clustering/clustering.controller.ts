import { Body, Controller, Param, Post } from '@nestjs/common';
import { ClusterArticleDto } from './dto/cluster-article.dto';
import { ClusteringService } from './clustering.service';

@Controller('stories')
export class ClusteringController {
  constructor(private readonly clusteringService: ClusteringService) {}

  @Post(':storyId/cluster/:articleId')
  cluster(
    @Param('storyId') storyId: string,
    @Param('articleId') articleId: string,
    @Body() dto: ClusterArticleDto,
  ) {
    return this.clusteringService.runClustering(storyId, articleId, dto);
  }
}
