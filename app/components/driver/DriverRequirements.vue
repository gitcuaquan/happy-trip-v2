<template>
  <section class="py-20 bg-slate-50">
    <UContainer>
      <h2 class="text-3xl font-bold text-slate-900 text-center mb-12">Yêu Cầu Đăng Ký</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="req in requirements"
          :key="req.title"
          class="bg-white p-8 rounded-2xl text-center border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <div class="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
            <UIcon :name="req.icon" class="w-8 h-8" />
          </div>
          
          <h3 class="font-bold text-slate-800 text-lg mb-3">{{ req.title }}</h3>
          <p class="text-slate-500 text-sm">{{ req.description }}</p>
        </div>
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
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
