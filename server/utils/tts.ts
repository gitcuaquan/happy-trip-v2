import { createHash } from 'node:crypto'

/**
 * HUYẾN TẮC TỔNG HỢP GIỌNG ĐỌC TIẾNG VIỆT (NỮ)
 * -------------------------------------------------
 * Trình duyệt trên máy người dùng thường KHÔNG cài giọng tiếng Việt, nên
 * Web Speech API buộc phải dùng giọng en-US -> đọc tiếng Việt rất sai.
 * Vì vậy server tự tổng hợp giọng nữ tiếng Việt thành MP3 và trả về cho client:
 *
 *   1. OpenAI TTS (gpt-4o-mini-tts) khi có NUXT_OPENAI_API_KEY  -> chất lượng cao nhất
 *   2. Google Translate TTS (vi) khi chưa có key                  -> miễn phí, giọng nữ tiếng Việt
 *
 * Client chỉ dùng giọng của trình duyệt làm phương án cuối cùng.
 */

export type TtsProvider = 'openai' | 'google'

const GOOGLE_TTS_ENDPOINT = 'https://translate.google.com/translate_tts'
const OPENAI_TTS_ENDPOINT = 'https://api.openai.com/v1/audio/speech'
const GOOGLE_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const GOOGLE_CHUNK_LIMIT = 180
const REQUEST_TIMEOUT_MS = 20000
const CACHE_TTL_MS = 1000 * 60 * 60 * 6
const CACHE_MAX_ENTRIES = 300

/** Giọng nữ mặc định (OpenAI: coral; Google: luôn là giọng nữ vi-VN) */
export const DEFAULT_TTS_VOICE = 'coral'

const cache = new Map<string, { audio: Buffer; expiresAt: number }>()

/** Lọc và chuẩn hoá văn bản trước khi đọc */
export function normalizeTtsText(input: unknown): string {
  if (typeof input !== 'string') return ''

  return input
    .replace(/<[^>]*>/g, ' ') // bỏ thẻ HTML nếu có
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 600)
}

/**
 * Cắt văn bản thành đoạn nhỏ (Google TTS chỉ nhận ~200 ký tự mỗi request),
 * ưu tiên ngắt theo câu rồi đến dấu phẩy, cuối cùng mới cắt cứng.
 */
export function splitForGoogleTts(text: string, limit = GOOGLE_CHUNK_LIMIT): string[] {
  const clean = text.trim()
  if (!clean) return []
  if (clean.length <= limit) return [clean]

  const chunks: string[] = []
  let current = ''

  const pushWord = (word: string) => {
    if (!word) return
    if ((current + ' ' + word).trim().length > limit) {
      if (current.trim()) chunks.push(current.trim())
      current = word
    } else {
      current = (current + ' ' + word).trim()
    }
  }

  // Ngắt theo câu trước
  const sentences = clean.split(/(?<=[.!?…])\s+/)
  for (const sentence of sentences) {
    if (sentence.length > limit) {
      // Câu quá dài: ngắt tiếp theo dấu phẩy / chấm phẩy
      const parts = sentence.split(/(?<=[,;:])\s+/)
      for (const part of parts) {
        if (part.length > limit) {
          for (const word of part.split(/\s+/)) pushWord(word)
        } else {
          if ((current + ' ' + part).trim().length > limit) {
            if (current.trim()) chunks.push(current.trim())
            current = part
          } else {
            current = (current + ' ' + part).trim()
          }
        }
      }
    } else if ((current + ' ' + sentence).trim().length > limit) {
      if (current.trim()) chunks.push(current.trim())
      current = sentence
    } else {
      current = (current + ' ' + sentence).trim()
    }
  }

  if (current.trim()) chunks.push(current.trim())
  return chunks
}

/** Giọng đọc cấu hình (chỉ áp dụng cho OpenAI TTS) */
export function getTtsVoice(): string {
  const config = useRuntimeConfig()
  return (config.ttsVoice as string || '').trim() || DEFAULT_TTS_VOICE
}

export function getOpenAiApiKey(): string {
  const config = useRuntimeConfig()
  return (config.openaiApiKey || process.env.NUXT_OPENAI_API_KEY || '').trim()
}

export function getTtsProvider(): TtsProvider | 'auto' {
  const config = useRuntimeConfig()
  return ((config.ttsProvider as string) || 'auto').trim() as TtsProvider | 'auto'
}

function readCache(key: string): Buffer | null {
  const hit = cache.get(key)
  if (!hit) return null
  if (hit.expiresAt < Date.now()) {
    cache.delete(key)
    return null
  }
  return hit.audio
}

function writeCache(key: string, audio: Buffer): void {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value
    if (oldestKey) cache.delete(oldestKey)
  }
  cache.set(key, { audio, expiresAt: Date.now() + CACHE_TTL_MS })
}

function cacheKey(text: string, provider: string, voice: string): string {
  return createHash('sha1').update(`${provider}|${voice}|${text}`).digest('hex')
}

/** Tổng hợp giọng đọc qua OpenAI TTS (REST, không cần SDK) */
async function synthesizeWithOpenAI(text: string, voice: string): Promise<Buffer | null> {
  const apiKey = getOpenAiApiKey()
  if (!apiKey || apiKey.length < 5) return null

  try {
    const response = await fetch(OPENAI_TTS_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice,
        input: text,
        response_format: 'mp3',
        instructions:
          'Đọc bằng tiếng Việt (giọng nữ miền Nam), tự nhiên, thân thiện, tốc độ vừa phải, không đọc ký hiệu.'
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    })

    if (!response.ok) {
      console.warn('[TTS] OpenAI trả về lỗi:', response.status, (await response.text()).slice(0, 200))
      return null
    }

    return Buffer.from(await response.arrayBuffer())
  } catch (error: any) {
    console.warn('[TTS] Lỗi gọi OpenAI TTS:', error?.message || error)
    return null
  }
}

/** Tổng hợp giọng nữ tiếng Việt miễn phí qua Google Translate TTS */
async function synthesizeWithGoogle(text: string): Promise<Buffer | null> {
  const chunks = splitForGoogleTts(text)
  if (chunks.length === 0) return null

  const buffers: Buffer[] = []

  try {
    for (const chunk of chunks) {
      const url = new URL(GOOGLE_TTS_ENDPOINT)
      url.searchParams.set('ie', 'UTF-8')
      url.searchParams.set('client', 'tw-ob')
      url.searchParams.set('tl', 'vi')
      url.searchParams.set('q', chunk)

      const response = await fetch(url, {
        headers: {
          'User-Agent': GOOGLE_USER_AGENT,
          Referer: 'https://translate.google.com/'
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      })

      if (!response.ok) {
        console.warn('[TTS] Google TTS trả về lỗi:', response.status)
        return null
      }

      buffers.push(Buffer.from(await response.arrayBuffer()))
    }

    return Buffer.concat(buffers)
  } catch (error: any) {
    console.warn('[TTS] Lỗi gọi Google TTS:', error?.message || error)
    return null
  }
}

export interface TtsResult {
  audio: Buffer
  provider: TtsProvider
  cached: boolean
}

/** Sinh giọng đọc tiếng Việt nữ, có cache theo văn bản */
export async function synthesizeSpeech(text: string, voice = DEFAULT_TTS_VOICE): Promise<TtsResult | null> {
  const clean = normalizeTtsText(text)
  if (!clean) return null

  const configured = getTtsProvider()
  const apiKey = getOpenAiApiKey()

  const order: TtsProvider[] =
    configured === 'openai' || configured === 'google'
      ? [configured]
      : apiKey
        ? ['openai', 'google']
        : ['google']

  for (const provider of order) {
    const key = cacheKey(clean, provider, voice)
    const cached = readCache(key)
    if (cached) return { audio: cached, provider, cached: true }

    const audio = provider === 'openai' ? await synthesizeWithOpenAI(clean, voice) : await synthesizeWithGoogle(clean)
    if (audio && audio.length > 0) {
      writeCache(key, audio)
      return { audio, provider, cached: false }
    }
  }

  return null
}

/**
 * Giới hạn tần suất đơn giản theo IP cho endpoint TTS công khai.
 * Trả về true nếu request bị chặn.
 */
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX = 40
const buckets = new Map<string, { count: number; resetAt: number }>()

export function isRateLimited(identifier: string): boolean {
  const now = Date.now()
  const bucket = buckets.get(identifier)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  bucket.count += 1

  if (buckets.size > 5000) {
    for (const [key, value] of buckets) {
      if (value.resetAt <= now) buckets.delete(key)
    }
  }

  return bucket.count > RATE_LIMIT_MAX
}