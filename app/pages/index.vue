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

const serviceCards = [
  {
    id: "rieng-tu",
    badge: "100% Không Ghép Khách",
    badgeColor: "primary" as const,
    title: "Xe Riêng Biệt Lập",
    subtitle: "Riêng tư tuyệt đối · Làm chủ lịch trình",
    description:
      "Toàn bộ xe chỉ phục vụ riêng bạn và gia đình. Không đón khách dọc đường, không chen chúc. Tự do dừng nghỉ, ăn uống hoặc ghé thăm các điểm tham quan theo ý muốn.",
    image:
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800",
    icon: "i-lucide-user-check",
    features: [
      "Không gian riêng tư 100% cho gia đình & đối tác",
      "Làm chủ 100% thời gian xuất phát và điểm dừng",
      "Thoải mái như xe nhà, không bị làm phiền",
      "Hỗ trợ chở thú cưng & hành lý cồng kềnh",
    ],
  },
  {
    id: "don-tan-noi",
    badge: "Tiện Lợi Tối Đa",
    badgeColor: "success" as const,
    title: "Đón Trả Tận Nhà 24/7",
    subtitle: "Đón tận cửa · Trả tận nơi",
    description:
      "Tài xế có mặt đúng giờ tại địa chỉ nhà, khách sạn hoặc cơ quan của bạn. Không cần tốn thêm chi phí và thời gian trung chuyển ra bến xe đông đúc.",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800",
    icon: "i-lucide-map-pin",
    features: [
      "Đón tận ngõ, trả tận sảnh khách sạn / resort",
      "Hỗ trợ khuân vác, sắp xếp hành lý chu đáo",
      "Phục vụ xuyên đêm và sáng sớm 24/7",
      "Theo dõi vị trí xe thời gian thực",
    ],
  },
  {
    id: "gia-tron-goi",
    badge: "Tiết Kiệm Tới 30%",
    badgeColor: "warning" as const,
    title: "Đặt Trước 1 Chiều / Khứ Hồi",
    subtitle: "Trọn gói minh bạch · 0đ phí ẩn",
    description:
      "Giá cước niêm yết rõ ràng, đã bao gồm xăng xe, phí cao tốc và cầu đường. Đặt xe 2 chiều nhận ưu đãi giảm sâu tới 30% cho chiều về trong ngày hoặc dài ngày.",
    image:
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800",
    icon: "i-lucide-badge-percent",
    features: [
      "Báo giá chính xác trước khi khởi hành",
      "Cam kết không phát sinh chi phí dọc đường",
      "Giảm tới 30% cho chuyến đi khứ hồi 2 chiều",
      "Không cần đặt cọc, thanh toán khi đến nơi",
    ],
  },
  {
    id: "san-bay-du-lich",
    badge: "Đúng Giờ Tuyệt Đối",
    badgeColor: "info" as const,
    title: "Đón Tiễn Sân Bay & Du Lịch",
    subtitle: "Tân Sơn Nhất & Tour liên tỉnh",
    description:
      "Chuyên tuyến Sân bay Tân Sơn Nhất đi các tỉnh và ngược lại. Theo dõi lịch trình chuyến bay sát sao, miễn phí thời gian chờ khi chuyến bay bị delay.",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800",
    icon: "i-lucide-plane-takeoff",
    features: [
      "Đón tại ga Quốc nội và Quốc tế Tân Sơn Nhất",
      "Tự động cập nhật giờ hạ cánh khi delay",
      "Đội xe Sedan, MPV, SUV đời mới từ 2022+",
      "Thuê xe theo ngày đi công tác / du lịch",
    ],
  },
];

const vehicleClasses = [
  {
    id: "dich-vu-5-cho",
    title: "Xe Riêng 5 Chỗ (Sedan)",
    tag: "Phổ biến nhất",
    capacity: "1 - 3 hành khách · 2 vali lớn",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600",
    models: "Toyota Vios, Hyundai Accent, Honda City, Mazda 3...",
    suitable: "Cá nhân, cặp đôi, gia đình nhỏ đi khám bệnh, về quê, công tác",
    features: ["Điều hòa mát lạnh", "Êm ái, tiết kiệm", "Cốp chứa vừa 2 vali 24 inch"],
  },
  {
    id: "dich-vu-7-cho",
    title: "Xe Riêng 7 Chỗ (MPV / SUV)",
    tag: "Gia đình & Nhóm bạn",
    capacity: "4 - 6 hành khách · 4 vali lớn",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600",
    models: "Mitsubishi Xpander, Toyota Veloz, Innova, Fortuner...",
    suitable: "Gia đình đông người, nhóm bạn du lịch, có nhiều hành lý cồng kềnh",
    features: ["Khoang ngồi cực kỳ rộng", "Gầm cao êm ái đường dài", "Cốp siêu rộng khi gập hàng ghế"],
  },
];

const howItWorks = {
  title: "Quy Trình 4 Bước Đặt Xe Nhanh Chóng",
  description: "Chỉ với 1 phút để hoàn tất đặt xe riêng cho hành trình trọn vẹn",
  steps: [
    {
      icon: "i-lucide-smartphone",
      label: "Bước 1: Chọn Điểm Đi & Đến",
      desc: "Nhập điểm đón tại nhà và địa chỉ nơi đến trên website hoặc gọi Hotline",
    },
    {
      icon: "i-lucide-calculator",
      label: "Bước 2: Xem Báo Giá Trọn Gói",
      desc: "Hệ thống hiển thị giá niêm yết minh bạch 1 chiều / khứ hồi 0đ phụ phí",
    },
    {
      icon: "i-lucide-car",
      label: "Bước 3: Tài Xế Đón Tận Nơi",
      desc: "Tài xế nhận chuyến, liên hệ xác nhận và đón quý khách đúng giờ hẹn",
    },
    {
      icon: "i-lucide-shield-check",
      label: "Bước 4: Trải Nghiệm & Thanh Toán",
      desc: "Tận hưởng chuyến xe riêng êm ái, thanh toán sau khi hoàn tất chuyến đi",
    },
  ],
};

const faq = {
  title: "Câu Hỏi Thường Gặp",
  description: "Những thắc mắc phổ biến nhất của khách hàng khi đặt xe riêng Happy Trip",
  items: [
    {
      label: "Xe riêng của Happy Trip có phải là xe ghép không?",
      content:
        "Hoàn toàn không. Dịch vụ của Happy Trip là thuê xe riêng trọn gói 100%. Quý khách toàn quyền sử dụng toàn bộ xe cho cá nhân hoặc gia đình mình, tuyệt đối không đón ghép thêm khách lạ dọc đường.",
    },
    {
      label: "Giá cước hiển thị đã bao gồm phí cao tốc và xăng xe chưa?",
      content:
        "Giá cước trên Happy Trip là giá trọn gói 100%, đã bao gồm chi phí xăng dầu, lương tài xế và phí cầu đường cao tốc. Quý khách không phải trả thêm bất kỳ phụ phí ẩn nào.",
    },
    {
      label: "Tôi có được đón trả tận nhà ở cả 2 đầu tỉnh không?",
      content:
        "Có. Dịch vụ xe riêng của chúng tôi đón tận ngõ nhà bạn và trả tận địa chỉ nơi đến ở tỉnh, không cần trung chuyển ra bến xe.",
    },
    {
      label: "Đặt xe 2 chiều (khứ hồi) có được giảm giá không?",
      content:
        "Có. Khi đặt xe 2 chiều khứ hồi trong ngày hoặc nhiều ngày, quý khách được ưu đãi giảm tới 30% cho chiều về.",
    },
    {
      label: "Tôi có thể hủy hoặc đổi giờ khởi hành không?",
      content:
        "Quý khách có thể thay đổi giờ hoặc hủy chuyến miễn phí nếu báo trước ít nhất 1-2 tiếng trước giờ khởi hành.",
    },
    {
      label: "Tôi có cần phải đặt cọc trước không?",
      content:
        "Happy Trip không yêu cầu đặt cọc cho các chuyến xe thông thường. Quý khách chỉ cần thanh toán trực tiếp cho tài xế hoặc chuyển khoản sau khi kết thúc chuyến đi an toàn.",
    },
  ],
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
          text: "Happy Trip cung cấp dịch vụ thuê xe riêng đi tỉnh 1 chiều & khứ hồi, đưa đón sân bay Tân Sơn Nhất và xe công tác trọn gói.",
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

const scrollToTopBooking = () => {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};
</script>

<template>
  <!-- Hero Section with Booking Form -->
  <Hero />

  <!-- Trust Metrics & Highlights -->
  <TrustMetrics />

  <!-- ============ CORE SERVICE CARDS GRID ============ -->
  <section id="dich-vu" class="py-20 lg:py-28 scroll-mt-16 bg-slate-50/70 dark:bg-slate-950">
    <UContainer>
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <p class="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest mb-2">
          Dịch Vụ Cốt Lõi
        </p>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Nền Tảng Xe Riêng Đi Tỉnh <span class="text-primary">2 Chiều</span>
        </h2>
        <div class="mx-auto w-16 h-1.5 rounded-full bg-primary mt-4" />
        <p class="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Cam kết 100% xe riêng không ghép khách, đón trả tận nhà, minh bạch trọn gói không phát sinh chi phí.
        </p>
      </div>

      <!-- 4 Core Service Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div
          v-for="card in serviceCards"
          :key="card.id"
          class="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <!-- Image with Badge Overlay -->
            <div class="relative aspect-16/9 overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                :src="card.image"
                :alt="card.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              
              <!-- Floating Badge -->
              <div class="absolute top-4 left-4">
                <UBadge
                  :label="card.badge"
                  :color="card.badgeColor"
                  variant="solid"
                  size="md"
                  class="font-bold shadow-md"
                />
              </div>

              <!-- Floating Icon -->
              <div class="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                <div class="p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/20">
                  <UIcon :name="card.icon" class="size-5 text-amber-300" />
                </div>
                <div>
                  <h3 class="text-lg sm:text-xl font-bold text-white leading-tight drop-shadow-sm">
                    {{ card.title }}
                  </h3>
                  <p class="text-xs text-slate-200 drop-shadow-sm">
                    {{ card.subtitle }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Content Area -->
            <div class="p-6 sm:p-7 space-y-4">
              <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {{ card.description }}
              </p>

              <!-- Checklist Features -->
              <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div
                  v-for="feat in card.features"
                  :key="feat"
                  class="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                >
                  <UIcon name="i-lucide-check-circle-2" class="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{{ feat }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Action -->
          <div class="px-6 pb-6 pt-0">
            <UButton
              color="primary"
              variant="subtle"
              block
              size="md"
              class="font-bold rounded-xl group-hover:bg-primary group-hover:text-white transition-colors"
              trailing-icon="i-lucide-arrow-right"
              @click="scrollToTopBooking"
            >
              Đặt Chuyến Ngay
            </UButton>
          </div>
        </div>
      </div>

      <!-- ============ VEHICLE CLASS SECTION ============ -->
      <div class="mt-20">
        <div class="text-center max-w-2xl mx-auto mb-10">
          <p class="text-xs font-bold text-primary uppercase tracking-widest mb-1">
            Đội Xe Phục Vụ
          </p>
          <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Lựa Chọn Dòng Xe Phù Hợp Với Nhu Cầu
          </h3>
          <p class="text-xs sm:text-sm text-slate-500 mt-2">
            Đội xe đời mới từ 2022+, nội thất sang trọng, bảo dưỡng định kỳ và khử khuẩn sau mỗi chuyến
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div
            v-for="car in vehicleClasses"
            :id="car.id"
            :key="car.id"
            class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 items-center scroll-mt-24"
          >
            <div class="w-full md:w-48 h-40 rounded-2xl overflow-hidden shrink-0 relative bg-slate-100 dark:bg-slate-800">
              <img :src="car.image" :alt="car.title" class="w-full h-full object-cover" loading="lazy" />
              <UBadge :label="car.tag" color="primary" variant="solid" size="xs" class="absolute top-2.5 left-2.5 font-bold" />
            </div>
            <div class="space-y-3 flex-1">
              <div>
                <h4 class="text-lg font-bold text-slate-900 dark:text-white">{{ car.title }}</h4>
                <p class="text-xs text-primary font-semibold mt-0.5 flex items-center gap-1">
                  <UIcon name="i-lucide-users" class="size-3.5" />
                  {{ car.capacity }}
                </p>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                <strong>Dòng xe:</strong> {{ car.models }}
              </p>
              <div class="flex flex-wrap gap-2 pt-1">
                <span
                  v-for="f in car.features"
                  :key="f"
                  class="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  <UIcon name="i-lucide-check" class="size-3 text-emerald-500" />
                  {{ f }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
  </section>

  <!-- About Section -->
  <About />

  <!-- Partner Logos Marquee -->
  <section class="py-16 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800/80">
    <UContainer>
      <div class="text-center mb-8">
        <p class="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
          Đối Tác
        </p>
        <h3 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Các Hãng Xe Đời Mới Chúng Tôi Phục Vụ
        </h3>
      </div>
      <UMarquee :repeat="4">
        <img
          v-for="logo in carLogos"
          :key="logo"
          :src="`/images/car-logo/${logo}`"
          :alt="logo.replace('.svg', '')"
          class="h-10 sm:h-12 w-auto shrink-0 mx-6 opacity-75 hover:opacity-100 transition-opacity"
          loading="lazy"
        />
      </UMarquee>
    </UContainer>
  </section>

  <!-- Testimonials & Reviews -->
  <Testimonials />

  <!-- Articles & Travel Guides -->
  <Articles />

  <!-- ============ HOW IT WORKS (Quy trình) ============ -->
  <section class="bg-slate-900 text-white py-20 relative overflow-hidden">
    <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
    <UContainer class="relative z-10">
      <div class="text-center max-w-2xl mx-auto mb-14">
        <p class="text-xs font-bold text-primary uppercase tracking-widest mb-2">
          Quy Trình Nhanh Gọn
        </p>
        <h3 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
          {{ howItWorks.title }}
        </h3>
        <div class="mx-auto w-16 h-1 rounded-full bg-primary mt-4" />
        <p class="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {{ howItWorks.description }}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <div
          v-for="(step, index) in howItWorks.steps"
          :key="step.label"
          class="relative flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
        >
          <span class="absolute top-3 right-4 text-2xl font-black text-white/15 select-none">
            0{{ index + 1 }}
          </span>
          <div class="w-14 h-14 bg-primary/20 border border-primary/40 rounded-2xl flex items-center justify-center mb-5 text-primary">
            <UIcon :name="step.icon" class="size-7" />
          </div>
          <h4 class="text-sm font-bold mb-2 text-white">{{ step.label }}</h4>
          <p class="text-xs text-slate-300 leading-relaxed">{{ step.desc }}</p>
        </div>
      </div>
    </UContainer>
  </section>

  <!-- ============ FAQ SECTION ============ -->
  <section class="py-20 lg:py-24 bg-white dark:bg-slate-950">
    <UContainer class="max-w-4xl">
      <div class="text-center mb-12">
        <p class="text-xs font-bold text-primary uppercase tracking-widest mb-2">
          Hỗ Trợ Khách Hàng
        </p>
        <h3 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">
          {{ faq.title }}
        </h3>
        <div class="mx-auto w-16 h-1 rounded-full bg-primary mt-4" />
        <p class="mt-4 text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          {{ faq.description }}
        </p>
      </div>
      <div class="bg-slate-50/60 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm">
        <CollapsibleCard :items="faq.items" />
      </div>
    </UContainer>
  </section>
</template>
