import { IsBoolean, IsOptional } from 'class-validator';

export class AnalyzeArticleDto {
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
