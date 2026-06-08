import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStoryDto {
  @IsString()
  @MaxLength(240)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  canonicalSummary?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seedKeywords?: string[];
}
