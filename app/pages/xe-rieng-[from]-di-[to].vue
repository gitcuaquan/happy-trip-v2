<script setup lang="ts">
import { getFromRoute, getToRoute, generateAllRoutes } from "~/utils/routes";
import { blogService } from "~/services/blog.service";
import CollapsibleCard from "~/components/shared/collapsible-card.vue";

const route = useRoute();

const fromSlug = String(route.params.from).toLowerCase();
const toSlug = String(route.params.to).toLowerCase();

const from = getFromRoute(fromSlug);
const to = getToRoute(toSlug);

if (!from || !to) {
  throw createError({
    statusCode: 404,
    statusMessage: "Tuyến không tồn tại",
  });
}

/**
 * Canonical location
 * Ví dụ: sai-gon -> tphcm
 */
const canonicalFromSlug = from.canonical || from.slug;

/**
 * Redirect 301 nếu user truy cập alias
 */
if (from.slug !== canonicalFromSlug) {
  await navigateTo(`/xe-rieng-${canonicalFromSlug}-di-${to.slug}`, {
    redirectCode: 301,
  });
}

const currentRouteSlug = `xe-rieng-${canonicalFromSlug}-di-${to.slug}`;
const canonicalUrl = `https://happytrip.vn/${currentRouteSlug}`;

// Nạp bài viết gắn với tuyến đường (nếu có)
const { data: routeArticle } = await useAsyncData(
  `route-article-${currentRouteSlug}`,
  () => blogService.getArticleByRoute(currentRouteSlug),
  { default: () => null }
);

const seoTitle = computed(() => routeArticle.value?.meta_title || `Xe riêng ${from.name} đi ${to.name} | Happy Trip`);
const seoDescription = computed(() => routeArticle.value?.meta_description || routeArticle.value?.excerpt || `Dịch vụ xe riêng ${from.name} đi ${to.name}. Đón tận nơi, giá minh bạch, hỗ trợ 24/7. Liên hệ Happy Trip để đặt xe nhanh chóng.`);

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
});

useHead({
  link: [
    {
      rel: "canonical",
      href: canonicalUrl,
    },
  ],
});

function formatDate(value?: string | Date): string {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  } catch {
    return String(value);
  }
}

const faqItems = [
  {
    question: `Xe riêng ${from.name} đi ${to.name} giá bao nhiêu?`,
    answer: `Giá xe riêng ${from.name} đi ${to.name} phụ thuộc vào loại xe (4 chỗ, 7 chỗ...) và thời điểm đặt xe. Giá niêm yết đã bao gồm trọn gói phí cao tốc và xăng xe, không phát sinh chi phí. Vui lòng nhập điểm đón cụ thể trên form để tra cứu giá chính xác nhất.`,
  },
  {
    question: `Thời gian di chuyển từ ${from.name} đến ${to.name} bao lâu?`,
    answer: `Thời gian di chuyển từ ${from.name} đến ${to.name} phụ thuộc vào tình hình giao thông thực tế và địa điểm đón trả cụ thể của bạn. Tài xế xe riêng sẽ lựa chọn tuyến đường tối ưu nhất để tiết kiệm thời gian cho quý khách.`,
  },
  {
    question: `Happy Trip có đón trả tận nơi không?`,
    answer: `Có. Dịch vụ xe riêng Happy Trip hỗ trợ đón tận nhà và trả tận nơi theo chính xác địa chỉ yêu cầu của khách hàng tại ${from.name} và ${to.name}.`,
  },
  {
    question: `Đặt xe riêng có cần đặt cọc trước không?`,
    answer: `Happy Trip không bắt buộc đặt cọc cho các chuyến xe riêng thông thường. Quý khách chỉ cần đặt chuyến và thanh toán trực tiếp cho tài xế sau khi hoàn thành hành trình.`,
  },
];

const faqFormattedItems = computed(() =>
  faqItems.map((item) => ({
    label: item.question,
    content: item.answer,
  }))
);

const routeFeatures = computed(() => [
  {
    icon: "i-lucide-navigation",
    title: "Chủ Động Thời Gian & Lộ Trình",
    desc: `Tự do chọn giờ khởi hành từ ${from.name} đi ${to.name}. Xe phục vụ riêng cho gia đình hoặc nhóm của bạn, dừng nghỉ linh hoạt theo yêu cầu.`,
  },
  {
    icon: "i-lucide-map-pin-check",
    title: `Đón Trả Tận Nơi 24/7`,
    desc: `Đón tận nhà tại ${from.name} và trả tận nơi tại ${to.name}. Không cần di chuyển ra bến xe, tiết kiệm tối đa thời gian và công sức.`,
  },
  {
    icon: "i-lucide-shield-check",
    title: "Giá Trọn Gói - 0đ Tiền Cọc",
    desc: "Cam kết giá minh bạch, trọn gói cao tốc và xăng xe. Không phát sinh chi phí ẩn. Thanh toán sau khi kết thúc chuyến đi.",
  },
  {
    icon: "i-lucide-car-front",
    title: "Dòng Xe Đời Mới Sạch Sẽ",
    desc: "Đội xe 4 chỗ, 7 chỗ đời mới từ 2022+, trang bị tiện nghi, máy lạnh mát sâu, bảo dưỡng định kỳ đảm bảo an toàn tuyệt đối.",
  },
]);

const howItWorksSteps = [
  {
    icon: "i-lucide-edit-3",
    step: "01",
    title: "Nhập Lộ Trình",
    desc: "Điền điểm đón & điểm đến để xem ngay báo giá chính xác.",
  },
  {
    icon: "i-lucide-check-circle",
    step: "02",
    title: "Xác Nhận Chuyến",
    desc: "Tổng đài liên hệ xác nhận tài xế & biển số xe phục vụ.",
  },
  {
    icon: "i-lucide-car",
    step: "03",
    title: "Đón Tận Nơi",
    desc: "Tài xế có mặt đúng giờ hẹn, hỗ trợ hành lý chu đáo.",
  },
  {
    icon: "i-lucide-smile",
    step: "04",
    title: "Thanh Toán & Hài Lòng",
    desc: "Kết thúc chuyến đi an toàn và thanh toán trực tiếp.",
  },
];

useSchemaOrg([
  {
    "@type": "WebSite",
    "@id": "https://happytrip.vn/#website",
    url: "https://happytrip.vn/",
    name: "Happy Trip",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://happytrip.vn/tim-kiem?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@type": "ItemList",
    "@id": "https://happytrip.vn/#sitenavigation",
    name: "Danh mục chính",
    itemListElement: generateAllRoutes().map((r, index) => ({
      "@type": "SiteNavigationElement",
      position: index + 1,
      name: r.name,
      url: `https://happytrip.vn/${r.slug}`,
    })),
  },
  defineWebPage({
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: seoTitle,
    description: seoDescription,
  }),
  {
    "@type": "Service",
    name: seoTitle,
    description: seoDescription,
    provider: {
      "@type": "Organization",
      name: "Happy Trip",
      url: "https://happytrip.vn",
    },
  },
  defineBreadcrumb({
    itemListElement: [
      {
        name: "Trang chủ",
        item: "https://happytrip.vn",
      },
      {
        name: from.name,
        item: "https://happytrip.vn",
      },
      {
        name: to.name,
        item: canonicalUrl,
      },
    ],
  }),
  {
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  },
]);

const fromData = getFromRoute(String(route.params.from).toLowerCase()) ?? undefined;
const toData = getToRoute(String(route.params.to).toLowerCase()) ?? undefined;

const breadcrumbItems = computed(() => [
  { label: "Trang chủ", to: "/", icon: "i-lucide-home" },
  { label: `Xe riêng ${from.name}` },
  { label: `Đi ${to.name}` },
]);

const popularRoutes = computed(() => {
  return generateAllRoutes().slice(0, 12);
});

onMounted(() => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'ViewContent', {
      content_name: `Xe riêng ${from.name} đi ${to.name}`,
      content_category: 'Route',
    });
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 dark:bg-slate-950">
    <!-- ============ BREADCRUMB ============ -->
    <div class="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
      <UContainer class="py-2.5">
        <UBreadcrumb :items="breadcrumbItems" />
      </UContainer>
    </div>

    <!-- ============ ARTICLE / ROUTE GUIDE (TOP) ============ -->
    <article v-if="routeArticle" class="py-10 lg:py-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
      <div class="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Section Tag & Title -->
        <header class="mb-8 text-center">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
            <UIcon name="i-lucide-book-open" class="size-3.5" />
            <span>Cẩm Nang & Hướng Dẫn Di Chuyển</span>
          </div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {{ routeArticle.title || routeArticle.name }}
          </h1>
          <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-slate-500 dark:text-slate-400 mt-3">
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-user" class="size-3.5 text-primary" />
              {{ routeArticle.author_name || 'Happy Trip' }}
            </span>
            <span>•</span>
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-clock" class="size-3.5 text-primary" />
              {{ routeArticle.reading_time || 3 }} phút đọc
            </span>
            <template v-if="routeArticle.published_at">
              <span>•</span>
              <span class="flex items-center gap-1.5">
                <UIcon name="i-lucide-calendar" class="size-3.5 text-primary" />
                {{ formatDate(routeArticle.published_at) }}
              </span>
            </template>
          </div>
          <div class="mx-auto w-16 h-1 rounded-full bg-primary mt-4" />
        </header>

        <!-- Excerpt Callout -->
        <div v-if="routeArticle.excerpt" class="p-4 sm:p-5 rounded-2xl bg-primary/5 dark:bg-slate-800/60 border-l-4 border-primary text-slate-700 dark:text-slate-300 text-sm sm:text-base italic leading-relaxed mb-8">
          {{ routeArticle.excerpt }}
        </div>

        <!-- Article Rich Content -->
        <div
          v-if="routeArticle.content"
          class="article-content"
          v-html="routeArticle.content"
        />

        <!-- Quick CTA Banner inside Article -->
        <div class="mt-10 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 class="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              Cần đặt xe riêng tuyến {{ from.name }} - {{ to.name }}?
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Đón tận nơi, giá trọn gói không phát sinh, không cần đặt cọc.
            </p>
          </div>
          <div class="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
            <UButton
              to="#dat-xe"
              color="primary"
              size="md"
              class="font-bold rounded-xl"
              icon="i-lucide-arrow-down"
            >
              Đặt xe ngay
            </UButton>
            <UButton
              to="tel:0972970000"
              color="neutral"
              variant="outline"
              size="md"
              class="font-bold rounded-xl"
              icon="i-lucide-phone-call"
            >
              097 297 0000
            </UButton>
          </div>
        </div>
      </div>
    </article>

    <!-- ============ DEFAULT ROUTE HEADER (IF NO ARTICLE) ============ -->
    <section v-else class="py-12 lg:py-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 text-center">
      <UContainer class="max-w-3xl">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
          <UIcon name="i-lucide-sparkles" class="size-4" />
          <span>Dịch Vụ Xe Riêng Chất Lượng Cao 5★</span>
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
          Xe Riêng <span class="text-primary">{{ from.name }}</span> đi <span class="text-primary">{{ to.name }}</span>
        </h1>
        <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed max-w-xl mx-auto">
          Đặt xe nhanh chóng, tài xế đón tận nơi tại {{ from.name }} và trả tận nhà ở {{ to.name }}. Cam kết xe đời mới, đi cao tốc, không tăng giá giờ cao điểm.
        </p>
      </UContainer>
    </section>

    <!-- ============ BOOKING SECTION ============ -->
    <section id="dat-xe" class="relative bg-slate-900 bg-image-hero text-white overflow-hidden py-14 lg:py-20 scroll-mt-14">
      <div class="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-transparent z-0" />
      
      <UContainer class="relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <!-- Left Column: Route Overview & Badges -->
          <div class="lg:col-span-6 space-y-6 text-center lg:text-left order-2 lg:order-1">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-bold backdrop-blur-md shadow-sm">
              <UIcon name="i-lucide-sparkles" class="size-4 text-amber-400 animate-pulse" />
              <span>Dịch Vụ Xe Riêng Chất Lượng Cao 5★</span>
            </div>

            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight drop-shadow-md text-white">
              Đặt Xe Riêng <span class="text-primary inline-block">{{ from.name }}</span>
              <span class="inline-block px-1.5 text-slate-200">đi</span>
              <span class="text-primary inline-block">{{ to.name }}</span>
            </h2>

            <p class="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Đặt xe nhanh chóng, tài xế đón tận nơi tại <strong class="text-white font-semibold">{{ from.name }}</strong> và trả tận nhà ở <strong class="text-white font-semibold">{{ to.name }}</strong>. Cam kết xe đời mới, đi cao tốc, không bao giờ tăng giá giờ cao điểm.
            </p>

            <!-- Highlights checklist -->
            <div class="grid grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0 text-left pt-2">
              <div class="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <UIcon name="i-lucide-shield-check" class="size-5 text-emerald-400 shrink-0" />
                <span class="text-xs sm:text-sm font-medium text-slate-200">Đón trả tận nhà</span>
              </div>
              <div class="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <UIcon name="i-lucide-badge-percent" class="size-5 text-amber-400 shrink-0" />
                <span class="text-xs sm:text-sm font-medium text-slate-200">Không cần đặt cọc</span>
              </div>
              <div class="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <UIcon name="i-lucide-clock" class="size-5 text-sky-400 shrink-0" />
                <span class="text-xs sm:text-sm font-medium text-slate-200">Khởi hành đúng giờ</span>
              </div>
              <div class="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <UIcon name="i-lucide-headset" class="size-5 text-purple-400 shrink-0" />
                <span class="text-xs sm:text-sm font-medium text-slate-200">Tổng đài hỗ trợ 24/7</span>
              </div>
            </div>

            <!-- Call Hotline CTA -->
            <div class="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <UButton
                to="tel:0972970000"
                color="primary"
                size="lg"
                class="font-bold shadow-lg shadow-primary/30"
              >
                <template #leading>
                  <UIcon name="i-lucide-phone-call" class="size-5 animate-bounce" />
                </template>
                Hotline: 097 297 0000
              </UButton>
              <div class="text-xs text-slate-400 text-left">
                <p class="font-semibold text-slate-300">Cần tư vấn ngay?</p>
                <p>Gọi điện hoặc đặt xe trên bảng bên cạnh</p>
              </div>
            </div>
          </div>

          <!-- Right Column: Booking Form -->
          <div class="lg:col-span-6 w-full order-1 lg:order-2">
            <UiCreateOrder :from-data="fromData" :to-data="toData" />
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ============ ROUTE FEATURES / ADVANTAGES ============ -->
    <section class="py-16 lg:py-20">
      <UContainer>
        <div class="text-center max-w-2xl mx-auto mb-14">
          <p class="text-xs font-bold text-primary uppercase tracking-widest mb-2">
            Ưu Điểm Dịch Vụ
          </p>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Vì Sao Chọn Xe Riêng {{ from.name }} đi {{ to.name }}?
          </h2>
          <div class="mx-auto w-12 h-1 rounded-full bg-primary mt-4" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <UCard
            v-for="(feat, idx) in routeFeatures"
            :key="idx"
            class="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200/80 dark:border-slate-800"
            :ui="{ body: 'p-6 flex flex-col items-start gap-4' }"
          >
            <div class="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <UIcon :name="feat.icon" class="size-7" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                {{ feat.title }}
              </h3>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {{ feat.desc }}
              </p>
            </div>
          </UCard>
        </div>
      </UContainer>
    </section>

    <!-- ============ HOW IT WORKS ============ -->
    <section class="py-16 bg-slate-900 text-white relative overflow-hidden">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <UContainer class="relative z-10">
        <div class="text-center max-w-2xl mx-auto mb-14">
          <p class="text-xs font-bold text-primary uppercase tracking-widest mb-2">
            Đặt Xe Đơn Giản
          </p>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Quy Trình 4 Bước Đặt Xe Nhanh Chóng
          </h2>
          <div class="mx-auto w-12 h-1 rounded-full bg-primary mt-4" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <div
            v-for="(step, i) in howItWorksSteps"
            :key="i"
            class="relative flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <span class="absolute top-3 right-4 text-3xl font-black text-white/10 select-none">
              {{ step.step }}
            </span>
            <div class="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mb-5 text-primary">
              <UIcon :name="step.icon" class="size-7" />
            </div>
            <h3 class="text-base font-bold mb-2 text-white">{{ step.title }}</h3>
            <p class="text-xs text-slate-300 leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ============ FAQ SECTION ============ -->
    <section class="py-16 lg:py-24">
      <div class="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <p class="text-xs font-bold text-primary uppercase tracking-widest mb-2">
            Giải Đáp Thắc Mắc
          </p>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">
            Hỏi Đáp Thường Gặp Tuyến {{ from.name }} - {{ to.name }}
          </h2>
          <div class="mx-auto w-12 h-1 rounded-full bg-primary mt-4" />
        </div>

        <CollapsibleCard :items="faqFormattedItems" />
      </div>
    </section>

    <!-- ============ POPULAR ROUTES GRID ============ -->
    <section class="py-12 bg-slate-100/70 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
      <UContainer>
        <div class="mb-8 text-center sm:text-left">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
            <UIcon name="i-lucide-route" class="size-5 text-primary" />
            Các Tuyến Xe Riêng Phổ Biến Khác
          </h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <NuxtLink
            v-for="(r, idx) in popularRoutes"
            :key="idx"
            :to="`/${r.slug}`"
            class="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary transition-all flex items-center justify-between group shadow-2xs"
          >
            <span class="truncate">{{ r.name }}</span>
            <UIcon name="i-lucide-chevron-right" class="size-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </NuxtLink>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<style scoped>
@media screen and (min-width: 768px) {
  .bg-image-hero {
    background:
      linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.9)),
      url("/images/hero-bg.webp");
    background-size: cover;
    background-position: center 60%;
  }
}
</style>
