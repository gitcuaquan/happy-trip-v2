<template>
  <section class="py-20 bg-white">
    <UContainer>
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-slate-900 mb-4">Tại Sao Nên Chọn Happy Trip?</h2>
        <p class="text-slate-500 text-lg">Những đặc quyền chỉ dành riêng cho đối tác của chúng tôi.</p>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden max-w-4xl mx-auto">
        <div
          v-for="(benefit, index) in benefits"
          :key="benefit.label"
          class="border-b border-slate-100 last:border-0 transition-colors"
          :class="openIndex === index ? 'bg-orange-50/50' : 'bg-transparent'"
        >
          <button
            class="w-full flex justify-between items-center py-5 px-6 text-left focus:outline-none hover:bg-orange-50/30 transition-colors"
            @click="toggleAccordion(index)"
          >
            <span
              class="text-lg font-bold transition-colors"
              :class="openIndex === index ? 'text-primary' : 'text-slate-700'"
            >
              {{ benefit.label }}
            </span>
            <UIcon
              name="i-lucide-chevron-down"
              class="w-5 h-5 transition-transform"
              :class="openIndex === index ? 'rotate-180 text-primary' : 'text-slate-400'"
            />
          </button>

          <Transition
            enter-active-class="transition-all duration-300"
            leave-active-class="transition-all duration-300"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-96 opacity-100"
            leave-from-class="max-h-96 opacity-100"
            leave-to-class="max-h-0 opacity-0"
          >
            <div v-show="openIndex === index" class="px-6 py-4 text-slate-600 leading-relaxed overflow-hidden">
              {{ benefit.content }}
            </div>
          </Transition>
        </div>
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
const openIndex = ref(0)

const benefits = [
  {
    label: 'Gia tăng thu nhập, ổn định cuộc sống',
    content: 'Happy Trip sẽ sắp xếp khách hàng trên các xe, tối ưu cung đường di chuyển theo phường quận do đó giảm được các chi phí như: nhiên liệu, thời gian di chuyển trong nội thành, tăng số chuyến và cho thu nhập hiệu quả.'
  },
  {
    label: 'Tối ưu cung đường, chi phí vận hành tăng chuyến',
    content: 'Hệ thống tự động ghép chuyến thông minh, giúp bạn không bao giờ chạy xe rỗng chiều về, tiết kiệm tối đa chi phí xăng dầu và khấu hao xe.'
  },
  {
    label: 'Khách hàng có sẵn, yên tâm vận hành',
    content: 'Nguồn khách hàng dồi dào từ hệ thống đối tác và chiến dịch marketing của Happy Trip giúp tài xế luôn có chuyến đều đặn mỗi ngày.'
  },
  {
    label: 'Lái xe an toàn, kinh doanh bền vững',
    content: 'Ứng dụng hỗ trợ theo dõi lộ trình, cảnh báo an toàn và chính sách bảo hiểm toàn diện giúp đối tác yên tâm trên mọi nẻo đường.'
  }
]

const toggleAccordion = (index: number) => {
  openIndex.value = openIndex.value === index ? -1 : index
}
</script>
