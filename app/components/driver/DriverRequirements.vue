<template>
  <section class="py-20 bg-slate-50">
    <UContainer>
      <h2 class="text-3xl font-bold text-slate-900 text-center mb-12">Yêu Cầu Đăng Ký</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <CardItem v-for="req in requirements" :key="req.title" :item="req" />
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
import CardItem from '../shared/card-item.vue';


const requirements = [
  {
    icon: 'i-lucide-id-card',
    title: 'Giấy tờ tùy thân',
    description: 'CCCD/CMND còn hạn sử dụng, rõ nét.'
  },
  {
    icon: 'i-lucide-file-text',
    title: 'Bằng lái xe',
    description: 'Bằng lái xe hạng B2 trở lên còn hiệu lực.'
  },
  {
    icon: 'i-lucide-car-front',
    title: 'Giấy tờ xe',
    description: 'Cà vẹt xe, bảo hiểm TNDS, đăng kiểm kinh doanh.'
  },
  {
    icon: 'i-lucide-smartphone',
    title: 'Điện thoại',
    description: 'Smartphone iOS/Android có kết nối 4G/5G.'
  }
]
</script>
