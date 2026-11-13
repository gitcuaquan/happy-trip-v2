import {
  DEFAULT_TTS_VOICE,
  getTtsVoice,
  isRateLimited,
  normalizeTtsText,
  synthesizeSpeech
} from '../../utils/tts'

/**
 * POST /api/ai-voice/tts
 * Body: { text: string, voice?: string }
 * Trả về audio/mpeg giọng nữ tiếng Việt để client phát trực tiếp.
 */
export default defineEventHandler(async (event) => {
  const ip =
    getRequestIP(event, { xForwardedFor: true }) ||
    getHeader(event, 'x-forwarded-for') ||
    'local'

  if (isRateLimited(ip)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Hệ thống đang giới hạn số lần đọc. Vui lòng thử lại sau giây lát.'
    })
  }

  const body = await readBody<{ text?: string, voice?: string }>(event).catch(
    () => ({}) as { text?: string, voice?: string }
  )
  const text = normalizeTtsText(body?.text)

  if (!text) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Thiếu nội dung cần đọc.'
    })
  }

  const voice = (body?.voice || '').trim() || getTtsVoice() || DEFAULT_TTS_VOICE
  const result = await synthesizeSpeech(text, voice)

  if (!result) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Không tổng hợp được giọng đọc tiếng Việt. Vui lòng thử lại.'
    })
  }

  setHeader(event, 'Content-Type', 'audio/mpeg')
  setHeader(event, 'Content-Length', result.audio.length)
  setHeader(event, 'Cache-Control', 'public, max-age=86400')
  setHeader(event, 'X-TTS-Provider', result.provider)
  setHeader(event, 'X-TTS-Cached', result.cached ? '1' : '0')

  return result.audio
})