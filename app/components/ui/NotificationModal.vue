<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isOpen && modalData"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <!-- Backdrop mờ nền -->
          <div
            class="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
            @click="handleClose"
          />

          <!-- Modal Container (Tự co giãn theo kích cỡ ảnh nhưng có giới hạn max) -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-3"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-3"
          >
            <div
              v-if="isOpen && modalData"
              class="relative w-fit max-w-[min(92vw,560px)] max-h-[88vh] flex flex-col items-center z-10 animate-in select-none"
            >
              <!-- Nút đóng (X) tròn nổi ở góc trên bên phải -->
              <button
                type="button"
                class="absolute -top-3 -right-3 sm:-top-3.5 sm:-right-3.5 size-8 sm:size-9 rounded-full bg-slate-900/90 hover:bg-black text-white shadow-xl border border-white/20 flex items-center justify-center z-30 transition-all hover:scale-110 active:scale-90 cursor-pointer"
                aria-label="Đóng thông báo"
                @click="handleClose"
              >
                <UIcon name="i-lucide-x" class="size-4 sm:size-5" />
              </button>

              <!-- Khung Modal tự co giãn khít theo ảnh -->
              <div
                class="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex flex-col w-fit max-h-[85vh]"
              >
                <!-- Ảnh Banner (Bấm vào ảnh sẽ mở link) -->
                <div
                  class="relative overflow-hidden cursor-pointer group flex items-center justify-center bg-slate-950/5 dark:bg-slate-950/30"
                  :title="modalData.link ? 'Nhấp để xem' : ''"
                  @click="handleAction"
                >
                  <img
                    :src="resolveImageUrl(modalData.image)"
                    :alt="modalData.title || 'Thông báo'"
                    class="w-auto h-auto max-w-[min(92vw,560px)] max-h-[72vh] object-contain block transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                </div>

                <!-- Chân Modal: Gọn gàng, tinh tế -->
                <div
                  v-if="modalData.link || modalData.title"
                  class="w-full px-4 py-3 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800"
                >
                  <p
                    v-if="modalData.title"
                    class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate flex-1"
                  >
                    {{ modalData.title }}
                  </p>

                  <button
                    v-if="modalData.link"
                    type="button"
                    class="shrink-0 inline-flex items-center gap-1.5 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-primary/30 hover:shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer ml-auto"
                    @click="handleAction"
                  >
                    <span>{{ modalData.button_text || 'Xem chi tiết' }}</span>
                    <UIcon name="i-lucide-arrow-right" class="size-3.5 sm:size-4" />
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { popupService, type PopupModalData } from '~/services/popup.service'
import { resolveImageUrl } from '~/utils'

const isOpen = ref(false)
const modalData = ref<PopupModalData | null>(null)

async function checkAndShowModal() {
  try {
    const data = await popupService.getPublicPopupModal()
    if (!data || !data.is_active || !data.image) {
      return
    }

    modalData.value = data
    const modalId = data.id || 'default'
    const updatedAt = String(data.updated_at || '0')
    const frequency = data.display_frequency || 'new_only'

    // 1. Chế độ chỉ hiển thị khi có popup mới (Khuyên dùng)
    if (frequency === 'new_only') {
      const savedInfo = localStorage.getItem('ht_popup_seen')
      if (savedInfo) {
        try {
          const parsed = JSON.parse(savedInfo)
          // Nếu đã xem popup này (cùng id và cùng thời điểm cập nhật updated_at) thì không hiện lại
          if (parsed.id === modalId && String(parsed.updated_at) === updatedAt) {
            return
          }
        } catch {
          // ignore parsing error
        }
      }
    } else if (frequency === 'daily') {
      const storageKey = `ht_popup_seen_${modalId}`
      const savedInfo = localStorage.getItem(storageKey)
      if (savedInfo) {
        try {
          const parsed = JSON.parse(savedInfo)
          const seenTime = parsed.timestamp || 0
          const savedUpdated = parsed.updated_at || ''

          // Nếu cấu hình modal chưa bị thay đổi và xem trong vòng 24 giờ qua thì không hiện lại
          const isWithin24Hours = Date.now() - seenTime < 24 * 60 * 60 * 1000
          if (isWithin24Hours && String(savedUpdated) === updatedAt) {
            return
          }
        } catch {
          // ignore parsing error
        }
      }
    } else if (frequency === 'session') {
      const sessionKey = `ht_popup_session_${modalId}_${updatedAt}`
      if (sessionStorage.getItem(sessionKey)) {
        return
      }
    }

    // Hiển thị modal sau một thoáng ngắn để trang tải mượt mà
    setTimeout(() => {
      isOpen.value = true
    }, 600)
  } catch {
    // Không làm gián đoạn người dùng nếu API lỗi
  }
}

function recordSeen() {
  if (!modalData.value) return
  const modalId = modalData.value.id || 'default'
  const updatedAt = String(modalData.value.updated_at || '0')
  const frequency = modalData.value.display_frequency || 'new_only'

  // Luôn ghi nhận đã xem popup hiện tại
  localStorage.setItem(
    'ht_popup_seen',
    JSON.stringify({
      id: modalId,
      updated_at: updatedAt,
      timestamp: Date.now(),
    })
  )

  if (frequency === 'daily') {
    localStorage.setItem(
      `ht_popup_seen_${modalId}`,
      JSON.stringify({
        timestamp: Date.now(),
        updated_at: updatedAt,
      })
    )
  } else if (frequency === 'session') {
    sessionStorage.setItem(`ht_popup_session_${modalId}_${updatedAt}`, '1')
  }
}

function handleClose() {
  isOpen.value = false
  recordSeen()
}

function handleAction() {
  if (!modalData.value?.link) return
  const link = modalData.value.link
  isOpen.value = false
  recordSeen()

  if (link.startsWith('http://') || link.startsWith('https://')) {
    window.open(link, '_blank')
  } else {
    navigateTo(link)
  }
}

onMounted(() => {
  checkAndShowModal()
})
</script>
