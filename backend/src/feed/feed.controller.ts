import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { FeedService } from './feed.service';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get('homepage')
  getHomepage(@Query('date') date?: string) {
    if (date && !DATE_RE.test(date)) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD.');
    }
    return this.feedService.buildHomepage(date);
  }

  @Get('available-dates')
  getAvailableDates() {
    return this.feedService.getAvailableDates();
  }

  @Get('story/:id')
  getStoryComparison(@Param('id') id: string) {
    return this.feedService.buildStoryComparison(id);
  }
}
