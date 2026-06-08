import { Controller, Get, Param } from '@nestjs/common';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get('homepage')
  getHomepage() {
    return this.feedService.buildHomepage();
  }

  @Get('story/:id')
  getStoryComparison(@Param('id') id: string) {
    return this.feedService.buildStoryComparison(id);
  }
}
