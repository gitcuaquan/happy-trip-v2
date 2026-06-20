<script setup>
import { ref, onMounted } from 'vue'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

// Nuxt 4 / Vue 3.4+ sử dụng useTemplateRef để quản lý DOM selector an toàn
const carRef = useTemplateRef('car')
const pathRef = useTemplateRef('roadPath')

const isBooking = ref(false)
const btnText = ref('Đặt Xe Ngay')

// Biến lưu trữ timeline để tránh memory leak
let bookingTimeline = null

onMounted(() => {
  // Chỉ đăng ký plugin phía Client
  gsap.registerPlugin(MotionPathPlugin)
})

const startBookingAnimation = () => {
  if (isBooking.value) return // Ngăn click liên tục khi đang chạy
  
  isBooking.value = true
  btnText.value = 'Đang tìm tài xế...'

  // Khởi tạo timeline
  bookingTimeline = gsap.timeline({
    onComplete: () => {
      alert('Tài xế đã đến điểm đón!')
      resetBooking()
    }
  })

  // Hiệu ứng xe chạy dọc theo đường SVG Path
  bookingTimeline.to(carRef.value, {
    duration: 5,
    ease: 'power1.inOut',
    motionPath: {
      path: pathRef.value,
      autoRotate: true,
      align: pathRef.value,
      alignOrigin: [0.5, 0.5]
    }
  })

  // Thêm hiệu ứng radar nhấp nháy tại điểm B khi xe gần đến (giây thứ 3)
  bookingTimeline.to('.destination-marker', {
    scale: 1.2,
    repeat: 3,
    yoyo: true,
    duration: 0.5
  }, '-=2') 
}

const resetBooking = () => {
  isBooking.value = false
  btnText.value = 'Đặt Xe Ngay'
  
  // Đưa xe về vị trí xuất phát ban đầu
  gsap.set(carRef.value, { clearProps: 'all' })
}
</script>

<template>
  <div class="booking-section">
    <!-- Khu vực Bản đồ trực quan -->
    <div class="map-wrapper">
      <svg viewBox="0 0 800 400" class="map-svg">
        <!-- Đường đi mô phỏng -->
        <path 
          ref="roadPath" 
          d="M 100 300 C 250 150, 450 450, 700 150" 
          fill="none" 
          stroke="#e0e0e0" 
          stroke-width="6" 
          stroke-linecap="round"
        />
      </svg>

      <!-- Điểm Đón A -->
      <div class="marker pickup-marker" style="left: 100px; top: 300px;">
        <span class="pulse"></span>
        <div class="label">📍 Điểm đón (A)</div>
      </div>

      <!-- Điểm Đến B -->
      <div class="marker destination-marker" style="left: 700px; top: 150px;">
        <div class="label">🏁 Điểm đến (B)</div>
      </div>

      <!-- Icon Xe điều khiển bởi GSAP -->
      <div ref="car" class="car-element">🚗</div>
    </div>

    <!-- Bảng điều khiển đặt xe -->
    <div class="control-panel">
      <h3>Dịch vụ Nuxt-Car</h3>
      <p>Hành trình từ A đến B mượt mà với GSAP</p>
      <button 
        :class="{ 'btn-disabled': isBooking }" 
        @click="startBookingAnimation"
      >
        {{ btnText }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.booking-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 800px;
  margin: 40px auto;
  font-family: system-ui, sans-serif;
}

.map-wrapper {
  position: relative;
  width: 800px;
  height: 400px;
  background-color: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.map-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.car-element {
  position: absolute;
  font-size: 36px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  /* Tránh giật lag bằng cách tối ưu hóa render layer của trình duyệt */
  will-change: transform; 
}

.marker {
  position: absolute;
  transform: translate(-50%, -100%);
  z-index: 5;
}

.label {
  background: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  white-space: nowrap;
}

/* Hiệu ứng sóng Radar cho điểm đón A */
.pulse {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: rgba(0, 177, 79, 0.4);
  border-radius: 50%;
  animation: radar 2s infinite;
}

@keyframes radar {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
}

.control-panel {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
  border: 1px solid #f1f5f9;
}

button {
  width: 100%;
  padding: 14px;
  background-color: #00B14F;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background-color: #009642;
}

.btn-disabled {
  background-color: #94a3b8 !important;
  cursor: not-allowed;
}
</style>
