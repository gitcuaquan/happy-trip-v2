<template>
  <section class="relative bg-linear-to-br from-orange-500 to-orange-600 pt-24 pb-32 overflow-hidden">
    <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
    
    <UContainer class="relative z-10">
      <div class="text-center text-white space-y-6">
        <h1 class="text-5xl lg:text-6xl font-black leading-tight">
          Trở Thành Đối Tác <br/>
          <span class="text-orange-200">Tài Xế Happy Trip</span>
        </h1>
        
        <p class="text-lg md:text-xl text-orange-50 max-w-2xl mx-auto">
          Gia tăng thu nhập, làm chủ thời gian và nhận hàng ngàn ưu đãi hấp dẫn. 
          Hệ thống thông minh giúp bạn tối ưu từng chuyến đi.
        </p>

        <div class="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          <UButton 
            size="lg" 
            color="neutral"
            @click="scrollToRegister"
            class="rounded-full font-bold text-lg hover:bg-slate-50"
          >
            Đăng ký ngay
          </UButton>
          
          <UButton 
            to="/driver/login"
            size="lg"
            color="neutral"
            variant="outline"
            class="rounded-full font-bold text-lg border-2 border-white"
          >
            Đăng nhập đối tác
          </UButton>
        </div>
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'scroll-to-register'): void
}>()

const scrollToRegister = () => {
  emit('scroll-to-register')
  const el = document.getElementById('register-section')
  el?.scrollIntoView({ behavior: 'smooth' })
}
</script>
