import OpenAI from 'openai'
import { getLiveSystemPrompt } from '../../utils/trip-prompt'

const recentStarts: number[] = []
const WINDOW_MS = 60 * 60 * 1000 // 1 giờ
const COOLDOWN_MS = 10 * 1000 // 10 giây
const MAX_STARTS = 20

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const apiKey = (config.openaiApiKey || process.env.NUXT_OPENAI_API_KEY || '').trim()

  // 1. Nếu chưa có OpenAI API Key -> Trả về JSON báo chế độ Demo mượt mà không crash
  if (!apiKey || apiKey.length < 5) {
    return {
      demo: true,
      message: 'Chưa có NUXT_OPENAI_API_KEY trên server. Kích hoạt chế độ Demo nhận diện giọng nói qua trình duyệt (Web Speech API).'
    }
  }

  // 2. Đọc SDP offer từ client (hỗ trợ cả text/plain, application/sdp và application/json)
  let sdpOffer = ''
  const contentType = getHeader(event, 'content-type') || ''

  if (contentType.includes('application/json')) {
    const body = await readBody(event)
    sdpOffer = typeof body === 'object' ? (body?.sdp || '') : String(body || '')
  } else {
    sdpOffer = (await readRawBody(event, 'utf-8')) || ''
  }

  if (typeof sdpOffer !== 'string' || !sdpOffer.includes('v=0')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'SDP offer không hợp lệ.'
    })
  }

  // 3. Rate limiting và Cooldown
  const now = Date.now()
  while (recentStarts.length && (recentStarts[0] ?? 0) < now - WINDOW_MS) {
    recentStarts.shift()
  }
  const lastStart = recentStarts.length > 0 ? recentStarts[recentStarts.length - 1] : undefined
  if (
    recentStarts.length >= MAX_STARTS ||
    (lastStart !== undefined && now - lastStart < COOLDOWN_MS)
  ) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Hệ thống đang giới hạn số lần kết nối Realtime. Quý khách vui lòng thử lại sau giây lát.'
    })
  }
  recentStarts.push(now)

  // 4. Khởi tạo WebRTC session với OpenAI Live API (gpt-live-1)
  try {
    const client = new OpenAI({ apiKey })
    const instructions = getLiveSystemPrompt()

    // OpenAI Realtime / Live WebRTC creation
    const liveClient = (client as any).live
    if (!liveClient || typeof liveClient.create !== 'function') {
      throw new Error('OpenAI SDK hiện tại không hỗ trợ endpoint live.create WebRTC')
    }

    const result = await liveClient.create({
      session: {
        model: 'gpt-live-1',
        store: false,
        instructions
      },
      transport: {
        type: 'webrtc',
        sdp: sdpOffer
      }
    })

    const answerSdp = result?.transport?.sdp
    if (!answerSdp) {
      throw new Error('OpenAI Live API không trả về SDP answer.')
    }

    const acceptHeader = getHeader(event, 'accept') || ''
    if (acceptHeader.includes('application/json')) {
      return {
        demo: false,
        sdp: answerSdp
      }
    }

    setHeader(event, 'Content-Type', 'application/sdp')
    return answerSdp
  } catch (err: any) {
    console.error('[SessionLiveAPI] Error connecting to OpenAI Live:', err.message)
    const statusCode = err.status && err.status >= 400 && err.status < 500 ? err.status : 502
    throw createError({
      statusCode,
      statusMessage: err.message || 'Không thể tạo phiên kết nối AI Voice Live với OpenAI.'
    })
  }
})
