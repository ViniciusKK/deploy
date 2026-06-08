import { IsOptional, IsString } from 'class-validator';

export class UpsertArticleRawTextDto {
  @IsOptional()
  @IsString()
  rawHtml?: string;

  @IsOptional()
  @IsString()
  rawText?: string;
}
