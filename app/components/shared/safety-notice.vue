<template>
  <div class="safety-notice">
    <div class="flex items-center gap-2 mb-3">
      <UIcon name="i-lucide-shield-check" class="size-5 text-orange-700" />
      <p class="font-semibold text-sm text-orange-900">Lưu ý quan trọng</p>
    </div>

    <p class="text-[13px] leading-relaxed text-orange-950 mb-3">
      Nếu tài xế <strong class="text-orange-900">gợi ý đi ngoài hệ thống</strong>,
      tiếp thị dịch vụ riêng, hoặc <strong class="text-orange-900">thay đổi tài xế/xe/SĐT</strong>
      so với thông tin Zalo OA, vui lòng báo ngay:
    </p>

    <div class="grid grid-cols-2 gap-2 mb-3">
      <a
        href="tel:0972970000"
        class="cta cta-solid"
      >
        <UIcon name="i-lucide-phone" class="size-4" />
        Gọi hotline
      </a>
      <a
        href="https://zalo.me/0972970000"
        target="_blank"
        rel="noopener"
        class="cta cta-outline"
      >
        <UIcon name="i-lucide-message-circle" class="size-4" />
        Nhắn Zalo
      </a>
    </div>

    <div class="reward-box">
      <UIcon name="i-lucide-gift" class="size-6 text-orange-700 shrink-0" />
      <p class="text-xs leading-snug text-orange-950">
        Tặng <strong class="text-orange-700 text-[13px]">500.000đ</strong> cho chuyến đi
        nếu bạn phản hồi đúng quy định.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.safety-notice {
  background: #FFF7ED;
  border: 2px solid #FB923C;
  border-radius: 12px;
  padding: 16px;
}

.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  transition: opacity 0.15s ease;
}
.cta:hover {
  opacity: 0.9;
}

.cta-solid {
  background: #EA580C;
  color: white;
}

.cta-outline {
  background: white;
  color: #9A3412;
  border: 1px solid #FB923C;
}

.reward-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border: 1px dashed #FB923C;
  border-radius: 10px;
  padding: 10px 12px;
}
</style>
