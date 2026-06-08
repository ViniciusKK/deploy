import { IsNumber, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';

export class CreateManualArticleDto {
  @IsString()
  @MaxLength(200)
  publisherName!: string;

  @IsString()
  @MaxLength(200)
  publisherDomain!: string;

  @IsString()
  @MaxLength(60)
  biasLabel!: string;

  @IsNumber()
  @Min(-1)
  biasScore!: number;

  @IsUrl()
  url!: string;

  @IsString()
  @MaxLength(300)
  title!: string;

  @IsOptional()
  @IsString()
  rawHtml?: string;

  @IsOptional()
  @IsString()
  rawText?: string;
}
