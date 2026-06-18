// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from 'pathe'
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui", "@pinia/nuxt"],

  devtools: {
    enabled: true,
  },
  devServer: {
    port: 2711,
  },

  css: ["~/assets/css/main.css"],

  routeRules: {
    "/": { prerender: true }
  },
  colorMode: {
    preference: 'light'
  },
  experimental: {
    viewTransition: true
  },
  compatibilityDate: "2025-01-15",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  }
});
