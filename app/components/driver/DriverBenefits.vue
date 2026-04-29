<template>
  <section class="py-20 bg-white">
    <UContainer>
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-slate-900 mb-4">Tại Sao Nên Chọn Happy Trip?</h2>
        <p class="text-slate-500 text-lg">Những đặc quyền chỉ dành riêng cho đối tác của chúng tôi.</p>
      </div>

      <div class="max-w-4xl mx-auto">
        <CollapsibleCard :items="benefits" />
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
import CollapsibleCard from '../shared/collapsible-card.vue';

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
</script>