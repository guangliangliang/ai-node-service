import { Injectable } from '@nestjs/common';
import { EdgeTTS } from 'node-edge-tts';
import { readFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';

const VOICE_LIST_URL =
  'https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4';

const CN_NAME_MAP: Record<string, string> = {
  'zh-CN-XiaoxiaoNeural': '晓晓',
  'zh-CN-YunxiNeural': '云希',
  'zh-CN-XiaoyiNeural': '晓依',
  'zh-CN-YunjianNeural': '云健',
  'zh-CN-XiaochenNeural': '晓辰',
  'zh-CN-XiaohanNeural': '晓涵',
  'zh-CN-XiaomengNeural': '晓梦',
  'zh-CN-XiaomoNeural': '晓墨',
  'zh-CN-XiaoqiuNeural': '晓秋',
  'zh-CN-XiaoruiNeural': '晓睿',
  'zh-CN-XiaoshuangNeural': '晓双',
  'zh-CN-XiaoxuanNeural': '晓萱',
  'zh-CN-XiaoyanNeural': '晓妍',
  'zh-CN-XiaozhenNeural': '晓甄',
  'zh-CN-YunfengNeural': '云枫',
  'zh-CN-YunhaoNeural': '云皓',
  'zh-CN-YunxiaNeural': '云夏',
  'zh-CN-YunyangNeural': '云扬',
  'zh-CN-YunzeNeural': '云泽',
  'zh-CN-liaoning-XiaobeiNeural': '晓北',
  'zh-CN-shaanxi-XiaoniNeural': '晓妮',
  'zh-HK-HiuGaaiNeural': '曉佳',
  'zh-HK-HiuMaanNeural': '曉曼',
  'zh-HK-WanLungNeural': '雲龍',
  'zh-TW-HsiaoChenNeural': '曉臻',
  'zh-TW-HsiaoYuNeural': '曉雨',
  'zh-TW-YunJheNeural': '雲哲',
};

const ZH_LOCALES = ['zh-CN', 'zh-HK', 'zh-TW', 'zh-CN-liaoning', 'zh-CN-shaanxi'];

const LOCALE_NAME_MAP: Record<string, string> = {
  'zh-CN': '中国大陆',
  'zh-HK': '中国香港',
  'zh-TW': '中国台湾',
  'zh-CN-liaoning': '辽宁方言',
  'zh-CN-shaanxi': '陕西方言',
};

const CATEGORY_MAP: Record<string, string> = {
  General: '通用',
  News: '新闻',
  Novel: '小说',
  Cartoon: '动漫',
  Sports: '体育',
  Conversation: '对话',
  Copilot: '助手',
  Dialect: '方言',
};

const PERSONALITY_MAP: Record<string, string> = {
  Approachable: '亲切',
  Authentic: '真诚',
  Authority: '权威',
  Bright: '明亮',
  Caring: '关怀',
  Casual: '休闲',
  Cheerful: '开朗',
  Clear: '清晰',
  Comfort: '舒适',
  Confident: '自信',
  Considerate: '体贴',
  Conversational: '健谈',
  Cute: '可爱',
  Expressive: '富有表现力',
  Friendly: '友好',
  Honest: '诚实',
  Humorous: '幽默',
  Lively: '活泼',
  Passion: '热情',
  Pleasant: '愉快',
  Positive: '积极',
  Professional: '专业',
  Rational: '理性',
  Reliable: '可靠',
  Sincere: '真挚',
  Sunshine: '阳光',
  Warm: '温暖',
};

function translateVoiceTag(tag: any) {
  return {
    ContentCategories: (tag?.ContentCategories || []).map(
      (c: string) => CATEGORY_MAP[c.trim()] || c,
    ),
    VoicePersonalities: (tag?.VoicePersonalities || []).map(
      (p: string) => PERSONALITY_MAP[p.trim()] || p,
    ),
  };
}

@Injectable()
export class TtsService {
  private tmpDir = join(tmpdir(), 'ai-node-service-tts');

  constructor() {
    if (!existsSync(this.tmpDir)) {
      mkdirSync(this.tmpDir, { recursive: true });
    }
  }

  async synthesize(
    text: string,
    options?: {
      voice?: string;
      lang?: string;
      rate?: string;
      volume?: string;
      pitch?: string;
    },
  ): Promise<Buffer> {
    const filename = `${uuidv4()}.mp3`;
    const filePath = join(this.tmpDir, filename);

    const tts = new EdgeTTS({
      voice: options?.voice || 'zh-CN-XiaoxiaoNeural',
      lang: options?.lang || 'zh-CN',
      rate: options?.rate || 'default',
      volume: options?.volume || 'default',
      pitch: options?.pitch || 'default',
    });

    try {
      await tts.ttsPromise(text, filePath);
      return readFileSync(filePath);
    } finally {
      try {
        unlinkSync(filePath);
      } catch {}
    }
  }

  async listVoices(locale?: string) {
    const resp = await fetch(VOICE_LIST_URL);
    const voices = (await resp.json()) as any[];
    const filtered = locale ? voices.filter((v) => v.Locale.startsWith(locale)) : voices;
    return filtered.map((v) => ({
      ShortName: v.ShortName,
      Gender: v.Gender,
      Locale: v.Locale,
      FriendlyName: v.FriendlyName,
      VoiceTag: v.VoiceTag,
    }));
  }

  async listChineseVoices() {
    const resp = await fetch(VOICE_LIST_URL);
    const voices = (await resp.json()) as any[];
    return voices
      .filter((v) => ZH_LOCALES.some((l) => v.Locale === l))
      .map((v) => ({
        ShortName: v.ShortName,
        Name: CN_NAME_MAP[v.ShortName] || v.FriendlyName,
        Gender: v.Gender === 'Female' ? '女' : '男',
        Locale: v.Locale,
        LocaleName: LOCALE_NAME_MAP[v.Locale] || v.Locale,
        VoiceTag: translateVoiceTag(v.VoiceTag),
      }));
  }
}
