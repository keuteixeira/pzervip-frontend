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
      htmlAttrs: { lang: 'pt-BR' },
      meta: [
        {
          name: 'description',
          content:
            'Prazer.Vip — conteúdo para maiores de 18 anos. Explore anúncios por cidade, região e categoria.',
        },
        { property: 'og:site_name', content: 'Prazer.Vip' },
        { name: 'theme-color', content: '#0a0a0a' },
      ],
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
  css: ['sweetalert2/dist/sweetalert2.min.css', '~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api',
      /** URL canónica (sem barra final). Obrigatória em produção para SEO (canonical, og:url). */
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || '',
      /** Google Analytics 4 — ex.: G-XXXXXXXXXX */
      gaMeasurementId: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || '',
    },
  },
})
