// https://nuxt.com/docs/api/configuration/nuxt-config
import { brandAssets } from './app/config/brand-assets'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      title: 'Prazer.Vip',
      titleTemplate: (titleChunk?: string | null) =>
        titleChunk ? `${titleChunk} · Prazer.Vip` : 'Prazer.Vip',
      link: [
        { rel: 'icon', type: 'image/png', href: brandAssets.iconSquare },
        { rel: 'apple-touch-icon', href: brandAssets.iconSquare },
      ],
    },
  },
  devServer: {
    host: 'localhost',
    port: 5175,
  },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api',
    },
  },
})
