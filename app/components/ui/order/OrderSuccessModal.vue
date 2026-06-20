<template>
<UModal
  :open="open"
  :dismissible="false"
    :close="false"
  :ui="{
    content: 'sm:max-w-sm md:max-w-lg overflow-hidden',
    overlay: 'bg-black/40 backdrop-blur-sm',
  }"
  @update:open="$emit('update:open', $event)"
>
  <template #body>
    <div class="text-center relative overflow-hidden">
      <div class="mb-6 relative z-10 flex justify-center">
        <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
          <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
      </div>

      <div class="relative z-10">
        <h3 class="text-2xl font-black text-slate-800 mb-2 uppercase tracking-wide">
          Đặt xe thành công!
        </h3>
        <p class="text-slate-500 text-left text-sm mb-6 leading-relaxed">
          Hệ thống đã ghi nhận chuyến đi của bạn. Vui lòng kiểm tra lại
          thông tin chuyến đi được gửi qua Zalo hoặc SMS. Tài xế sẽ liên hệ
          bạn sớm nhất để xác nhận và hỗ trợ trong quá trình di chuyển.
        </p>

        <div class="bg-slate-50 rounded-xl mb-6 text-left border border-slate-100 shadow-sm flex flex-col">
          <div class="px-4 py-4 flex gap-3 items-start">
            <div class="flex flex-col items-center mt-0.5 shrink-0">
              <div class="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
                <div class="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div class="w-px h-8 bg-gradient-to-b from-blue-200 to-orange-200 my-1" />
              <div class="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center">
                <UIcon name="i-lucide-map-pin" class="size-3.5 text-primary" />
              </div>
            </div>
            <div class="flex flex-col gap-4 flex-1 min-w-0">
              <div>
                <p class="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">Điểm đón</p>
                <p class="text-sm font-semibold text-slate-800 leading-snug break-words">
                  {{ successData.departure_address_1 }}
                </p>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ [successData.departure_district, successData.departure_city].filter(Boolean).join(', ') }}
                </p>
              </div>
              <div>
                <p class="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-0.5">Điểm đến</p>
                <p class="text-sm font-semibold text-slate-800 leading-snug break-words">
                  {{ successData.destination_address_1 }}
                </p>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ [successData.destination_district, successData.destination_city].filter(Boolean).join(', ') }}
                </p>
              </div>
            </div>
          </div>
          <div class="px-4 py-3 border-t border-slate-200 flex justify-between items-center">
            <span class="text-xs text-slate-500 font-medium">Loại xe</span>
            <span class="text-sm font-bold text-slate-800">{{ successData.service_name }}</span>
          </div>
          <div class="bg-orange-50 p-4 rounded-b-xl border-t border-orange-100 flex justify-between items-center">
            <span class="text-xs text-primary font-bold uppercase tracking-wide">Tổng tiền:</span>
            <span class="text-lg font-black text-primary">{{ numberToCurrency(successData.price) }}</span>
          </div>
        </div>

        <SharedSafetyNotice />
      </div>
    </div>
  </template>

  <template #footer>
    <div class="grid grid-cols-2 gap-3.5 w-full">
      <UButton
        color="primary"
        block
        variant="outline"
        size="lg"
        label="Đã hiểu"
        @click="goHome"
      />
      <UButton
        to="/history"
        block
        size="lg"
        variant="outline"
        icon="i-lucide-history"
        label="Xem lịch sử chuyến đi"
      />
    </div>
  </template>
</UModal>
</template>

<script lang="ts" setup>
interface SuccessData {
  departure_city: string
  departure_district: string
  departure_address_1: string
  destination_city: string
  destination_district: string
  destination_address_1: string
  service_name: string
  price: number
}

defineProps<{
  open: boolean
  successData: SuccessData
}>()

const emit = defineEmits<{
  "update:open": [value: boolean]
}>()

function goHome() {
  emit("update:open", false)
  navigateTo("/")
}
</script>

<style scoped>
.checkmark {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: block;
  stroke-width: 3;
  stroke: #fff;
  stroke-miterlimit: 10;
  margin: 0 auto;
  box-shadow: inset 0px 0px 0px #f97316;
  animation:
    fill 0.4s ease-in-out 0.4s forwards,
    scale 0.3s ease-in-out 0.9s both;
}

.checkmark__circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke-miterlimit: 10;
  stroke: #f97316;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark__check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes scale {
  0%,
  100% {
    transform: none;
  }

  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
}

@keyframes fill {
  100% {
    box-shadow: inset 0px 0px 0px 50px #f97316;
  }
}
</style>
