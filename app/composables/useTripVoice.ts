import { ref, onMounted, onUnmounted } from 'vue'
import { aiVoiceService } from '~/services/ai-voice.service'

export type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'unsupported'
export type VoiceSpeakerMode = 'idle' | 'user' | 'assistant'
export type VoiceServerMode = 'live' | 'demo' | 'checking'
export type VoiceErrorKind = 'not_configured' | 'auth' | 'rate_limited' | 'connection'

export interface VoiceScenario {
  id: string
  title: string
  guest: string
  trip: string
}

export const VOICE_SCENARIOS: Record<string, VoiceScenario> = {
  '1': {
    id: '1',
    title: 'Bàn Cờ ➔ Vũng Tàu (Xe 5 chỗ, sáng mai)',
    guest: 'Dạ cho anh đặt xe đón ở số 3 Nguyễn Thiện Thuật, Phường Bàn Cờ đi Vũng Tàu, sáng mai 7 giờ, nhà có 2 người lớn 2 trẻ em, mang 2 vali vừa, anh chọn xe 5 chỗ.',
    trip: 'Dạ, em ghi nhận xe 5 chỗ đón tại số 3 Nguyễn Thiện Thuật, Phường Bàn Cờ đi Vũng Tàu sáng mai 7:00 cho 2 người lớn, 2 trẻ em ạ.'
  },
  '2': {
    id: '2',
    title: 'Quận 3 ➔ Vũng Tàu (Xe 7 chỗ, 4 khách lớn)',
    guest: 'Tôi muốn đón ở Quận 3 đi Vũng Tàu sáng mai 7 giờ, đoàn có 4 người lớn và 4 vali to, lấy xe 7 chỗ nhé.',
    trip: 'Dạ, 4 người lớn và 4 vali to thì xe 7 chỗ sẽ thoải mái nhất ạ. Em ghi nhận xe 7 chỗ đi Vũng Tàu sáng mai 7:00.'
  },
  '3': {
    id: '3',
    title: 'Bàn Cờ ➔ Vũng Tàu (Chiều nay 14:00)',
    guest: 'Đón anh ở số 6 Nguyễn Thiện Thuật, Phường Bàn Cờ đi Vũng Tàu lúc 14 giờ chiều hôm nay, đi xe 5 chỗ.',
    trip: 'Dạ, em đã ghi nhận xe 5 chỗ đón tại số 6 Nguyễn Thiện Thuật, Phường Bàn Cờ đi Vũng Tàu lúc 14:00 hôm nay ạ.'
  }
}

export const useVoiceModalState = () => useState<boolean>('voice-booking-modal-open', () => false)

export function useTripVoice() {
  // Trạng thái quyền micro
  const permissionStatus = ref<PermissionStatus>('prompt')
  const permissionError = ref<string | null>(null)
  const isPermissionRequested = ref(false)

  // Trạng thái phiên kết nối
  const mode = ref<VoiceServerMode>('checking')
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const isStopping = ref(false)
  const isMuted = ref(false)
  const statusMessage = ref('Sẵn sàng kết nối')

  // Lỗi kết nối trợ lý AI (không tự fallback sang Demo/Web Speech)
  const voiceError = ref<string | null>(null)
  const voiceErrorKind = ref<VoiceErrorKind | null>(null)

  // Transcript hội thoại
  const userTranscript = ref('')
  const assistantTranscript = ref('')
  const inputParts = ref<string[]>([])
  const outputParts = ref<string[]>([])

  // Âm thanh và visualizer
  const audioLevel = ref(0) // 0 đến 100
  const waveformData = ref<number[]>(new Array(24).fill(8))
  const speakerMode = ref<VoiceSpeakerMode>('idle')

  // Web Audio Context & Streams
  let audioContext: AudioContext | null = null
  let localStream: MediaStream | null = null
  let localAnalyser: AnalyserNode | null = null
  let localSource: MediaStreamAudioSourceNode | null = null

  let remoteAudioElement: HTMLAudioElement | null = null
  let remoteStream: MediaStream | null = null
  let remoteAnalyser: AnalyserNode | null = null
  let remoteSource: MediaStreamAudioSourceNode | null = null

  // Giọng nữ tiếng Việt (MP3 từ POST /api/ai-voice/tts)
  let ttsAudio: HTMLAudioElement | null = null
  let ttsObjectUrl: string | null = null
  let ttsAnalyser: AnalyserNode | null = null
  let ttsMediaSource: MediaElementAudioSourceNode | null = null
  let ttsPlaybackId = 0
  let ttsStopCurrent: (() => void) | null = null
  const isTtsPlaying = ref(false)

  let animationFrameId: number | null = null
  let sessionTimer: ReturnType<typeof setTimeout> | null = null
  const MAX_SESSION_MS = 120000 // Tối đa 2 phút mỗi phiên

  // WebRTC
  let pc: RTCPeerConnection | null = null
  let dc: RTCDataChannel | null = null

  // Web Speech API
  let recognition: any = null

  // Danh sách callbacks lắng nghe transcript mới
  const speechDeltaListeners = new Set<(delta: string, fullTranscript: string) => void>()

  /**
   * Đăng ký callback khi có đoạn lời nói mới từ khách
   */
  const onSpeechDelta = (callback: (delta: string, fullTranscript: string) => void) => {
    speechDeltaListeners.add(callback)
    return () => speechDeltaListeners.delete(callback)
  }

  const emitSpeechDelta = (delta: string) => {
    const full = userTranscript.value
    speechDeltaListeners.forEach(listener => {
      try {
        listener(delta, full)
      } catch (e) {
        console.error('[useTripVoice] listener error:', e)
      }
    })
  }

  /**
   * Kiểm tra quyền micro trên trình duyệt mà không kích hoạt prompt (nếu có API)
   */
  const checkPermission = async (): Promise<PermissionStatus> => {
    if (typeof window === 'undefined') return 'prompt'

    if (!navigator?.mediaDevices?.getUserMedia) {
      permissionStatus.value = 'unsupported'
      permissionError.value = 'Trình duyệt hoặc thiết bị của bạn không hỗ trợ thu âm Microphone.'
      return 'unsupported'
    }

    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        if (result.state === 'granted') {
          permissionStatus.value = 'granted'
          permissionError.value = null
        } else if (result.state === 'denied') {
          permissionStatus.value = 'denied'
          permissionError.value = 'Quyền Microphone đã bị chặn trong cài đặt trình duyệt.'
        } else {
          permissionStatus.value = 'prompt'
        }

        result.onchange = () => {
          if (result.state === 'granted') {
            permissionStatus.value = 'granted'
            permissionError.value = null
          } else if (result.state === 'denied') {
            permissionStatus.value = 'denied'
            permissionError.value = 'Quyền Microphone đã bị chặn trong cài đặt trình duyệt.'
          } else {
            permissionStatus.value = 'prompt'
          }
        }
      }
    } catch (_) {
      // Permissions API có thể không hỗ trợ microphone query trên một số trình duyệt
    }

    return permissionStatus.value
  }

  /**
   * Khởi tạo Web Audio Context và Analyser
   */
  const initAudioContext = async (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return

      if (!audioContext || audioContext.state === 'closed') {
        audioContext = new AudioCtx()
      }

      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      // Tạo Analyser cho Mic của người dùng
      localAnalyser = audioContext.createAnalyser()
      localAnalyser.fftSize = 64
      localAnalyser.smoothingTimeConstant = 0.85

      localSource = audioContext.createMediaStreamSource(stream)
      localSource.connect(localAnalyser)

      startVisualizerLoop()
    } catch (e) {
      console.warn('[useTripVoice] Lỗi khởi tạo AudioContext visualizer:', e)
    }
  }

  /**
   * Bắt đầu vòng lặp vẽ sóng âm thanh (Audio Visualizer)
   */
  const startVisualizerLoop = () => {
    if (animationFrameId !== null) return

    const bufferLength = 32
    const dataArrayLocal = new Uint8Array(bufferLength)
    const dataArrayRemote = new Uint8Array(bufferLength)

    const updateVisualizer = () => {
      let activeLevel = 0
      const bars: number[] = []

      // 1. Kiểm tra âm thanh AI phát ra (remote WebRTC hoặc MP3 TTS)
      let assistantSignal = 0
      const assistantAnalyser = remoteAnalyser || ttsAnalyser
      if (assistantAnalyser) {
        assistantAnalyser.getByteFrequencyData(dataArrayRemote)
        let sum = 0
        for (let i = 0; i < 24; i++) {
          sum += dataArrayRemote[i] || 0
        }
        assistantSignal = Math.min(100, Math.round((sum / 24 / 255) * 100))
      }

      // 2. Kiểm tra nếu đang nói bằng Web SpeechSynthesis (giọng trình duyệt)
      const isSynthesisSpeaking = typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking

      if (assistantSignal > 8 || isSynthesisSpeaking || isTtsPlaying.value) {
        speakerMode.value = 'assistant'
        // Có analyser thật thì lấy theo âm thanh; không có thì mô phỏng sóng
        const useSynthWave = isSynthesisSpeaking || (isTtsPlaying.value && assistantSignal <= 8)
        activeLevel = useSynthWave
          ? Math.max(assistantSignal, 45 + Math.sin(Date.now() / 90) * 35)
          : assistantSignal

        for (let i = 0; i < 24; i++) {
          const raw = dataArrayRemote[i] || 0
          const synthSim = Math.abs(Math.sin((Date.now() / 150) + i * 0.4)) * 75 + 15
          const val = useSynthWave ? Math.round(synthSim) : Math.round((raw / 255) * 100)
          bars.push(Math.max(12, Math.min(val, 100)))
        }
      } else {
        // 3. Kiểm tra âm thanh Microphone của người dùng
        let userSignal = 0
        if (localAnalyser && !isMuted.value) {
          localAnalyser.getByteFrequencyData(dataArrayLocal)
          let sum = 0
          for (let i = 0; i < 24; i++) {
            sum += dataArrayLocal[i] || 0
          }
          userSignal = Math.min(100, Math.round((sum / 24 / 255) * 100))
        }

        if (userSignal > 12) {
          speakerMode.value = 'user'
          activeLevel = userSignal
          for (let i = 0; i < 24; i++) {
            const raw = dataArrayLocal[i] || 0
            const val = Math.round((raw / 255) * 100)
            bars.push(Math.max(10, Math.min(val, 100)))
          }
        } else {
          // Trạng thái nghỉ (idle wave)
          speakerMode.value = 'idle'
          activeLevel = 4
          const time = Date.now() / 400
          for (let i = 0; i < 24; i++) {
            const idleWave = Math.sin(time + i * 0.3) * 6 + 10
            bars.push(Math.round(idleWave))
          }
        }
      }

      audioLevel.value = Math.round(activeLevel)
      waveformData.value = bars

      animationFrameId = requestAnimationFrame(updateVisualizer)
    }

    animationFrameId = requestAnimationFrame(updateVisualizer)
  }

  /**
   * Dừng vòng lặp visualizer
   */
  const stopVisualizerLoop = () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    audioLevel.value = 0
    waveformData.value = new Array(24).fill(8)
    speakerMode.value = 'idle'
  }

  /**
   * QUY TRÌNH BẮT BUỘC CẤP QUYỀN MICROPHONE
   * Gọi navigator.mediaDevices.getUserMedia({ audio: true })
   */
  const requestPermissions = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false

    isPermissionRequested.value = true
    permissionError.value = null

    if (!navigator?.mediaDevices?.getUserMedia) {
      permissionStatus.value = 'unsupported'
      permissionError.value = 'Thiết bị hoặc trình duyệt của bạn không hỗ trợ tính năng thu âm Micro.'
      return false
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      localStream = stream
      permissionStatus.value = 'granted'
      permissionError.value = null

      // Khởi tạo AudioContext & Analyser cho sóng âm
      await initAudioContext(stream)
      return true
    } catch (err: any) {
      console.warn('[useTripVoice] Quyền Micro bị từ chối hoặc lỗi:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        permissionStatus.value = 'denied'
        permissionError.value = 'Trình duyệt chưa được cấp quyền Microphone. Vui lòng nhấn vào biểu tượng ổ khóa hoặc cài đặt trên thanh địa chỉ để BẬT Micro và thử lại.'
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        permissionStatus.value = 'unsupported'
        permissionError.value = 'Không tìm thấy Microphone nào trên thiết bị của bạn. Vui lòng cắm tai nghe hoặc kiểm tra lại thiết bị thu âm.'
      } else {
        permissionStatus.value = 'denied'
        permissionError.value = `Lỗi truy cập Microphone: ${err.message || 'Không xác định'}`
      }
      return false
    }
  }

  // Khởi tạo và theo dõi danh sách giọng đọc của trình duyệt
  let availableVoices: SpeechSynthesisVoice[] = []
  const loadVoices = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      availableVoices = window.speechSynthesis.getVoices()
    }
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }

  // ─── Giọng nữ tiếng Việt (MP3 từ server) ──────────────────────────────
  /** Dừng mọi âm thanh giọng trợ lý đang phát (MP3 TTS + Web Speech API) */
  const stopAssistantPlayback = () => {
    ttsPlaybackId++

    if (ttsStopCurrent) {
      try {
        ttsStopCurrent()
      } catch {
        // bỏ qua lỗi khi huỷ audio đang phát
      }
      ttsStopCurrent = null
    }

    if (ttsAudio) {
      try {
        ttsAudio.pause()
      } catch {
        // bỏ qua khi audio chưa sẵn sàng
      }
      try {
        ttsAudio.removeAttribute('src')
        ttsAudio.load()
      } catch {
        // bỏ qua khi audio đã bị giải phóng
      }
    }

    if (ttsObjectUrl) {
      try {
        URL.revokeObjectURL(ttsObjectUrl)
      } catch {
        // bỏ qua khi URL đã được thu hồi
      }
      ttsObjectUrl = null
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
      } catch {
        // bỏ qua khi trình duyệt không hỗ trợ
      }
    }

    isTtsPlaying.value = false
    speakerMode.value = 'idle'
  }

  /**
   * Lấy (hoặc tạo) thẻ audio phát giọng nữ tiếng Việt.
   * Gắn analyser để visualizer nhảy theo giọng thật khi có AudioContext.
   */
  const ensureTtsAudio = (): HTMLAudioElement | null => {
    if (typeof window === 'undefined') return null

    if (!ttsAudio) {
      ttsAudio = new Audio()
      ttsAudio.preload = 'auto'
      ttsAudio.setAttribute('playsinline', '')
    }

    if (!ttsMediaSource && audioContext && audioContext.state === 'running') {
      try {
        ttsAnalyser = audioContext.createAnalyser()
        ttsAnalyser.fftSize = 64
        ttsAnalyser.smoothingTimeConstant = 0.85
        ttsMediaSource = audioContext.createMediaElementSource(ttsAudio)
        ttsMediaSource.connect(ttsAnalyser)
        ttsAnalyser.connect(audioContext.destination)
      } catch (err) {
        console.warn('[useTripVoice] Không gắn được analyser cho giọng TTS:', err)
        ttsAnalyser = null
        ttsMediaSource = null
      }
    }

    return ttsAudio
  }

  /** Phát MP3 giọng nữ tiếng Việt; trả về true nếu phát xong bình thường. */
  const playTtsBlob = (blob: Blob, playbackId: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const audio = ensureTtsAudio()
      if (!audio) {
        resolve(false)
        return
      }

      if (ttsObjectUrl) {
        try {
          URL.revokeObjectURL(ttsObjectUrl)
        } catch {
          // bỏ qua khi URL đã được thu hồi
        }
        ttsObjectUrl = null
      }

      const objectUrl = URL.createObjectURL(blob)
      ttsObjectUrl = objectUrl
      let settled = false
      let stopFn: (() => void) | null = null

      const finish = (played: boolean) => {
        if (settled) return
        settled = true
        audio.onended = null
        audio.onerror = null
        if (stopFn && ttsStopCurrent === stopFn) ttsStopCurrent = null

        if (ttsObjectUrl === objectUrl) {
          try {
            URL.revokeObjectURL(objectUrl)
          } catch {
            // bỏ qua khi URL đã được thu hồi
          }
          ttsObjectUrl = null
        }

        if (playbackId === ttsPlaybackId) {
          isTtsPlaying.value = false
          speakerMode.value = 'idle'
        }
        resolve(played)
      }
      stopFn = () => finish(false)

      audio.onended = () => finish(true)
      audio.onerror = () => finish(false)

      ttsStopCurrent = stopFn
      audio.src = objectUrl
      isTtsPlaying.value = true
      speakerMode.value = 'assistant'

      audio.play().catch((err) => {
        console.warn('[useTripVoice] Không phát được MP3 TTS:', err)
        finish(false)
      })
    })
  }

  const VIETNAMESE_VOICE_HINTS = ['hoai my', 'hoài my', 'linh', 'huyen', 'huyền', 'thuy', 'thủy', 'mai', 'lan', 'hong', 'hồng', 'female', 'nữ']

  /** Chọn giọng nữ tiếng Việt trong danh sách giọng của trình duyệt */
  const pickVietnameseVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    const isVietnamese = (v: SpeechSynthesisVoice) => {
      const lang = (v.lang || '').toLowerCase()
      const name = (v.name || '').toLowerCase()
      return lang.startsWith('vi') || lang.includes('-vn') || name.includes('vietnam') || name.includes('tiếng việt')
    }

    const viVoices = voices.filter(isVietnamese)
    if (viVoices.length === 0) return null

    const femaleVoice = viVoices.find((v) => {
      const name = (v.name || '').toLowerCase()
      return VIETNAMESE_VOICE_HINTS.some(hint => name.includes(hint))
    })

    return femaleVoice ?? viVoices[0] ?? null
  }

  /**
   * Phương án cuối: giọng tiếng Việt của trình duyệt (chỉ dùng khi server TTS lỗi).
   * Không bao giờ đọc tiếng Việt bằng giọng tiếng Anh.
   */
  const speakWithBrowserVoice = (text: string, playbackId: number): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve()
        return
      }

      try {
        window.speechSynthesis.cancel()
        window.speechSynthesis.resume()

        if (availableVoices.length === 0) {
          availableVoices = window.speechSynthesis.getVoices()
        }

        const viVoice = pickVietnameseVoice(availableVoices)

        if (!viVoice) {
          statusMessage.value = 'Thiết bị chưa cài giọng tiếng Việt. Bấm nút loa cạnh câu trả lời để nghe giọng nữ tiếng Việt.'
          resolve()
          return
        }

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.05
        utterance.pitch = 1.0
        utterance.voice = viVoice
        utterance.lang = viVoice.lang || 'vi-VN'

        const finish = () => {
          if (playbackId === ttsPlaybackId) speakerMode.value = 'idle'
          resolve()
        }
        utterance.onend = finish
        utterance.onerror = (e) => {
          console.warn('[useTripVoice] SpeechSynthesis error:', e)
          finish()
        }

        speakerMode.value = 'assistant'
        window.speechSynthesis.speak(utterance)

        // Workaround chống lỗi Chrome tự động pause SpeechSynthesis khi nói câu dài
        const resumeInterval = setInterval(() => {
          if (typeof window === 'undefined' || !window.speechSynthesis.speaking) {
            clearInterval(resumeInterval)
          } else {
            window.speechSynthesis.resume()
          }
        }, 300)
      } catch (e) {
        console.warn('[useTripVoice] SpeechSynthesis error:', e)
        if (playbackId === ttsPlaybackId) speakerMode.value = 'idle'
        resolve()
      }
    })
  }

  /**
   * Phát câu trả lời của trợ lý bằng giọng NỮ TIẾNG VIỆT.
   * Ưu tiên MP3 tổng hợp từ server /api/ai-voice/tts,
   * chỉ fallback Web Speech API (vi-VN) khi server lỗi.
   */
  const speakTrip = async (text: string): Promise<void> => {
    const clean = (text || '').trim()
    if (!clean) return

    // Câu mới: dừng câu đang đọc trước, không chồng tiếng
    stopAssistantPlayback()
    const playbackId = ttsPlaybackId

    speakerMode.value = 'assistant'

    // 1. Ưu tiên giọng nữ tiếng Việt tổng hợp từ server
    try {
      if (audioContext && audioContext.state === 'suspended') {
        try {
          await audioContext.resume()
        } catch {
          // bỏ qua: AudioContext có thể đã bị đóng
        }
      }

      const blob = await aiVoiceService.synthesize(clean)
      if (playbackId !== ttsPlaybackId) return

      if (blob && blob.size > 0) {
        const played = await playTtsBlob(blob, playbackId)
        if (played || playbackId !== ttsPlaybackId) return
      }
    } catch (err) {
      console.warn('[useTripVoice] Lỗi TTS server, chuyển sang giọng trình duyệt:', err)
    }

    if (playbackId !== ttsPlaybackId) return

    // 2. Phương án cuối: giọng tiếng Việt của trình duyệt
    await speakWithBrowserVoice(clean, playbackId)
  }

  /**
   * Khởi động nhận diện giọng nói tiếng Việt qua Web Speech API (Demo / Fallback)
   */
  const startBrowserSpeech = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      statusMessage.value = 'Trình duyệt không hỗ trợ Web Speech API. Bạn có thể sử dụng các kịch bản mẫu bên dưới.'
      isConnecting.value = false
      isConnected.value = true
      return
    }

    try {
      recognition = new SpeechRecognition()
      recognition.lang = 'vi-VN'
      recognition.continuous = true
      recognition.interimResults = true

      recognition.onstart = () => {
        isConnecting.value = false
        isConnected.value = true
        statusMessage.value = 'Trip đang lắng nghe 🎙️ (Trình duyệt vi-VN)'

        const welcome = 'Dạ em chào anh chị! Em là Trip, trợ lý đặt xe của Happy Trip. Anh/chị đi từ đâu đến đâu để em báo giá ạ?'
        assistantTranscript.value = welcome
        speakTrip(welcome)
      }

      let demoReplyTimer: any = null
      const triggerDemoReply = (text: string) => {
        clearTimeout(demoReplyTimer)
        demoReplyTimer = setTimeout(() => {
          if (!isConnected.value || isStopping.value) return
          const tLower = text.toLowerCase()
          let reply = 'Dạ em đã ghi nhận thông tin chuyến đi của mình rồi ạ.'

          if (tLower.includes('5 chỗ') || tLower.includes('7 chỗ')) {
            reply = 'Dạ em ghi nhận loại xe mình chọn. Em đang kiểm tra lộ trình và tính giá cước cho anh chị ngay ạ.'
          } else if (tLower.includes('vũng tàu') || tLower.includes('đà lạt') || tLower.includes('đồng nai') || tLower.includes('hồ chí minh')) {
            reply = 'Dạ em đã có điểm đến. Nhà mình đi bao nhiêu người và có nhiều hành lý không ạ?'
          } else if (tLower.includes('người lớn') || tLower.includes('trẻ em') || tLower.includes('người') || tLower.includes('khách')) {
            reply = 'Dạ ít hành lý mình chọn xe 5 chỗ, nhiều hành lý thì xe 7 chỗ sẽ thoải mái hơn. Mình muốn đón lúc mấy giờ ạ?'
          } else if (tLower.includes('sáng mai') || tLower.includes('hôm nay') || tLower.includes('giờ') || tLower.includes('chiều')) {
            reply = 'Dạ em đã ghi nhận thời gian khởi hành. Anh chị xác nhận giúp em thông tin trên màn hình nhé.'
          }

          assistantTranscript.value = reply
          outputParts.value.push(reply)
          speakTrip(reply)
        }, 1200)
      }

      recognition.onresult = (event: any) => {
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            const clean = trans.trim() + ' '
            inputParts.value.push(clean)
            userTranscript.value = inputParts.value.join('').slice(-800)
            emitSpeechDelta(clean)
            triggerDemoReply(userTranscript.value)
          } else {
            interim += trans
          }
        }
        userTranscript.value = (inputParts.value.join('') + interim).slice(-800)
      }

      recognition.onerror = (err: any) => {
        console.warn('[useTripVoice] SpeechRecognition error:', err.error)
        if (err.error === 'not-allowed') {
          permissionStatus.value = 'denied'
          permissionError.value = 'Microphone đã bị chặn trong khi đàm thoại.'
          stopSession()
        }
      }

      recognition.onend = () => {
        // Tự động khởi động lại nếu phiên vẫn đang kết nối
        if (isConnected.value && !isStopping.value) {
          try {
            recognition.start()
          } catch (_) {}
        }
      }

      recognition.start()

      // Hẹn giờ kết thúc tối đa
      sessionTimer = setTimeout(() => {
        statusMessage.value = 'Phiên đàm thoại mẫu kết thúc sau 2 phút.'
        stopSession()
      }, MAX_SESSION_MS)

    } catch (e: any) {
      console.warn('[useTripVoice] Lỗi khởi động Web Speech API:', e)
      statusMessage.value = 'Lỗi khởi động nhận diện: ' + (e?.message || '')
      stopSession()
    }
  }

  /**
   * Xử lý sự kiện nhận từ OpenAI Live WebRTC DataChannel
   */
  const handleLiveEvent = (e: any) => {
    if (e.type === 'session.started') {
      isConnected.value = true
      isConnecting.value = false
      statusMessage.value = 'Trip đang lắng nghe 🎙️ (OpenAI Live WebRTC)'
      return
    }

    if (e.type === 'session.input_transcript.delta' && typeof e.delta === 'string') {
      inputParts.value.push(e.delta)
      userTranscript.value = inputParts.value.join('').slice(-800)
      emitSpeechDelta(e.delta)
      return
    }

    if (e.type === 'session.output_transcript.delta' && typeof e.delta === 'string') {
      outputParts.value.push(e.delta)
      assistantTranscript.value = outputParts.value.join('').slice(-800)
      return
    }

    if (e.type === 'error') {
      const code = String(e.error?.code || e.code || '')
      const msg = String(e.error?.message || e.message || '')
      if (code === 'missing_scope' && msg.toLowerCase().includes('history compaction')) return
      console.warn('[useTripVoice] Live event error:', code, msg)

      // Phân loại để khách thấy đúng nguyên nhân, không chỉ báo "lỗi kết nối"
      const signature = `${code} ${msg}`
      const kind: VoiceErrorKind = /rate_limit|quota|429/i.test(signature)
        ? 'rate_limited'
        : /invalid_api_key|unauthorized|authentication|permission|forbidden|401|403/i.test(signature)
          ? 'auth'
          : 'connection'

      const detail = msg ? `${msg}${code ? ` (${code})` : ''}` : code
      setVoiceError(
        kind,
        detail
          ? `Lỗi OpenAI Live: ${detail}. Vui lòng bấm "Thử lại" để kết nối lại.`
          : 'Lỗi kết nối OpenAI Live. Vui lòng bấm "Thử lại" để kết nối lại.'
      )

      // Kết thúc phiên đang lỗi để nút "Thử lại" mở được phiên mới
      stopSession()
    }
  }

  // ─── Báo lỗi kết nối OpenAI (KHÔNG tự fallback sang Demo) ─────────────
  const clearVoiceError = () => {
    voiceError.value = null
    voiceErrorKind.value = null
  }

  const setVoiceError = (kind: VoiceErrorKind, message: string) => {
    voiceErrorKind.value = kind
    voiceError.value = message
    statusMessage.value = message
    isConnecting.value = false
  }

  /** Chuyển lỗi kỹ thuật thành thông báo thân thiện cho khách */
  const describeSessionError = (err: unknown): { kind: VoiceErrorKind; message: string } => {
    const detail = (err || {}) as { statusCode?: number, status?: number, statusMessage?: string, message?: string }
    const status = Number(detail.statusCode || detail.status || 0)
    const raw = String(detail.statusMessage || detail.message || '').trim()
    const looksTechnical = /failed to fetch|networkerror|load failed|timeout|aborted|http error|sdp|webrtc|ice/i.test(raw)

    if (status === 429) {
      return {
        kind: 'rate_limited',
        message: raw && !looksTechnical
          ? raw
          : 'Trợ lý AI đang giới hạn số phiên kết nối. Vui lòng thử lại sau ít phút.'
      }
    }

    if (status === 401 || status === 403) {
      return {
        kind: 'auth',
        message: 'Không xác thực được với OpenAI (API key không hợp lệ hoặc thiếu quyền). Vui lòng kiểm tra cấu hình.'
      }
    }

    if (raw && !looksTechnical) {
      return { kind: 'connection', message: raw }
    }

    return {
      kind: 'connection',
      message: 'Không kết nối được tới trợ lý AI. Vui lòng kiểm tra kết nối mạng và thử lại.'
    }
  }

  /**
   * Bắt đầu phiên kết nối AI Voice (kiểm tra quyền -> trạng thái server -> WebRTC Live).
   * Nếu OpenAI lỗi hoặc chưa cấu hình -> báo lỗi rõ ràng, KHÔNG tự chuyển Demo.
   */
  const startSession = async () => {
    if (isConnected.value || isConnecting.value) return

    clearVoiceError()
    isConnecting.value = true
    isStopping.value = false
    statusMessage.value = 'Đang kiểm tra quyền Microphone...'
    inputParts.value = []
    outputParts.value = []
    userTranscript.value = ''
    assistantTranscript.value = ''

    // BẮT BUỘC: Đảm bảo quyền Microphone đã được cấp
    if (permissionStatus.value !== 'granted' || !localStream) {
      const granted = await requestPermissions()
      if (!granted) {
        isConnecting.value = false
        statusMessage.value = 'Yêu cầu cấp quyền Micro để bắt đầu hội thoại.'
        return
      }
    }

    statusMessage.value = 'Đang kiểm tra trạng thái máy chủ...'

    // 1. Kiểm tra trạng thái + cấu hình OpenAI từ server
    let serverStatus: Awaited<ReturnType<typeof aiVoiceService.getStatus>> | null = null
    try {
      serverStatus = await aiVoiceService.getStatus()
    } catch (statusErr) {
      console.warn('[useTripVoice] Không lấy được trạng thái AI Voice:', statusErr)
      serverStatus = null
    }

    if (!serverStatus) {
      isConnected.value = false
      setVoiceError('connection', 'Không kiểm tra được trạng thái trợ lý AI. Vui lòng kiểm tra kết nối mạng rồi thử lại.')
      return
    }

    const hasLiveKey = Boolean(serverStatus.hasOpenAIKey && serverStatus.mode === 'live')
    mode.value = hasLiveKey ? 'live' : 'demo'

    // 2. Chưa cấu hình OpenAI -> báo lỗi rõ ràng, không tự chạy Demo
    if (!hasLiveKey) {
      isConnected.value = false
      setVoiceError(
        'not_configured',
        'Trợ lý giọng nói AI chưa được cấu hình OpenAI trên hệ thống. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.'
      )
      return
    }

    // 3. Nếu server có OpenAI Key -> Thử kết nối WebRTC Live
    try {
      statusMessage.value = 'Đang thiết lập kết nối WebRTC Live...'

      pc = new RTCPeerConnection()

      // Gắn track micro vào PeerConnection
      if (localStream) {
        localStream.getTracks().forEach(track => {
          if (localStream && pc) pc.addTrack(track, localStream)
        })
      }

      // Xử lý Audio phát từ OpenAI Live
      pc.addEventListener('track', (e) => {
        remoteStream = e.streams[0] || null
        if (!remoteAudioElement) {
          remoteAudioElement = new Audio()
          remoteAudioElement.autoplay = true
        }
        if (remoteStream) {
          remoteAudioElement.srcObject = remoteStream
          remoteAudioElement.play().catch(err => console.warn('Không thể tự động phát âm thanh:', err))
        }

        // Gắn Analyser cho remote audio để visualize giọng AI
        if (audioContext && remoteStream) {
          try {
            remoteAnalyser = audioContext.createAnalyser()
            remoteAnalyser.fftSize = 64
            remoteAnalyser.smoothingTimeConstant = 0.85
            remoteSource = audioContext.createMediaStreamSource(remoteStream)
            remoteSource.connect(remoteAnalyser)
          } catch (analyserErr) {
            console.warn('[useTripVoice] Không thể tạo remote analyser:', analyserErr)
          }
        }
      })

      // Tạo DataChannel giao tiếp sự kiện hai chiều
      dc = pc.createDataChannel('oai-events')
      dc.addEventListener('message', ev => {
        try {
          handleLiveEvent(JSON.parse(ev.data))
        } catch (_) {}
      })
      dc.addEventListener('close', () => {
        if (!isStopping.value && isConnected.value) {
          stopSession()
        }
      })

      // Lưu ý: KHÔNG gửi { type: 'response.create' } để chào chủ động.
      // Phiên realtime hiện tại không bật Responses delegation nên OpenAI trả:
      // "invalid_request_error: response.create requires a session with Responses delegation."
      // Trợ lý sẽ chào/hỏi theo instructions khi khách bắt đầu lượt nói đầu tiên.

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Chờ gom đủ ICE candidates
      await new Promise<void>((resolve, reject) => {
        if (!pc || pc.iceGatheringState === 'complete') return resolve()
        const timeout = setTimeout(() => {
          if (pc) pc.removeEventListener('icegatheringstatechange', onChange)
          reject(new Error('Hết thời gian chờ kết nối ICE'))
        }, 12000)

        function onChange() {
          if (pc?.iceGatheringState === 'complete') {
            clearTimeout(timeout)
            pc?.removeEventListener('icegatheringstatechange', onChange)
            resolve()
          }
        }
        pc.addEventListener('icegatheringstatechange', onChange)
      })

      statusMessage.value = 'Đang bắt tay với OpenAI Realtime...'
      const sdpBody = pc.localDescription?.sdp || ''
      const sessionResult = await aiVoiceService.createSession(sdpBody)

      if (!sessionResult.sdp) {
        throw Object.assign(
          new Error(sessionResult.message || 'Không tạo được phiên trò chuyện với OpenAI.'),
          { statusCode: 502, statusMessage: sessionResult.message }
        )
      }

      await pc.setRemoteDescription({ type: 'answer', sdp: sessionResult.sdp })
      isConnected.value = true
      isConnecting.value = false
      statusMessage.value = 'Trip đang lắng nghe 🎙️ (OpenAI Live)'

      sessionTimer = setTimeout(() => {
        statusMessage.value = 'Phiên Live kết thúc sau 2 phút.'
        stopSession()
      }, MAX_SESSION_MS)

    } catch (err: unknown) {
      const detail = (err || {}) as { message?: string }
      console.warn('[useTripVoice] Lỗi kết nối OpenAI Live:', detail.message || err)
      try {
        dc?.close()
      } catch {
        // bỏ qua khi DataChannel đã đóng
      }
      try {
        pc?.close()
      } catch {
        // bỏ qua khi PeerConnection đã đóng
      }
      pc = null
      dc = null
      isConnected.value = false

      // Báo lỗi rõ ràng cho khách, không âm thầm chuyển sang Demo/Web Speech
      const described = describeSessionError(err)
      setVoiceError(described.kind, described.message)
    }
  }

  /**
   * Kết thúc cuộc gọi và giải phóng tài nguyên
   */
  const stopSession = () => {
    if (isStopping.value) return
    isStopping.value = true

    if (sessionTimer) {
      clearTimeout(sessionTimer)
      sessionTimer = null
    }

    // Đóng DataChannel & WebRTC
    try {
      if (dc?.readyState === 'open') {
        dc.send(JSON.stringify({ type: 'session.close', event_id: 'close_' + Date.now() }))
      }
    } catch (_) {}

    setTimeout(() => {
      try { dc?.close() } catch (_) {}
      try { pc?.close() } catch (_) {}
      pc = null
      dc = null
    }, 150)

    // Dừng Web Speech API
    if (recognition) {
      try { recognition.stop() } catch (_) {}
      recognition = null
    }

    // Dừng giọng trợ lý đang phát (MP3 TTS + Web Speech API)
    stopAssistantPlayback()

    // Dừng remote audio
    if (remoteAudioElement) {
      remoteAudioElement.pause()
      remoteAudioElement.srcObject = null
      remoteAudioElement = null
    }

    isConnected.value = false
    isConnecting.value = false
    isStopping.value = false
    speakerMode.value = 'idle'
    // Giữ nguyên thông báo lỗi (nếu có) để khách còn thấy và bấm Thử lại
    if (!voiceError.value) {
      statusMessage.value = 'Đã kết thúc cuộc gọi. Thông tin chuyến đi được lưu giữ.'
    }
  }

  /**
   * Dừng hoàn toàn Microphone & AudioContext khi đóng Modal
   */
  const releaseMicrophone = () => {
    stopSession()
    stopVisualizerLoop()

    if (localStream) {
      localStream.getTracks().forEach(t => {
        try { t.stop() } catch (_) {}
      })
      localStream = null
    }

    if (audioContext && audioContext.state !== 'closed') {
      try { audioContext.close() } catch (_) {}
      audioContext = null
    }

    localAnalyser = null
    localSource = null
    remoteAnalyser = null
    remoteSource = null
    ttsAnalyser = null
    ttsMediaSource = null
  }

  /**
   * Bật / Tắt Mic (Mute)
   */
  const toggleMute = () => {
    if (!localStream) return
    isMuted.value = !isMuted.value
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !isMuted.value
    })
    statusMessage.value = isMuted.value ? 'Đã tắt tiếng micro 🔇' : 'Đã bật lại micro 🎙️'
  }

  /**
   * Gửi thông tin cập nhật thủ công từ biểu mẫu sang OpenAI Live
   */
  const sendManualUpdate = (changes: Record<string, string>) => {
    if (!isConnected.value || !dc || dc.readyState !== 'open') return

    try {
      dc.send(JSON.stringify({
        type: 'session.instructions.append',
        event_id: 'manual_' + Date.now(),
        content: 'Khách vừa tự sửa biểu mẫu, dùng các trường sau làm thông tin mới nhất: ' + JSON.stringify(changes) + '. Không hỏi lại các trường này.'
      }))
    } catch (error: any) {
      console.warn('[useTripVoice] Không thể gửi cập nhật biểu mẫu sang Live:', error?.message)
    }
  }

  /**
   * Chỉ dùng khi người dùng CHỦ ĐỘNG chọn chế độ Demo (không tự động fallback).
   */
  const startDemoSession = () => {
    clearVoiceError()
    mode.value = 'demo'
    statusMessage.value = 'Đang khởi động Trip Voice Demo (Web Speech API)...'
    startBrowserSpeech()
  }

  /**
   * Chạy kịch bản mẫu nhanh (Quick Scenario Test)
   */
  const playScenario = (scenarioId: string) => {
    const sc = VOICE_SCENARIOS[scenarioId]
    if (!sc) return

    statusMessage.value = `Đang chạy kịch bản mẫu ${scenarioId}: ${sc.title}...`
    userTranscript.value = sc.guest
    assistantTranscript.value = sc.trip

    // Kích hoạt callback đồng bộ form
    emitSpeechDelta(sc.guest)

    // Phát giọng nói tiếng Việt cho trợ lý Trip
    speakTrip(sc.trip)
  }

  onMounted(() => {
    checkPermission()
  })

  onUnmounted(() => {
    releaseMicrophone()
  })

  return {
    // Quyền Micro
    permissionStatus,
    permissionError,
    isPermissionRequested,
    checkPermission,
    requestPermissions,
    releaseMicrophone,

    // Trạng thái kết nối
    mode,
    isConnected,
    isConnecting,
    isStopping,
    isMuted,
    statusMessage,
    voiceError,
    voiceErrorKind,
    clearVoiceError,

    // Dữ liệu lời nói & Visualizer
    userTranscript,
    assistantTranscript,
    audioLevel,
    waveformData,
    speakerMode,
    isTtsPlaying,

    // Hành động
    startSession,
    startDemoSession,
    stopSession,
    toggleMute,
    sendManualUpdate,
    speakTrip,
    playScenario,
    onSpeechDelta
  }
}
