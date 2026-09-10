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

// Google Analytics — page view tracking on route change
const { proxy: gaProxy } = useScriptGoogleAnalytics();

// Google Tag Manager
useHead({
  script: [
    {
      key: 'gtm',
      innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MRKB7HZM');`,
    },
  ],
  noscript: [
    {
      key: 'gtm-noscript',
      innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MRKB7HZM" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
    },
  ],
});

// Meta Pixel — inject traditional pixel code into <head>
useHead({
  script: [
    {
      key: 'meta-pixel',
      innerHTML: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1160626542496232');fbq('init','2229315357857572');fbq('track','PageView');`,
    },
  ],
  noscript: [
    {
      key: 'meta-pixel-noscript',
      innerHTML: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1160626542496232&ev=PageView&noscript=1" /><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=2229315357857572&ev=PageView&noscript=1" />`,
    },
  ],
});

useScriptEventPage(({ title, path }) => {
  gaProxy.gtag('event', 'page_view', {
    page_title: title,
    page_path: path,
  });
  // Track Meta Pixel PageView on SPA route change
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView');
  }
  // Track GTM page_view on SPA route change
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: 'page_view',
      page_title: title,
      page_path: path,
    });
  }
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