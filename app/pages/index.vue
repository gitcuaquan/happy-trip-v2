<script setup lang="ts">
import CollapsibleCard from "~/components/shared/collapsible-card.vue";

const carLogos = [
  "honda.svg",
  "hyundai.svg",
  "kia.svg",
  "mazda.svg",
  "mg.svg",
  "mitsubishi.svg",
  "toyota.svg",
  "vinfast.svg",
];

const service = {
  title: "Dịch Vụ & Hỗ Trợ",
  description:
    "Chúng tôi cam kết mang đến dịch vụ tốt nhất và hỗ trợ tận tâm cho khách hàng",

  carpool: {
    badge: "Tiết kiệm tối đa · Đi chung, vui hơn",
    title: "Dịch Vụ Xe Tiện Chuyến",
    description:
      "Giải pháp kinh tế nhất cho nhu cầu di chuyển hàng ngày. Chia sẻ hành trình, tiết kiệm chi phí mà vẫn đảm bảo sự thoải mái và an toàn tuyệt đối.",
    image:
      "https://datxegiare.vn/wp-content/uploads/2023/11/taxi-noi-bai-phu-tho-3-datxegiare.jpg",
    features: [
      "Giá cước rẻ nhất, tiết kiệm 40–60%",
      "Lộ trình cố định, giờ khởi hành chuẩn xác",
      "Tài xế chuyên nghiệp, kiểm tra lý lịch rõ ràng",
      "Xe luôn sạch sẽ, bảo dưỡng định kỳ",
    ],
  },

  charter: {
    badge: "Riêng tư tuyệt đối · Linh hoạt thời gian",
    title: "Dịch Vụ Bao Xe Tiện Chuyến",
    description:
      "Không gian hoàn toàn riêng tư. Bạn làm chủ lộ trình và thời gian khởi hành. Phù hợp cho gia đình, đối tác hoặc những chuyến đi cần sự yên tĩnh.",
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
    features: [
      "Giá trọn gói, cam kết không phát sinh chi phí",
      "Khởi hành ngay lập tức theo yêu cầu",
      "Đáp ứng đa dạng nhu cầu với nhiều dòng xe",
      "Thoải mái như xe nhà, tiện lợi hơn xe khách",
    ],
  },

  howItWorks: {
    title: "Cách Thức Hoạt Động",
    description: "Chỉ với 4 bước đơn giản để bắt đầu hành trình của bạn",
    steps: [
      {
        icon: "i-lucide-smartphone",
        label: "Bước 1: Đặt xe",
        desc: "Qua web hoặc hotline 24/7",
      },
      {
        icon: "i-lucide-map-pin",
        label: "Bước 2: Chọn điểm đến",
        desc: "Nhập lộ trình bạn muốn đi",
      },
      {
        icon: "i-lucide-car",
        label: "Bước 3: Lên xe",
        desc: "Tài xế đón đúng giờ",
      },
      {
        icon: "i-lucide-credit-card",
        label: "Bước 4: Thanh toán",
        desc: "Linh hoạt tiền mặt hoặc ví",
      },
    ],
  },

  faq: {
    title: "Câu Hỏi Thường Gặp",
    description: "Những thắc mắc phổ biến nhất của khách hàng",
    items: [
      {
        label: "Tôi có thể huỷ chuyến đi không?",
        content:
          "Bạn có thể hủy chuyến nhưng khuyến nghị trước ít nhất 30 phút trước giờ khởi hành.",
      },
      {
        label: "Các phương thức thanh toán được chấp nhận?",
        content:
          "Happy Trip chấp nhận thanh toán tiền mặt hoặc chuyển khoản ngân hàng.",
      },
      {
        label: "Xe của tôi có được bảo hiểm không?",
        content:
          "Toàn bộ xe trên nền tảng Happy Trip đều có bảo hiểm hành khách. Khách hàng được bảo vệ trong suốt hành trình di chuyển.",
      },
      {
        label: "Làm thế nào để xuất hóa đơn VAT?",
        content:
          "Vui lòng liên hệ bộ phận kế toán qua hotline 097 297 0000 khi đặt chuyến",
      },
      {
        label: "Tôi có thể đặt xe cho người khác không?",
        content:
          "Có. Bạn có thể đặt xe cho người thân hoặc đồng nghiệp bằng cách nhập tên và số điện thoại của người đi khi đặt chuyến.",
      },
    ],
  },
};

useSchemaOrg([
  {
    "@type": "Organization",
    "@id": "https://happytrip.vn/#organization",
    name: "Happy Trip",
    url: "https://happytrip.vn",
    logo: "https://happytrip.vn/images/logo.png",
    telephone: "+84972970000",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Số 4, ngách 45, ngõ 218 Lĩnh Nam",
      addressLocality: "Hoàng Mai",
      addressRegion: "Hà Nội",
      addressCountry: "VN",
    },
    sameAs: ["https://www.facebook.com/profile.php?id=61563838251812"],
  },

  {
    "@type": "TravelAgency",
    "@id": "https://happytrip.vn/#business",
    name: "Happy Trip",
    url: "https://happytrip.vn",
    telephone: "+84972970000",
    areaServed: "Việt Nam",
    priceRange: "$$",
  },

  {
    "@type": "WebSite",
    "@id": "https://happytrip.vn/#website",
    url: "https://happytrip.vn",
    name: "Happy Trip",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://happytrip.vn/tim-kiem?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  },

  {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Happy Trip cung cấp dịch vụ gì?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Happy Trip cung cấp dịch vụ xe riêng, xe tiện chuyến và đưa đón sân bay trên toàn quốc.",
        },
      },
      {
        "@type": "Question",
        name: "Làm sao để đặt xe Happy Trip?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Khách hàng có thể gọi hotline 0972 97 0000 hoặc đặt xe trực tiếp trên website happytrip.vn.",
        },
      },
      {
        "@type": "Question",
        name: "Happy Trip có hỗ trợ 24/7 không?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Đội ngũ tổng đài Happy Trip hỗ trợ khách hàng 24 giờ mỗi ngày, 7 ngày mỗi tuần.",
        },
      },
    ],
  },
]);
</script>

<template>
  <Hero />

  <TrustMetrics />
  <About />
  <section class="py-24">
    <UContainer>
      <div class="text-center mb-12">
        <p
          class="text-sm font-semibold text-primary uppercase tracking-widest mb-2"
        >
          Đối tác
        </p>
        <h2 class="text-3xl md:text-4xl font-bold">
          Các hãng xe chúng tôi phục vụ
        </h2>
        <div class="mx-auto w-16 h-1 rounded-full bg-primary mt-4" />
      </div>
      <UMarquee :repeat="4">
        <img
          v-for="logo in carLogos"
          :key="logo"
          :src="`/images/car-logo/${logo}`"
          :alt="logo.replace('.svg', '')"
          class="h-12 w-auto shrink-0"
          loading="lazy"
        />
      </UMarquee>
    </UContainer>
  </section>
  <Testimonials />
  <Articles />

  <!-- ============ SERVICE SECTION  ============ -->
  <UContainer id="dich-vu" class="py-10 scroll-mt-20">
    <!-- HEADER -->
    <div class="text-center mb-12">
      <p
        class="text-sm font-semibold text-primary uppercase tracking-widest mb-2"
      >
        Dịch vụ
      </p>
      <h2 class="text-3xl md:text-4xl font-bold">
        {{ service.title }}
      </h2>
      <div class="mx-auto w-16 h-1 rounded-full bg-primary mt-4" />
      <p class="mt-4 text-muted max-w-xl mx-auto">
        {{ service.description }}
      </p>
    </div>

    <!-- XE GHÉP -->
    <div
      id="xe-ghep"
      class="grid lg:grid-cols-2 gap-12 items-center mb-24 scroll-mt-20"
    >
      <div class="relative">
        <div
          class="rounded-3xl overflow-hidden shadow-lg aspect-4/3 bg-slate-100 dark:bg-slate-800"
        >
          <img
            :src="service.carpool.image"
            alt="Xe tiện chuyến Happy Trip"
            class="w-full h-full object-cover"
          />
        </div>
        <div
          class="absolute top-4 left-4 w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-md flex items-center justify-center"
        >
          <UIcon name="i-lucide-users" class="size-6 text-primary" />
        </div>
      </div>

      <div>
        <p
          class="text-xs font-semibold uppercase tracking-widest text-primary mb-2"
        >
          {{ service.carpool.badge }}
        </p>
        <h2 class="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          {{ service.carpool.title }}
        </h2>
        <p class="text-muted text-sm leading-relaxed mb-6">
          {{ service.carpool.description }}
        </p>
        <div class="flex flex-col gap-3">
          <SharedFeatureList
            v-for="feature in service.carpool.features"
            :key="feature"
            :feature="feature"
          />
        </div>
      </div>
    </div>

    <!-- XE TIỆN CHUYẾN (BAO XE) -->
    <div
      id="bao-xe"
      class="grid lg:grid-cols-2 gap-12 items-center mb-24 scroll-mt-20"
    >
      <div>
        <p
          class="text-xs font-semibold uppercase tracking-widest text-primary mb-2"
        >
          {{ service.charter.badge }}
        </p>
        <h2 class="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          {{ service.charter.title }}
        </h2>
        <p class="text-muted text-sm leading-relaxed mb-6">
          {{ service.charter.description }}
        </p>
        <div class="flex flex-col gap-3">
          <SharedFeatureList
            v-for="feature in service.charter.features"
            :key="feature"
            :feature="feature"
          />
        </div>
      </div>

      <div class="relative order-first lg:order-last">
        <div
          class="rounded-3xl overflow-hidden shadow-lg aspect-4/3 bg-slate-100 dark:bg-slate-800"
        >
          <img
            :src="service.charter.image"
            alt="Xe tiện chuyến Happy Trip"
            class="w-full h-full object-cover"
          />
        </div>
        <div
          class="absolute top-4 right-4 w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-md flex items-center justify-center"
        >
          <UIcon name="i-lucide-zap" class="size-6 text-primary" />
        </div>
      </div>
    </div>
  </UContainer>

  <!-- CÁCH THỨC HOẠT ĐỘNG (full width) -->
  <div class="bg-elevated py-16">
    <UContainer>
      <div class="text-center mb-12">
        <p
          class="text-sm font-semibold text-primary uppercase tracking-widest mb-2"
        >
          Quy trình
        </p>
        <h3 class="text-3xl md:text-4xl font-bold">
          {{ service.howItWorks.title }}
        </h3>
        <div class="mx-auto w-16 h-1 rounded-full bg-primary mt-4" />
        <p class="mt-4 text-muted max-w-xl mx-auto">
          {{ service.howItWorks.description }}
        </p>
      </div>

      <div class="relative grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div
          class="lg:hidden absolute left-8 top-16 bottom-0 w-px border-l-2 border-dashed border-default"
        />
        <div
          class="hidden lg:block absolute top-8 left-[calc(12.5%+1rem)] right-[calc(12.5%+1rem)] h-px border-t-2 border-dashed border-default"
        />

        <div
          v-for="step in service.howItWorks.steps"
          :key="step.label"
          class="relative flex flex-col items-center text-center"
        >
          <div
            class="relative z-10 w-16 h-16 bg-default rounded-2xl border border-default shadow-sm flex items-center justify-center mb-6"
          >
            <UIcon :name="step.icon" class="size-7 text-muted" />
          </div>
          <h4 class="text-sm font-bold mb-2">{{ step.label }}</h4>
          <p class="text-xs text-muted leading-relaxed">{{ step.desc }}</p>
        </div>
      </div>
    </UContainer>
  </div>

  <!-- FAQ -->
  <UContainer class="py-16">
    <div class="text-center mb-10">
      <p
        class="text-sm font-semibold text-primary uppercase tracking-widest mb-2"
      >
        Hỗ trợ
      </p>
      <h3 class="text-3xl md:text-4xl font-bold">
        {{ service.faq.title }}
      </h3>
      <div class="mx-auto w-16 h-1 rounded-full bg-primary mt-4" />
      <p class="mt-4 text-muted max-w-xl mx-auto">
        {{ service.faq.description }}
      </p>
    </div>
    <div
      class="bg-default border border-default rounded-2xl shadow-sm overflow-hidden max-w-3xl mx-auto"
    >
      <CollapsibleCard :items="service.faq.items" />
    </div>
  </UContainer>

  <!-- ============ POPULAR ROUTES SECTION ============ -->
  <section class="py-16 bg-slate-100/70 dark:bg-slate-900/50 border-t border-slate-200/80 dark:border-slate-800">
    <UContainer>
      <div class="text-center max-w-2xl mx-auto mb-12">
        <p class="text-xs font-bold text-primary uppercase tracking-widest mb-2">
          Mạng Lưới Phục Vụ
        </p>
        <h3 class="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
          Các Tuyến Xe Riêng Phổ Biến
        </h3>
        <div class="mx-auto w-16 h-1 rounded-full bg-primary mt-4" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        <NuxtLink
          v-for="(item, index) in generateAllRoutes()"
          :key="index"
          :to="`/${item.slug}`"
          class="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary hover:shadow-md transition-all duration-200 flex items-center justify-between group shadow-2xs"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <UIcon name="i-lucide-map-pin" class="size-4 text-primary shrink-0" />
            <span class="truncate">{{ item.name }}</span>
          </div>
          <UIcon name="i-lucide-chevron-right" class="size-4 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
        </NuxtLink>
      </div>
    </UContainer>
  </section>
</template>
