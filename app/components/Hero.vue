<template>
  <section class="bg-gray-300 bg-image-hero bg-gradient-to-b to-slate-50 from-primary/30">
    <UContainer class="min-h-screen flex flex-col md:flex-row md:items-center gap-5 py-4">
      <div class="md:w-1/2 w-full text-center">
        <UiCreateOrder />
      </div>
      <div class="md:w-1/2 w-full flex flex-col md:gap-5 gap-3">
        <div class="text-center md:text-left">
          <div
            class="border-1 inline-flex items-center gap-3 py-1 rounded-2xl px-4 text-[13px] backdrop-blur-sm text-dark md:text-white border-white bg-primary/10">
            <div class="bg-primary p-1 fw-bold rounded-full w-3 h-3 animate-pulse"></div>
            Đặt xe 24/7 - Hotline: 0972 97 0000
          </div>
        </div>
        <h1 class="md:text-5xl text-center md:text-left font-bold text-dark md:text-white drop-shadow-lg">
          Xe Ghép, Xe Tiện Chuyến Hàng Đầu Việt Nam
        </h1>
        <h1
          class="md:text-5xl custom-font text-3xl italic flex gap-3 items-center flex-nowrap font-black text-primary justify-center md:justify-start drop-shadow-lg">
          HappyTrip
          <div class="text-white italic bg-primary px-3 py-1 rounded-lg overflow-hidden">
            <UiSplitText />
          </div>
        </h1>
        <p class="md:text-xl text-xs text-center md:text-left text-dark md:text-white/90 mt-5 drop-shadow-md">
          Tận hưởng những chuyến đi an toàn cùng dòng xe hiện đại. Đưa đón tận
          nơi với dịch vụ chuyên nghiệp chuẩn 5 sao trên mọi nẻo đường Hồ Chí
          Minh và các tỉnh lân cận.
        </p>
      </div>
    </UContainer>
  </section>
</template>

<script lang="ts" setup>
onMounted(() => {
  // console.log("Hero mounted");
});
</script>

<style scoped>
@media screen and (min-width: 768px) {
  .bg-image-hero {
    background:
      linear-gradient(rgba(15, 23, 42, 0.4), rgba(33, 31, 12, 0.8)),
      url("/images/hero-bg.jpg");
    background-size: cover;
    background-position: center 60%;
  }
}
</style>
