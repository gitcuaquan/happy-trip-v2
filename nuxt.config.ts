// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui", "@pinia/nuxt", "@nuxtjs/seo", "@nuxt/scripts"],
  devtools: {
    enabled: true,
  },
  runtimeConfig: {
    mongodbUri: process.env.NUXT_MONGODB_URI || "",
    jwtSecret: process.env.NUXT_JWT_SECRET || "happytrip_jwt_secret_key_2026_super_secure",
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "https://sys.happytrip.vn",
    },
  },


  sourcemap: {
    server: false,
    client: false,
  },
  css: ["~/assets/css/main.css"],
  site: {
    url: "https://happytrip.vn",
    name: "Happy Trip",
    description:
      "Happy Trip – Dịch vụ bao xe giá tốt hàng đầu tại Việt Nam, kết nối hành khách với các chuyến xe chất lượng cao trên toàn quốc. Đặt vé nhanh chóng, giá minh bạch, nhiều lựa chọn tuyến đường, hỗ trợ 24/7 và mang đến trải nghiệm di chuyển an toàn, tiện lợi cho mọi hành trình.",
  },
  colorMode: {
    preference: "light",
    fallback: "light",
  },

  routeRules: {
    "/admin/**": { ssr: false },
    "/images/**": {
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
    "/favicon/**": {
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
    "/uploads/**": {
      headers: {
        "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    },
  },
  devServer: {
    port: 2711,
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
  scripts: {
    registry: {
      googleAnalytics: {
        id: 'G-SH28CNXKX9',
      },
    },
  },
  sitemap: {
    sources: ["/api/__sitemap__/routes"],
  }
});
