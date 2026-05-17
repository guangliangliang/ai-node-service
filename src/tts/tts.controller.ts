import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StreamableFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiProduces } from '@nestjs/swagger';
import { TtsService } from './tts.service';
import { SynthesizeDto } from './dto/synthesize.dto';

@ApiTags('TTS')
@Controller('tts')
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  @Post('synthesize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '文字转语音', description: '将文本转换为 MP3 音频，使用 Edge-TTS' })
  @ApiProduces('audio/mpeg')
  async synthesize(@Body() dto: SynthesizeDto): Promise<StreamableFile> {
    const audioBuffer = await this.ttsService.synthesize(dto.text, {
      voice: dto.voice,
      lang: dto.lang,
      rate: dto.rate,
      volume: dto.volume,
      pitch: dto.pitch,
    });

    return new StreamableFile(audioBuffer, {
      type: 'audio/mpeg',
      disposition: 'inline',
    });
  }

  @Get('voices/zh')
  @ApiOperation({ summary: '获取中文语音列表', description: '获取 Edge-TTS 支持的中文语音列表，返回中文名称和性别' })
  async listChineseVoices() {
    const voices = await this.ttsService.listChineseVoices();
    return { voices, count: voices.length };
  }

  @Get('voices')
  @ApiOperation({ summary: '获取所有语音列表', description: '获取 Edge-TTS 支持的所有语音列表，可通过 locale 筛选' })
  async listVoices(@Query('locale') locale?: string) {
    const voices = await this.ttsService.listVoices(locale);
    return { voices, count: voices.length };
  }
}
