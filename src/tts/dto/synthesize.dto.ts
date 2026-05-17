import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SynthesizeDto {
  @ApiProperty({ description: '要转换的文本', example: '你好世界' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ description: '语音名称', example: 'zh-CN-XiaoxiaoNeural', default: 'zh-CN-XiaoxiaoNeural' })
  @IsOptional()
  @IsString()
  voice?: string;

  @ApiPropertyOptional({ description: '语言代码', example: 'zh-CN', default: 'zh-CN' })
  @IsOptional()
  @IsString()
  lang?: string;

  @ApiPropertyOptional({ description: '语速，如 +10%、-10%、default', example: 'default', default: 'default' })
  @IsOptional()
  @IsString()
  rate?: string;

  @ApiPropertyOptional({ description: '音量，如 +50%、-50%、default', example: 'default', default: 'default' })
  @IsOptional()
  @IsString()
  volume?: string;

  @ApiPropertyOptional({ description: '音调，如 +10Hz、-10Hz、default', example: 'default', default: 'default' })
  @IsOptional()
  @IsString()
  pitch?: string;
}
