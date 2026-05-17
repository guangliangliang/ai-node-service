import { Injectable } from '@nestjs/common';
import { createWorker, Worker } from 'tesseract.js';

@Injectable()
export class OcrService {
  private worker: Worker | null = null;
  private initPromise: Promise<void> | null = null;

  private async ensureWorker(language: string): Promise<Worker> {
    if (this.worker && language === 'chi_sim+eng') {
      return this.worker;
    }

    if (language !== 'chi_sim+eng' && this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }

    if (!this.initPromise) {
      this.initPromise = createWorker(language).then((w) => {
        this.worker = w;
        this.initPromise = null;
      });
    }

    await this.initPromise;
    return this.worker!;
  }

  async recognize(
    imageBuffer: Buffer,
    language?: string,
  ): Promise<{ text: string; language: string; confidence: number }> {
    const lang = language || 'chi_sim+eng';
    const worker = await this.ensureWorker(lang);
    const { data } = await worker.recognize(imageBuffer);
    return {
      text: data.text.trim(),
      language: lang,
      confidence: data.confidence,
    };
  }
}
