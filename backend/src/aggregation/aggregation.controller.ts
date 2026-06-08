import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AggregationService } from './aggregation.service';
import { AggregateStoryDto } from './dto/aggregate-story.dto';

@Controller('stories')
export class AggregationController {
  constructor(private readonly aggregationService: AggregationService) {}

  @Post(':id/aggregate')
  aggregate(@Param('id') storyId: string, @Body() dto: AggregateStoryDto) {
    return this.aggregationService.aggregateStory(storyId, dto);
  }

  @Get(':id/aggregation')
  getAggregation(@Param('id') storyId: string) {
    return this.aggregationService.getLatestAggregation(storyId);
  }
}
