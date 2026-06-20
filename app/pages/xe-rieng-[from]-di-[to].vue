<script setup lang="ts">
import { getFromRoute, getToRoute } from "~/utils/routes";

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
 * Ví dụ:
 * sai-gon -> tphcm
 */
const canonicalFromSlug = from.canonical || from.slug;

/**
 * Redirect 301 nếu user truy cập alias
 *
 * /xe-rieng-sai-gon-di-vung-tau
 * => /xe-rieng-tphcm-di-vung-tau
 */
if (from.slug !== canonicalFromSlug) {
  await navigateTo(`/xe-rieng-${canonicalFromSlug}-di-${to.slug}`, {
    redirectCode: 301,
  });
}

const canonicalUrl = `https://happytrip.vn/xe-rieng-${canonicalFromSlug}-di-${to.slug}`;

const seoTitle = `Xe riêng ${from.name} đi ${to.name} | Happy Trip`;

const seoDescription = `Dịch vụ xe riêng ${from.name} đi ${to.name}. Đón tận nơi, giá minh bạch, hỗ trợ 24/7. Liên hệ Happy Trip để đặt xe nhanh chóng.`;

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

const faqItems = [
  {
    question: `Xe riêng ${from.name} đi ${to.name} giá bao nhiêu?`,
    answer: `Giá xe riêng ${from.name} đi ${to.name} phụ thuộc vào loại xe và thời điểm đặt xe. Vui lòng liên hệ Happy Trip để nhận báo giá chính xác nhất.`,
  },
  {
    question: `Thời gian di chuyển từ ${from.name} đến ${to.name} bao lâu?`,
    answer: `Thời gian di chuyển từ ${from.name} đến ${to.name} phụ thuộc vào tình hình giao thông và điểm đón trả thực tế.`,
  },
  {
    question: `Happy Trip có đón tận nơi không?`,
    answer: `Happy Trip hỗ trợ đón tận nơi và trả tận nơi theo yêu cầu của khách hàng.`,
  },
  {
    question: `Có xe 4 chỗ và 7 chỗ không?`,
    answer: `Happy Trip cung cấp nhiều loại xe từ 4 chỗ, 7 chỗ đến 16 chỗ phù hợp với nhu cầu của khách hàng.`,
  },
];

useSchemaOrg([
  defineWebPage({
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
    },
  },

  {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: "https://happytrip.vn",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: from.name,
        item: "https://happytrip.vn",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: to.name,
        item: canonicalUrl,
      },
    ],
  },
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
const fromData = getFromRoute(String(route.params.from).toLowerCase());
console.log("🚀 ~ fromData=>", fromData)
const toData = getToRoute(String(route.params.to).toLowerCase());
console.log("🚀 ~ toData=>", toData)
</script>

<template>
  <UiCreateOrder />
</template>
