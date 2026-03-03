<template>
  <div class="bg-gray-300 bg-image-hero">
    <UContainer class="min-h-screen md:flex md:items-center">
      <div class="w-1/2">
        <h1 class="text-7xl font-bold mb-5 text-white drop-shadow-lg">
          Hành Trình Mới
        </h1>
        <h1 class="text-7xl italic font-bold text-primary drop-shadow-lg">
          Trải Nghiệm Mới
        </h1>
        <p class="text-2xl text-white mt-5 drop-shadow-md">
          Tận hưởng những chuyến đi an toàn, hiện đại và tiết kiệm nhất cùng
          Happy Trip. Dịch vụ xe ghép, xe tiện chuyến hàng đầu Việt Nam.
        </p>
      </div>
    </UContainer>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.bg-image-hero {
  background:
    linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.8)),
    url("https://images.unsplash.com/photo-1511919884226-fd3cad34687c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80");
  background-size: cover;
  background-position: center 60%;
}
</style>
