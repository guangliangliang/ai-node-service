import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { OcrService } from './ocr.service';
import { RecognizeDto, RecognizeResponse } from './dto/recognize.dto';

const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/bmp',
];

@ApiTags('OCR')
@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('recognize')
  @ApiOperation({ summary: '图片文字识别', description: '上传图片，使用 Tesseract.js 识别图片中的文字' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: '图片文件（jpeg/png/webp/bmp，最大 10MB）' },
        language: { type: 'string', description: 'OCR 语言', example: 'chi_sim+eng' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  async recognize(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: RecognizeDto,
  ): Promise<RecognizeResponse> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported image format: ${file.mimetype}. Supported: ${ALLOWED_MIMES.join(', ')}`,
      );
    }

    return this.ocrService.recognize(file.buffer, dto.language);
  }
}
