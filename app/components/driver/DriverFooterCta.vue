<template>
  <section class="py-16 bg-linear-to-br from-primary to-orange-600 text-white text-center">
    <UContainer>
      <h2 class="text-3xl md:text-4xl font-black mb-4">Sẵn Sàng Bắt Đầu?</h2>
      <p class="text-xl text-orange-50 mb-8 max-w-2xl mx-auto">
        Đăng ký ngay để nhận các cuốc xe đầu tiên hôm nay
      </p>

      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <UButton
          size="lg"
          color="neutral"
          @click="scrollToRegister"
          class="rounded-full font-bold"
        >
          Đăng Ký Ngay
        </UButton>

        <UButton
          size="lg"
          color="neutral"
          variant="outline"
          icon="i-lucide-phone"
          @click="callHotline"
          class="rounded-full font-bold border-2 border-white"
        >
          Gọi {{ hotline }}
        </UButton>
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
const hotline = '0972 97 0000'

const scrollToRegister = () => {
  const el = document.getElementById('register-section')
  el?.scrollIntoView({ behavior: 'smooth' })
}

const callHotline = () => {
  window.location.href = `tel:${hotline.replace(/\s/g, '')}`
}
</script>
