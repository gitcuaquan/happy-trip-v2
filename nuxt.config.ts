// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: ['@nuxt/eslint', '@nuxt/ui', '@pinia/nuxt', '@nuxtjs/seo'],
  devtools: {
    enabled: true
  },
  app: {
    head: {
      link: [
        { rel: 'preload', href: '/images/hero-bg.webp', as: 'image' },
        { rel: 'preload', href: '/images/about.webp', as: 'image', fetchpriority: 'high' }
      ]
    }
  },

  css: ['~/assets/css/main.css'], site: {
    url: 'https://happytrip.vn',
    name: 'Happy Trip',
    description:
      'Happy Trip – Dịch vụ xe tiện chuyến hàng đầu tại Việt Nam, kết nối hành khách với các chuyến xe chất lượng cao trên toàn quốc. Đặt vé nhanh chóng, giá minh bạch, nhiều lựa chọn tuyến đường, hỗ trợ 24/7 và mang đến trải nghiệm di chuyển an toàn, tiện lợi cho mọi hành trình.'
  },
  colorMode: {
    preference: 'light',
    fallback: 'light'
  },
  runtimeConfig: {
    mongoUri: ''
  },

  routeRules: {
    '/': { prerender: true },
    '/admin/**': { ssr: false },
    '/images/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/favicon/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/uploads/**': { headers: { 'cache-control': 'public, max-age=86400, stale-while-revalidate=604800' } }
  },
  devServer: {
    port: 2711
  },
  experimental: {
    viewTransition: true,
    inlineSSRStyles: true
  },
  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  sitemap: {
    sources: [
      '/api/__sitemap__/routes'
    ]
  }
})
