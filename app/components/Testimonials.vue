<script setup lang="ts">
interface Testimonial {
  name: string
  role: string
  avatar: string
  review: string
}

const testimonials: Testimonial[] = [
  { name: 'Nguyễn Văn Minh', role: 'Khách hàng Hà Nội', avatar: 'https://i.pravatar.cc/150?img=1', review: 'Đặt xe Hà Nội đi Sapa rất nhanh, tài xế đúng giờ, xe sạch sẽ và giá minh bạch.' },
  { name: 'Trần Thị Lan', role: 'Khách doanh nghiệp', avatar: 'https://i.pravatar.cc/150?img=5', review: 'Dịch vụ đưa đón sân bay chuyên nghiệp, hỗ trợ xuất hóa đơn nhanh chóng.' },
  { name: 'Lê Quốc Bảo', role: 'Khách hàng TP.HCM', avatar: 'https://i.pravatar.cc/150?img=12', review: 'Ứng dụng dễ sử dụng, xem trước giá cước rõ ràng và không phát sinh chi phí.' },
  { name: 'Phạm Thu Hương', role: 'Khách du lịch', avatar: 'https://i.pravatar.cc/150?img=16', review: 'Gia đình tôi thuê xe đi Hạ Long, tài xế thân thiện và hỗ trợ rất nhiệt tình.' },
  { name: 'Đặng Hoàng Nam', role: 'Khách VIP', avatar: 'https://i.pravatar.cc/150?img=20', review: 'Xe đời mới, nội thất sạch đẹp và tài xế luôn đúng giờ.' },
  { name: 'Vũ Ngọc Anh', role: 'Khách sân bay', avatar: 'https://i.pravatar.cc/150?img=25', review: 'Chuyến bay bị delay nhưng tổng đài hỗ trợ đổi giờ đón miễn phí.' },
  { name: 'Hoàng Đức Anh', role: 'Khách Đà Nẵng', avatar: 'https://i.pravatar.cc/150?img=30', review: 'Đặt xe Đà Nẵng đi Hội An nhanh chóng, giá niêm yết rất rõ ràng.' },
  { name: 'Ngô Thanh Tùng', role: 'Khách thường xuyên', avatar: 'https://i.pravatar.cc/150?img=35', review: 'Tôi đã sử dụng hơn 20 chuyến và luôn hài lòng với chất lượng dịch vụ.' },
  { name: 'Lý Thanh Bình', role: 'Khách gia đình', avatar: 'https://i.pravatar.cc/150?img=40', review: 'Xe rộng rãi, phù hợp gia đình có trẻ nhỏ và nhiều hành lý.' },
  { name: 'Đỗ Minh Quân', role: 'Khách công tác', avatar: 'https://i.pravatar.cc/150?img=45', review: 'Đặt xe đi tỉnh rất tiện, tài xế thông thạo đường sá và chuyên nghiệp.' },
  { name: 'Phan Hải Yến', role: 'Khách du lịch', avatar: 'https://i.pravatar.cc/150?img=50', review: 'Tổng đài hỗ trợ 24/7 và phản hồi cực kỳ nhanh.' },
  { name: 'Nguyễn Đức Thịnh', role: 'Khách VIP', avatar: 'https://i.pravatar.cc/150?img=55', review: 'Dịch vụ đáng tin cậy mỗi khi tôi cần xe đi sân bay.' },
  { name: 'Trần Văn Hùng', role: 'Khách Hải Phòng', avatar: 'https://i.pravatar.cc/150?img=60', review: 'Chuyến đi Hải Phòng rất thoải mái, tài xế lái xe an toàn và đúng giờ.' },
  { name: 'Lê Thị Mai', role: 'Khách Nha Trang', avatar: 'https://i.pravatar.cc/150?img=65', review: 'Đặt xe sân bay Cam Ranh về trung tâm Nha Trang rất tiện lợi và giá tốt.' },
  { name: 'Phạm Văn Tuấn', role: 'Khách thường xuyên', avatar: 'https://i.pravatar.cc/150?img=70', review: 'Đã dùng dịch vụ nhiều lần, chất lượng ổn định và tài xế rất chuyên nghiệp.' },
  { name: 'Đào Thị Hoa', role: 'Khách Huế', avatar: 'https://i.pravatar.cc/150?img=75', review: 'Xe đón tận nhà ga, tài xế thân thiện và giúp tôi mang hành lý.' },
  { name: 'Võ Minh Đức', role: 'Khách Cần Thơ', avatar: 'https://i.pravatar.cc/150?img=80', review: 'Chuyến đi về quê êm ái, xe sạch và điều hòa mát lạnh.' },
  { name: 'Bùi Thị Thanh', role: 'Khách doanh nghiệp', avatar: 'https://i.pravatar.cc/150?img=85', review: 'Hợp đồng vận chuyển cho công ty rất chuyên nghiệp và xuất hóa đơn nhanh.' },
  { name: 'Dương Văn Thành', role: 'Khách Vũng Tàu', avatar: 'https://i.pravatar.cc/150?img=90', review: 'Đặt xe đi Vũng Tàu cuối tuần, tài xế nhiệt tình và xe đẹp.' },
  { name: 'Hoàng Thị Ngọc', role: 'Khách Hội An', avatar: 'https://i.pravatar.cc/150?img=95', review: 'Dịch vụ rất tốt, tôi sẽ tiếp tục sử dụng trong các chuyến đi sau.' },
  { name: 'Mai Quốc Khánh', role: 'Khách VIP', avatar: 'https://i.pravatar.cc/150?img=11', review: 'Luôn lựa chọn Happy Trip cho mọi chuyến công tác vì sự tin cậy.' },
]
</script>

<template>
  <section class="py-24">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mb-16 text-center">
        <h2 class="text-4xl font-bold tracking-tight">
          Hơn 10.000+ khách hàng tin tưởng
        </h2>
        <p class="mt-4 text-muted max-w-2xl mx-auto">
          Những đánh giá thực tế từ khách hàng đã sử dụng dịch vụ đặt xe của chúng tôi.
        </p>
      </div>

      <div class="relative overflow-hidden space-y-8">

        <UMarquee pause-on-hover :repeat="2" :ui="{ root: '[--duration:60s]', content: 'gap-6' }">
          <UPageCard
            v-for="(item, idx) in testimonials"
            :key="`r1-${idx}`"
            variant="subtle"
            class="w-72 shrink-0 h-40 flex flex-col"
          >
            <div class="flex items-center gap-3 mb-3">
              <UAvatar :src="item.avatar" :alt="item.name" size="sm" />
              <div>
                <div class="font-semibold text-sm">{{ item.name }}</div>
                <div class="text-xs text-muted">{{ item.role }}</div>
              </div>
            </div>
            <p class="text-sm leading-5 line-clamp-3">&ldquo;{{ item.review }}&rdquo;</p>
          </UPageCard>
        </UMarquee>

        <UMarquee pause-on-hover reverse :repeat="2" :ui="{ root: '[--duration:60s]', content: 'gap-6' }">
          <UPageCard
            v-for="(item, idx) in testimonials"
            :key="`r2-${idx}`"
            variant="subtle"
            class="w-72 shrink-0 h-40 flex flex-col"
          >
            <div class="flex items-center gap-3 mb-3">
              <UAvatar :src="item.avatar" :alt="item.name" size="sm" />
              <div>
                <div class="font-semibold text-sm">{{ item.name }}</div>
                <div class="text-xs text-muted">{{ item.role }}</div>
              </div>
            </div>
            <p class="text-sm leading-5 line-clamp-3">&ldquo;{{ item.review }}&rdquo;</p>
          </UPageCard>
        </UMarquee>
      </div>
    </div>
  </section>
</template>
