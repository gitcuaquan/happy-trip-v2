<template>
  <div>

    <UContainer class="py-10">

      <!-- === HEADER === -->
      <div class="text-center mb-12">
        <h2 class="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
          {{ service.title }}
        </h2>
        <div class="w-20 h-2 bg-primary mx-auto rounded-full" />
        <p class="mt-4 text-gray-500 dark:text-slate-400 max-w-xl mx-auto text-base">
          {{ service.description }}
        </p>
      </div>

      <!-- === XE GHÉP === -->
      <div class="grid lg:grid-cols-2 gap-12 items-center mb-24">
        <div class="relative">
          <div class="rounded-3xl overflow-hidden shadow-lg aspect-4/3 bg-slate-100 dark:bg-slate-800">
            <img :src="service.carpool.image" alt="Xe ghép Happy Trip" class="w-full h-full object-cover" />
          </div>
          <div
            class="absolute top-4 left-4 w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-md flex items-center justify-center">
            <UIcon name="i-lucide-users" class="size-6 text-primary" />
          </div>
        </div>

        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-primary mb-2">
            {{ service.carpool.badge }}
          </p>
          <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
            {{ service.carpool.title }}
          </h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
            {{ service.carpool.description }}
          </p>
          <div class="flex flex-col gap-3">
            <SharedFeatureList v-for="feature in service.carpool.features" :key="feature" :feature="feature" />
          </div>
        </div>
      </div>

      <!-- === XE TIỆN CHUYẾN === -->
      <div class="grid lg:grid-cols-2 gap-12 items-center mb-24">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-primary mb-2">
            {{ service.charter.badge }}
          </p>
          <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
            {{ service.charter.title }}
          </h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
            {{ service.charter.description }}
          </p>
          <div class="flex flex-col gap-3">
            <SharedFeatureList v-for="feature in service.charter.features" :key="feature" :feature="feature" />
          </div>
        </div>

        <div class="relative order-first lg:order-last">
          <div class="rounded-3xl overflow-hidden shadow-lg aspect-4/3 bg-slate-100 dark:bg-slate-800">
            <img :src="service.charter.image" alt="Xe tiện chuyến Happy Trip" class="w-full h-full object-cover" />
          </div>
          <div
            class="absolute top-4 right-4 w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-md flex items-center justify-center">
            <UIcon name="i-lucide-zap" class="size-6 text-primary" />
          </div>
        </div>
      </div>

    </UContainer>

    <!-- === CÁCH THỨC HOẠT ĐỘNG — full width === -->
    <div class="bg-slate-50 dark:bg-slate-900/50 py-16">
      <UContainer>
        <div class="text-center mb-12">
          <h3 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
            {{ service.howItWorks.title }}
          </h3>
          <p class="text-slate-500 dark:text-slate-400 text-sm">
            {{ service.howItWorks.description }}
          </p>
        </div>

        <div class="relative grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div
            class="lg:hidden absolute left-8 top-16 bottom-0 w-px border-l-2 border-dashed border-slate-200 dark:border-slate-700" />
          <div
            class="hidden lg:block absolute top-8 left-[calc(12.5%+1rem)] right-[calc(12.5%+1rem)] h-px border-t-2 border-dashed border-slate-200 dark:border-slate-700" />

          <div v-for="step in service.howItWorks.steps" :key="step.label"
            class="relative flex flex-col items-center text-center">
            <div
              class="relative z-10 w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center mb-6">
              <UIcon :name="step.icon" class="size-7 text-slate-700 dark:text-slate-300" />
            </div>
            <h4 class="text-sm font-extrabold text-slate-800 dark:text-white mb-2">{{ step.label }}</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- === FAQ === -->
    <UContainer class="py-16">
      <div class="text-center mb-10">
        <h3 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
          {{ service.faq.title }}
        </h3>
        <p class="text-slate-500 dark:text-slate-400 text-sm">{{ service.faq.description }}</p>
      </div>
      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden max-w-3xl mx-auto">
        <CollapsibleCard :items="service.faq.items" />
      </div>
    </UContainer>

  </div>
</template>

<script lang="ts" setup>
import CollapsibleCard from '~/components/shared/collapsible-card.vue'

useSeoMeta({
  title: 'Dịch vụ | Happy Trip',
  description: 'Xe ghép và xe tiện chuyến hàng đầu Việt Nam. Giá rẻ, an toàn, đúng giờ.',
})

const service = {
  title: 'Dịch Vụ & Hỗ Trợ',
  description: 'Chúng tôi cam kết mang đến dịch vụ tốt nhất và hỗ trợ tận tâm cho khách hàng',

  carpool: {
    badge: 'Tiết kiệm tối đa · Đi chung, vui hơn',
    title: 'Dịch Vụ Xe Ghép',
    description: 'Giải pháp kinh tế nhất cho nhu cầu di chuyển hàng ngày. Chia sẻ hành trình, tiết kiệm chi phí mà vẫn đảm bảo sự thoải mái và an toàn tuyệt đối.',
    image: 'https://datxegiare.vn/wp-content/uploads/2023/11/taxi-noi-bai-phu-tho-3-datxegiare.jpg',
    features: [
      'Giá cước rẻ nhất, tiết kiệm 40–60%',
      'Lộ trình cố định, giờ khởi hành chuẩn xác',
      'Tài xế chuyên nghiệp, kiểm tra lý lịch rõ ràng',
      'Xe luôn sạch sẽ, bảo dưỡng định kỳ',
    ],
  },

  charter: {
    badge: 'Riêng tư tuyệt đối · Linh hoạt thời gian',
    title: 'Dịch Vụ Bao Xe Tiện Chuyến',
    description: 'Không gian hoàn toàn riêng tư. Bạn làm chủ lộ trình và thời gian khởi hành. Phù hợp cho gia đình, đối tác hoặc những chuyến đi cần sự yên tĩnh.',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
    features: [
      'Giá trọn gói, cam kết không phát sinh chi phí',
      'Khởi hành ngay lập tức theo yêu cầu',
      'Đáp ứng đa dạng nhu cầu với nhiều dòng xe',
      'Thoải mái như xe nhà, tiện lợi hơn xe khách',
    ],
  },

  howItWorks: {
    title: 'Cách Thức Hoạt Động',
    description: 'Chỉ với 4 bước đơn giản để bắt đầu hành trình của bạn',
    steps: [
      { icon: 'i-lucide-smartphone', label: 'Bước 1: Đặt xe', desc: 'Qua web hoặc hotline 24/7' },
      { icon: 'i-lucide-map-pin', label: 'Bước 2: Chọn điểm đến', desc: 'Nhập lộ trình bạn muốn đi' },
      { icon: 'i-lucide-credit-card', label: 'Bước 3: Thanh toán', desc: 'Linh hoạt tiền mặt hoặc ví' },
      { icon: 'i-lucide-check', label: 'Bước 4: Lên xe', desc: 'Tài xế đón bạn trong ít phút' },
    ],
  },

  faq: {
    title: 'Câu Hỏi Thường Gặp',
    description: 'Những thắc mắc phổ biến nhất của khách hàng',
    items: [
      {
        label: 'Tôi có thể huỷ chuyến đi không?',
        content: 'Bạn có thể huỷ chuyến miễn phí trước 30 phút khởi hành. Sau thời gian đó sẽ áp dụng phí huỷ theo chính sách của Happy Trip.',
      },
      {
        label: 'Các phương thức thanh toán được chấp nhận?',
        content: 'Happy Trip chấp nhận thanh toán tiền mặt, chuyển khoản ngân hàng, ví điện tử MoMo, ZaloPay và thẻ ATM/Visa/Mastercard.',
      },
      {
        label: 'Xe của tôi có được bảo hiểm không?',
        content: 'Toàn bộ xe trên nền tảng Happy Trip đều có bảo hiểm hành khách. Khách hàng được bảo vệ trong suốt hành trình di chuyển.',
      },
      {
        label: 'Làm thế nào để xuất hóa đơn VAT?',
        content: 'Vui lòng liên hệ bộ phận kế toán qua email happytripexpress@gmail.com hoặc hotline 1900 1234 với thông tin doanh nghiệp và mã chuyến đi.',
      },
      {
        label: 'Tôi có thể đặt xe cho người khác không?',
        content: 'Có. Bạn có thể đặt xe cho người thân hoặc đồng nghiệp bằng cách nhập tên và số điện thoại của người đi khi đặt chuyến.',
      },
    ],
  },
}
</script>
