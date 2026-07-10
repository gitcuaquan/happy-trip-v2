<template>
  <div>
    <UContainer class="pt-10 pb-0">
      <!-- === HEADER + HERO === -->
      <div class="text-center mb-12">
        <h2
          class="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4"
          v-html="introduce.title"
        />
        <div class="w-24 h-1.5 bg-primary mx-auto rounded-full mb-6" />
        <p class="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
          {{ introduce.description }}
        </p>
      </div>

      <div class="flex flex-col lg:flex-row gap-12 items-center mb-16">
        <!-- Cột trái -->
        <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardItem
            v-for="benefit in introduce.benefits"
            :key="benefit.title"
            :item="benefit"
          />
        </div>

        <!-- Cột phải: Ảnh -->
        <div class="flex-1 relative">
          <div class="rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="/images/about.webp"
              alt="Đội ngũ Happy Trip"
              width="600"
              height="450"
              loading="lazy"
              class="w-full h-auto object-cover aspect-4/3"
            >
            <div class="absolute inset-0 bg-linear-to-t from-black/30 to-transparent rounded-2xl pointer-events-none" />
          </div>
          <div
            class="absolute bottom-5 left-5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-5 py-3 rounded-xl shadow-lg"
          >
            <p class="text-sm font-bold text-slate-800 dark:text-white">
              Chuẩn 5 sao
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Trên mọi nẻo đường
            </p>
          </div>
        </div>
      </div>
    </UContainer>

    <!-- === METRICS BAR === -->
    <div class="bg-primary py-10 mb-16">
      <UContainer>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div
            v-for="metric in introduce.metrics"
            :key="metric.value"
            class="text-center text-white"
          >
            <UIcon
              :name="metric.icon"
              class="size-8 mx-auto mb-2 opacity-90"
            />
            <p class="text-3xl md:text-4xl font-extrabold mb-1">
              {{ metric.value }}
            </p>
            <p class="text-sm font-medium opacity-90">
              {{ metric.label }}
            </p>
          </div>
        </div>
      </UContainer>
    </div>

    <UContainer class="pb-10">
      <!-- === GIÁ TRỊ CỐT LÕI === -->
      <div class="grid md:grid-cols-3 gap-6 mb-16">
        <CardItem
          v-for="coreValue in introduce.coreValues"
          :key="coreValue.title"
          :item="coreValue"
        />
      </div>

      <!-- === TẠI SAO CHỌN HAPPY TRIP === -->
      <div class="grid lg:grid-cols-2 gap-14 items-center mb-16">
        <!-- Cột trái -->
        <div>
          <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 leading-tight">
            Tại sao nên chọn <span class="text-primary">Happy</span> Trip?
          </h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Chúng tôi không chỉ cung cấp một chuyến đi, chúng tôi mang đến sự an tâm
            tuyệt đối trên mọi hành trình của bạn.
          </p>
          <div class="flex flex-col gap-3">
            <SharedFeatureList
              v-for="reason in introduce.reasons"
              :key="reason"
              :feature="reason"
            />
          </div>
        </div>

        <!-- Cột phải: 2 ảnh so le -->
        <div class="flex gap-4 items-start">
          <div class="flex-1 mt-10 rounded-2xl overflow-hidden shadow-lg">
            <img
              src="https://xetienchuyen.net/wp-content/uploads/2021/11/dich-vu-xe-ghep.jpg"
              alt="Tài xế Happy Trip"
              class="w-full h-56 object-cover"
              loading="lazy"
            >
          </div>
          <div class="flex-1 rounded-2xl overflow-hidden shadow-lg">
            <img
              src="https://dungminh.vn/wp-content/uploads/2026/02/Uu-diem-noi-bat-cuaXe-ghep-Ha-Noi-Uong-Bi-don-tan-nha-nhu-xe-rieng-ghe-ngoi-thoai-mai-chay-cao-toc-nhanh-va-em-han-che-say-xe-ma-chi-phi-van-tiet-kiem.jpg"
              alt="Xe Happy Trip"
              class="w-full h-56 object-cover"
              loading="lazy"
            >
          </div>
        </div>
      </div>

      <!-- === FOOTER INFO BAR === -->
      <div class="border-t border-slate-200 dark:border-slate-800 pt-8">
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
          <div
            v-for="(info, i) in introduce.info"
            :key="info.label"
            class="flex items-center gap-2.5 sm:px-10"
            :class="i !== 0 ? 'sm:border-l border-slate-200 dark:border-slate-700' : ''"
          >
            <div
              class="shrink-0 w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center"
            >
              <UIcon
                :name="info.icon"
                class="size-4 text-primary"
              />
            </div>
            <span class="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
              {{ info.label }}
            </span>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script lang="ts" setup>
import CardItem from '~/components/shared/card-item.vue'

const introduce = computed(() => ({
  title: 'Giới thiệu về <span class="text-primary">HAPPY TRIP</span>' as string,
  description: 'Kiến tạo giải pháp xe tiện chuyến và vận chuyển hàng đầu Việt Nam.',
  benefits: [
    {
      icon: 'i-lucide-shield-check',
      title: 'An toàn & Thuận tiện',
      description: 'Giải pháp đi chung thông minh với đội ngũ tài xế được tuyển chọn khắt khe, đảm bảo đúng giờ.'
    },
    {
      icon: 'i-lucide-zap',
      title: 'Tiết kiệm tối đa',
      description: 'Giảm thiểu chi phí xăng dầu và vận hành, đồng thời gia tăng thu nhập bền vững cho đối tác tài xế.'
    },
    {
      icon: 'i-lucide-headphones',
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ CSKH chuyên nghiệp luôn sẵn sàng lắng nghe và giải quyết mọi thắc mắc của bạn.'
    },
    {
      icon: 'i-lucide-car',
      title: 'Tiện nghi hiện đại',
      description: 'Dàn xe đời mới, sạch sẽ, được bảo dưỡng định kỳ để mang lại trải nghiệm êm ái nhất.'
    }
  ],
  metrics: [
    { icon: 'i-lucide-users', value: '60,000+', label: 'Khách hàng tin dùng' },
    { icon: 'i-lucide-car', value: '8,000+', label: 'Tài xế chuyên nghiệp' },
    { icon: 'i-lucide-clock', value: '24/7', label: 'Phục vụ tận tâm' },
    { icon: 'i-lucide-thumbs-up', value: '99%', label: 'Khách hàng hài lòng' }
  ],
  coreValues: [
    {
      icon: 'i-lucide-shield',
      title: 'An Toàn Tuyệt Đối',
      description:
        'Tất cả tài xế được tuyển chọn kỹ lưỡng, khám sức khỏe định kỳ và có hồ sơ lái xe chuyên nghiệp sạch sẽ.'
    },
    {
      icon: 'i-lucide-tag',
      title: 'Giá Cước Rẻ & Rõ Ràng',
      description:
        'Giá trọn gói được thông báo ngay khi đặt, cam kết không phát sinh bất kỳ chi phí ẩn nào khác trên hành trình.'
    },
    {
      icon: 'i-lucide-clock',
      title: 'Đúng Giờ, Đúng Hẹn',
      description:
        'Chúng tôi trân trọng thời gian của khách hàng. Xe luôn đến trước 10-15 phút để chuẩn bị đón khách.'
    }
  ],
  reasons: [
    'Hệ thống theo dõi GPS 24/7 an toàn',
    'Đội ngũ support nhiệt tình, xử lý nhanh chóng',
    'Hoàn tiền nếu khách hàng không hài lòng'
  ],
  info: [
    { icon: 'i-lucide-phone', label: '0972 97 00 00' },
    { icon: 'i-lucide-mail', label: 'happytripexpress@gmail.com' }
  ]
}))
</script>

<style scoped></style>
