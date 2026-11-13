export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const apiKey = (config.openaiApiKey || process.env.NUXT_OPENAI_API_KEY || '').trim()
  const hasOpenAIKey = !!apiKey && apiKey.length > 5

  return {
    live: hasOpenAIKey,
    hasOpenAIKey,
    mode: hasOpenAIKey ? 'live' : 'demo',
    model: hasOpenAIKey ? 'gpt-live-1 / gpt-4.1-mini' : 'demo-simulator',
    message: hasOpenAIKey
      ? 'Đang chạy chế độ OpenAI Realtime WebRTC'
      : 'Đang chạy chế độ Demo tương tác (Web Speech API / Fallback)'
  }
})
