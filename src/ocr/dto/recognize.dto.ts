import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RecognizeDto {
  @ApiPropertyOptional({ description: 'OCR 语言，如 chi_sim+eng（中英）、eng、jpn', example: 'chi_sim+eng', default: 'chi_sim+eng' })
  @IsOptional()
  @IsString()
  language?: string;
}

export class RecognizeResponse {
  @ApiPropertyOptional({ description: '识别出的文本' })
  text: string;

  @ApiPropertyOptional({ description: '使用的语言' })
  language: string;

  @ApiPropertyOptional({ description: '识别置信度（0-100）' })
  confidence: number;
}
