// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  site: {
    url: "https://happytrip.vn",
    name: "Happy Trip",
    description:
      "Happy Trip – Dịch vụ xe tiện chuyến hàng đầu tại Việt Nam, kết nối hành khách với các chuyến xe chất lượng cao trên toàn quốc. Đặt vé nhanh chóng, giá minh bạch, nhiều lựa chọn tuyến đường, hỗ trợ 24/7 và mang đến trải nghiệm di chuyển an toàn, tiện lợi cho mọi hành trình.",
  },
  modules: ["@nuxt/eslint", "@nuxt/ui", "@pinia/nuxt", "@nuxtjs/seo"],

  devtools: {
    enabled: true,
  },
  devServer: {
    port: 2711,
  },
  runtimeConfig: {
    mongoUri: "",
  },

  css: ["~/assets/css/main.css"],

  routeRules: {
    "/": { prerender: true },
    "/admin/**": { ssr: false },
  },
  colorMode: {
    preference: "light",
  },
  experimental: {
    viewTransition: true,
  },
  compatibilityDate: "2025-01-15",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },
});
