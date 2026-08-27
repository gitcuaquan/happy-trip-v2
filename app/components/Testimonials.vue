<script setup lang="ts">
interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  review: string;
}

const avatarImgs: string[] = [
  "avatar (2).jpeg",
  "avatar (3).jpeg",
  "avatar (4).jpeg",
  "avatar (5).jpeg",
  "avatar (6).jpeg",
];

const testimonials: Testimonial[] = [
  {
    name: "Lê Quốc Bảo",
    role: "Khách hàng TP.HCM",
    avatar: avatarImgs[2]!,
    review:
      "Ứng dụng dễ sử dụng, xem trước giá cước rõ ràng và không phát sinh chi phí.",
  },
  {
    name: "Dương Văn Thành",
    role: "Khách Vũng Tàu",
    avatar: avatarImgs[3]!,
    review: "Đặt xe đi Vũng Tàu cuối tuần, tài xế nhiệt tình và xe đẹp.",
  },
  {
    name: "Võ Minh Đức",
    role: "Khách Cần Thơ",
    avatar: avatarImgs[1]!,
    review: "Chuyến đi về quê êm ái, xe sạch và điều hòa mát lạnh.",
  },
  {
    name: "Lê Thị Mai",
    role: "Khách Nha Trang",
    avatar: avatarImgs[3]!,
    review:
      "Đặt xe sân bay Cam Ranh về trung tâm Nha Trang rất tiện lợi và giá tốt.",
  },
  {
    name: "Trần Thị Lan",
    role: "Khách doanh nghiệp Sài Gòn",
    avatar: avatarImgs[1]!,
    review:
      "Dịch vụ đưa đón sân bay chuyên nghiệp, hỗ trợ xuất hóa đơn nhanh chóng.",
  },
  {
    name: "Phạm Thu Hương",
    role: "Khách du lịch Đà Lạt",
    avatar: avatarImgs[3]!,
    review:
      "Gia đình tôi thuê xe đi Đà Lạt, tài xế thân thiện và hỗ trợ rất nhiệt tình.",
  },
  {
    name: "Đặng Hoàng Nam",
    role: "Khách VIP TP.HCM",
    avatar: avatarImgs[4]!,
    review: "Xe đời mới, nội thất sạch đẹp và tài xế luôn đúng giờ.",
  },
  {
    name: "Ngô Thanh Tùng",
    role: "Khách thường xuyên Bình Dương",
    avatar: avatarImgs[2]!,
    review:
      "Tôi đã sử dụng hơn 20 chuyến và luôn hài lòng với chất lượng dịch vụ.",
  },
  {
    name: "Lý Thanh Bình",
    role: "Khách gia đình Long An",
    avatar: avatarImgs[3]!,
    review: "Xe rộng rãi, phù hợp gia đình có trẻ nhỏ và nhiều hành lý.",
  },
  {
    name: "Đỗ Minh Quân",
    role: "Khách công tác Bình Phước",
    avatar: avatarImgs[4]!,
    review:
      "Đặt xe đi tỉnh rất tiện, tài xế thông thạo đường sá và chuyên nghiệp.",
  },
  {
    name: "Phan Hải Yến",
    role: "Khách Hồ Tràm",
    avatar: avatarImgs[0]!,
    review: "Tổng đài hỗ trợ 24/7 và phản hồi cực kỳ nhanh.",
  },
  {
    name: "Bùi Thị Thanh",
    role: "Khách doanh nghiệp Đồng Nai",
    avatar: avatarImgs[2]!,
    review:
      "Hợp đồng vận chuyển cho công ty rất chuyên nghiệp và xuất hóa đơn nhanh.",
  },
  {
    name: "Phạm Văn Tuấn",
    role: "Khách thường xuyên Tây Ninh",
    avatar: avatarImgs[4]!,
    review:
      "Đã dùng dịch vụ nhiều lần, chất lượng ổn định và tài xế rất chuyên nghiệp.",
  },
  {
    name: "Mai Quốc Khánh",
    role: "Khách VIP Sài Gòn",
    avatar: avatarImgs[0]!,
    review: "Luôn lựa chọn Happy Trip cho mọi chuyến công tác vì sự tin cậy.",
  },
  {
    name: "Vũ Ngọc Anh",
    role: "Khách sân bay Tân Sơn Nhất",
    avatar: avatarImgs[0]!,
    review: "Chuyến bay bị delay nhưng tổng đài hỗ trợ đổi giờ đón miễn phí.",
  },
  {
    name: "Nguyễn Đức Thịnh",
    role: "Khách Long Hải",
    avatar: avatarImgs[1]!,
    review: "Dịch vụ đáng tin cậy mỗi khi tôi cần xe đi sân bay.",
  },
];
</script>

<template>
  <section class="py-24">
    <UContainer>
      <div class="text-center mb-12">
        <p class="text-sm font-semibold text-primary uppercase tracking-widest mb-2">
          Khách hàng nói gì
        </p>
        <h2 class="text-3xl md:text-4xl font-bold">
          Hơn 60.000+ khách hàng tin tưởng
        </h2>
        <div class="mx-auto w-16 h-1 rounded-full bg-primary mt-4" />
        <p class="mt-4 text-muted max-w-xl mx-auto">
          Những đánh giá thực tế từ khách hàng đã sử dụng dịch vụ đặt xe của chúng tôi.
        </p>
      </div>
    </UContainer>

    <div class="relative overflow-hidden space-y-2">
      <UMarquee
        pause-on-hover
        :repeat="2"
        :ui="{ root: '[--duration:60s]', content: 'gap-6' }"
      >
        <UPageCard
          v-for="(item, idx) in testimonials"
          :key="`r1-${idx}`"
          variant="subtle"
          class="w-72 shrink-0 h-40 my-5 flex flex-col"
        >
          <div class="flex items-center gap-3 mb-3">
            <img
              :src="`/images/avatar/${item.avatar}`"
              :alt="item.name"
              class="size-9 rounded-full object-cover shrink-0"
              loading="lazy"
            />
            <div>
              <div class="font-semibold text-sm">{{ item.name }}</div>
              <div class="text-xs text-muted">{{ item.role }}</div>
            </div>
          </div>
          <p class="text-sm leading-5 line-clamp-3">
            &ldquo;{{ item.review }}&rdquo;
          </p>
        </UPageCard>
      </UMarquee>

      <UMarquee
        pause-on-hover
        reverse
        :repeat="2"
        :ui="{ root: '[--duration:60s]', content: 'gap-6' }"
      >
        <UPageCard
          v-for="(item, idx) in testimonials"
          :key="`r2-${idx}`"
          variant="subtle"
          class="w-72 shrink-0 h-40 my-5 flex flex-col"
        >
          <div class="flex items-center gap-3 mb-3">
            <img
              :src="`/images/avatar/${item.avatar}`"
              :alt="item.name"
              class="size-9 rounded-full object-cover shrink-0"
              loading="lazy"
            />
            <div>
              <div class="font-semibold text-sm">{{ item.name }}</div>
              <div class="text-xs text-muted">{{ item.role }}</div>
            </div>
          </div>
          <p class="text-sm leading-5 line-clamp-3">
            &ldquo;{{ item.review }}&rdquo;
          </p>
        </UPageCard>
      </UMarquee>
    </div>
  </section>
</template>
