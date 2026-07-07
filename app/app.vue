<script setup lang="ts">
import { vi } from "@nuxt/ui/locale";

useHead({
  meta: [
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
  ],
  link: [
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/favicon/apple-touch-icon.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/favicon/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/favicon/favicon-16x16.png",
    },
    {
      rel: "icon",
      type: "image/favicon",
      sizes: "16x16",
      href: "/favicon/favicon.ico",
    },
  ],
  htmlAttrs: {
    lang: "vi",
    class: "light",
  },
});

const origin = "https://v2.happytrip.vn";
const title = "Happy Trip - Dịch vụ bao xe giá tốt hàng đầu tại Việt Nam";
const description =
  "Happy Trip – Dịch vụ bao xe giá tốt hàng đầu tại Việt Nam, kết nối hành khách với các chuyến xe chất lượng cao trên toàn quốc. Đặt vé nhanh chóng, giá minh bạch, nhiều lựa chọn tuyến đường, hỗ trợ 24/7 và mang đến trải nghiệm di chuyển an toàn, tiện lợi cho mọi hành trình.";
useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: `${origin}/images/banner.webp`,
  twitterImage: `${origin}/images/banner.webp`,
  twitterCard: "summary_large_image",
});

// Force light theme — đã xử lý ở plugins/force-light-theme.client.ts

useScriptMetaPixel({
  id: "2229315357857572",
});

onMounted(() => {
  if (typeof document !== 'undefined') {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.href && anchor.href.startsWith('tel:')) {
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'Contact');
        }
      }
    });
  }
});
</script>

<template>
  <UApp :locale="vi">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>