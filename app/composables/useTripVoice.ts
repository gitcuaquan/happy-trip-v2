import { ref, onMounted, onUnmounted } from 'vue'
import { aiVoiceService } from '~/services/ai-voice.service'

export type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'unsupported'
export type VoiceSpeakerMode = 'idle' | 'user' | 'assistant'
export type VoiceServerMode = 'live' | 'demo' | 'checking'

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

      // 1. Kiểm tra âm thanh AI phát ra (nếu có remote analyser)
      let assistantSignal = 0
      if (remoteAnalyser) {
        remoteAnalyser.getByteFrequencyData(dataArrayRemote)
        let sum = 0
        for (let i = 0; i < 24; i++) {
          sum += dataArrayRemote[i] || 0
        }
        assistantSignal = Math.min(100, Math.round((sum / 24 / 255) * 100))
      }

      // 2. Kiểm tra nếu đang nói bằng Web SpeechSynthesis
      const isSynthesisSpeaking = typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking

      if (assistantSignal > 8 || isSynthesisSpeaking) {
        speakerMode.value = 'assistant'
        activeLevel = isSynthesisSpeaking ? Math.max(assistantSignal, 45 + Math.sin(Date.now() / 90) * 35) : assistantSignal

        for (let i = 0; i < 24; i++) {
          const raw = dataArrayRemote[i] || 0
          const synthSim = Math.abs(Math.sin((Date.now() / 150) + i * 0.4)) * 75 + 15
          const val = isSynthesisSpeaking ? Math.round(synthSim) : Math.round((raw / 255) * 100)
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

  /**
   * Phát giọng nói tiếng Việt tự nhiên qua Web Speech Synthesis (Demo/Fallback)
   */
  const speakTrip = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve()
        return
      }

      try {
        window.speechSynthesis.cancel()
        window.speechSynthesis.resume()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.05
        utterance.pitch = 1.0

        if (availableVoices.length === 0) {
          availableVoices = window.speechSynthesis.getVoices()
        }

        // Tìm voice tiếng Việt
        const viVoice = availableVoices.find(v =>
          v.lang.toLowerCase().includes('vi') ||
          v.lang.toLowerCase().includes('vn') ||
          v.name.toLowerCase().includes('vietnam') ||
          v.name.toLowerCase().includes('tiếng việt')
        )

        if (viVoice) {
          utterance.voice = viVoice
          utterance.lang = viVoice.lang || 'vi-VN'
        } else {
          // Fallback sang voice mặc định của hệ thống để đảm bảo luôn phát ra âm thanh
          utterance.lang = 'vi-VN'
          if (availableVoices.length > 0) {
            const defaultVoice = availableVoices.find(v => v.default) || availableVoices[0]
            if (defaultVoice) utterance.voice = defaultVoice
          }
        }

        utterance.onstart = () => {
          speakerMode.value = 'assistant'
        }
        utterance.onend = () => {
          speakerMode.value = 'idle'
          resolve()
        }
        utterance.onerror = (e) => {
          console.warn('[useTripVoice] SpeechSynthesis error:', e)
          speakerMode.value = 'idle'
          resolve()
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
        speakerMode.value = 'idle'
        resolve()
      }
    })
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

        const welcome = 'Dạ em chào anh chị! Em là Trip, trợ lý đặt xe của Happy Trip. Mình muốn đi đâu và đón ở đâu ạ?'
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
      statusMessage.value = 'Lỗi kết nối OpenAI Live. Vui lòng thử lại.'
      console.warn('[useTripVoice] Live event error:', code, msg)
    }
  }

  /**
   * Bắt đầu phiên kết nối AI Voice (Kiểm tra quyền -> check server -> WebRTC hoặc Demo Fallback)
   */
  const startSession = async () => {
    if (isConnected.value || isConnecting.value) return

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

    // 1. Kiểm tra trạng thái máy chủ từ server
    let serverStatus = null
    try {
      serverStatus = await aiVoiceService.getStatus()
    } catch {
      serverStatus = { live: false, hasOpenAIKey: false, mode: 'demo' as const }
    }

    const hasLiveKey = Boolean(serverStatus?.hasOpenAIKey && serverStatus?.mode === 'live')
    mode.value = hasLiveKey ? 'live' : 'demo'

    // 2. Nếu server không có OpenAI API Key -> Chạy trực tiếp Demo Simulator (Web Speech API)
    if (!hasLiveKey) {
      statusMessage.value = 'Đang khởi động Trip Voice Demo (Web Speech API)...'
      startBrowserSpeech()
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

      if (sessionResult.demo || !sessionResult.sdp) {
        // Chuyển sang fallback Web Speech API
        mode.value = 'demo'
        statusMessage.value = 'Chuyển sang chế độ Demo nhận diện giọng nói trình duyệt.'
        try { pc?.close(); } catch (_) {}
        pc = dc = null
        startBrowserSpeech()
        return
      }

      await pc.setRemoteDescription({ type: 'answer', sdp: sessionResult.sdp })
      isConnected.value = true
      isConnecting.value = false
      statusMessage.value = 'Trip đang lắng nghe 🎙️ (OpenAI Live)'

      sessionTimer = setTimeout(() => {
        statusMessage.value = 'Phiên Live kết thúc sau 2 phút.'
        stopSession()
      }, MAX_SESSION_MS)

    } catch (err: any) {
      console.warn('[useTripVoice] WebRTC lỗi, chuyển sang Web Speech API fallback:', err)
      mode.value = 'demo'
      try { pc?.close(); } catch (_) {}
      pc = dc = null
      startBrowserSpeech()
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

    // Dừng SpeechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

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
    statusMessage.value = 'Đã kết thúc cuộc gọi. Thông tin chuyến đi được lưu giữ.'
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

    // Dữ liệu lời nói & Visualizer
    userTranscript,
    assistantTranscript,
    audioLevel,
    waveformData,
    speakerMode,

    // Hành động
    startSession,
    stopSession,
    toggleMute,
    sendManualUpdate,
    speakTrip,
    playScenario,
    onSpeechDelta
  }
}
