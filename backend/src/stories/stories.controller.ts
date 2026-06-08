import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateStoryDto } from './dto/create-story.dto';
import { StoriesService } from './stories.service';

@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Post()
  create(@Body() dto: CreateStoryDto) {
    return this.storiesService.createStory(dto);
  }

  @Get()
  list() {
    return this.storiesService.listStories();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.storiesService.getStoryById(id);
  }
}
