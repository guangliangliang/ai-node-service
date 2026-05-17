# AI Node Service

AI 相关后端服务，基于 NestJS + TypeScript。

## 功能

| 模块 | 功能 | 方案 | 需要 Key |
|------|------|------|----------|
| TTS | 文字转语音 | node-edge-tts | 不需要 |
| OCR | 图片文字识别 | Tesseract.js | 不需要 |

## API

| 端点 | 方法 | 功能 | 输入 | 输出 |
|------|------|------|------|------|
| `/api/tts/synthesize` | POST | 文字转语音 | `{ text, voice?, lang?, rate?, volume?, pitch? }` | audio/mpeg |
| `/api/tts/voices` | GET | 获取可用语音列表 | query: locale? | `{ voices, count }` |
| `/api/ocr/recognize` | POST | 图片文字识别 | multipart: image file, language? | `{ text, language, confidence }` |

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式启动
npm run start:dev

# 生产模式
npm run build && npm run start:prod
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务端口 | 3000 |

## 前置要求

- Node.js 18+（推荐 20 LTS，不推荐 22+ 有 TS 兼容问题）

## TTS 可用中文语音

常用：`zh-CN-XiaoxiaoNeural`（默认）、`zh-CN-YunxiNeural`（男声）、`zh-CN-XiaoyiNeural`

完整列表可通过 `GET /api/tts/voices?locale=zh` 获取。

## OCR 支持的语言

默认使用 `chi_sim+eng`（中文简体+英文），也可指定其他语言如 `eng`、`jpn`、`kor` 等。
