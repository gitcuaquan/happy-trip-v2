<template>
  <div class="bg-gray-300 bg-image-hero">
    <UContainer class="min-h-screen md:flex md:items-center gap-5">
      <div class="md:w-1/2 w-full text-center">
       <UiCreateOrder />
      </div>
      <div class="md:w-1/2 w-full flex flex-col md:gap-5 gap-3">
        <div class="text-center md:text-left">
          <div
            class="border-1 inline-flex items-center gap-3 py-1 rounded-2xl px-4 text-[13px] backdrop-blur-sm text-white border-white bg-primary/10"
          >
            <div
              class="bg-primary p-1 fw-bold rounded-full w-3 h-3 animate-pulse"
            ></div>
            Đặt xe 24/7 - Hotline: 0987654321
          </div>
        </div>
        <h1
          class="md:text-4xl text-2xl text-center md:text-left font-bold text-white drop-shadow-lg"
        >
          Xe Ghép, Xe Tiện Chuyến Hàng Đầu Việt Nam
        </h1>
        <h1
          class="md:text-7xl custom-font text-3xl italic flex gap-3 items-center flex-nowrap font-black text-primary justify-center md:justify-start drop-shadow-lg"
        >
          HappyTrip
          <div
            class="text-white italic bg-primary px-3 py-1 rounded-lg overflow-hidden"
          >
            <UiSplitText />
          </div>
        </h1>
        <p
          class="md:text-2xl text-md text-center md:text-left text-white/90 mt-5 drop-shadow-md"
        >
          Dịch Vụ Xe Ghép, Xe Tiện Chuyến Bà Rịa, Vũng Tàu - Cần Thơ - HCM Giá
          Rẻ, An Toàn, Uy Tín
        </p>
      </div>
    </UContainer>
  </div>
</template>

<script lang="ts" setup>
onMounted(() => {
  // console.log("Hero mounted");
});
</script>

<style scoped>
.bg-image-hero {
  background:
    linear-gradient(rgba(15, 23, 42, 0.4), rgba(33, 31, 12, 0.8)),
    url("/images/hero-bg.jpg");
  background-size: cover;
  background-position: center 60%;
}
</style>
