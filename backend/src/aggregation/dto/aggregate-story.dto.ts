import { IsBoolean, IsOptional } from 'class-validator';

export class AggregateStoryDto {
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
