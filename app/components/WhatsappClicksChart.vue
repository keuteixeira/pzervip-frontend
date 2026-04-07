<template>
  <div
    class="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-zinc-900 p-5 shadow-[0_0_40px_-10px_rgba(249,115,22,0.35)] md:p-6"
  >
    <div
      class="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-500/15 blur-3xl"
      aria-hidden="true"
    />
    <div class="relative">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300/90">Últimos {{ series.length }} dias</p>
      <p class="mt-1 text-lg font-bold text-white">Cliques no WhatsApp</p>
      <p class="mt-1 text-sm text-zinc-400">
        Visitantes únicos por sessão: cada pessoa conta uma vez por visita ao seu perfil.
      </p>

      <div v-if="loading" class="mt-8 h-48 animate-pulse rounded-xl bg-zinc-800/50" />

      <div v-else-if="maxCount === 0" class="mt-8 rounded-xl border border-zinc-800 bg-zinc-950/60 py-12 text-center text-sm text-zinc-500">
        Ainda não há cliques registados neste período.
      </div>

      <div v-else class="mt-6 overflow-x-auto pb-2">
        <svg
          class="mx-auto min-w-[min(100%,720px)]"
          :width="chartW"
          :height="chartH"
          role="img"
          :aria-label="`Gráfico de cliques, total ${total} sessões`"
        >
          <defs>
            <linearGradient id="waBarGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stop-color="#ea580c" stop-opacity="0.95" />
              <stop offset="55%" stop-color="#f97316" stop-opacity="1" />
              <stop offset="100%" stop-color="#fdba74" stop-opacity="1" />
            </linearGradient>
            <filter id="waBarGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <template v-for="(pt, i) in points" :key="pt.date">
            <rect
              :x="pt.x"
              :y="pt.y"
              :width="pt.barW"
              :height="pt.h"
              rx="4"
              fill="url(#waBarGrad)"
              filter="url(#waBarGlow)"
              class="transition-opacity hover:opacity-100"
              :opacity="pt.count > 0 ? 0.92 : 0.12"
            >
              <title>{{ pt.label }}: {{ pt.count }} clique(s)</title>
            </rect>
            <text
              v-if="showLabel(i, points.length)"
              :x="pt.x + pt.barW / 2"
              :y="chartH - 4"
              text-anchor="middle"
              fill="#71717a"
              style="font-size: 9px"
            >
              {{ pt.shortLabel }}
            </text>
          </template>
        </svg>
      </div>

      <p v-if="!loading && maxCount > 0" class="mt-4 text-center text-sm text-zinc-400">
        Total no período:
        <span class="font-semibold tabular-nums text-orange-200">{{ total }}</span>
        {{ total === 1 ? 'visita com clique' : 'visitas com clique' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
export type WhatsappMetricPoint = { date: string; count: number }

const props = defineProps<{
  series: WhatsappMetricPoint[]
  total: number
  loading?: boolean
}>()

const chartW = 720
const chartH = 220
const padL = 8
const padR = 8
const padT = 12
const padB = 28

const maxCount = computed(() => {
  let m = 0
  for (const p of props.series) {
    m = Math.max(m, p.count)
  }
  return m
})

const points = computed(() => {
  const n = props.series.length
  if (n === 0) {
    return []
  }
  const innerW = chartW - padL - padR
  const gap = 2
  const barW = Math.max(2, (innerW - gap * (n - 1)) / n)
  const plotH = chartH - padT - padB
  const max = Math.max(1, maxCount.value)

  return props.series.map((pt, i) => {
    const h = Math.round((pt.count / max) * plotH)
    const x = padL + i * (barW + gap)
    const y = padT + (plotH - h)
    const d = pt.date
    const shortLabel = d.slice(8, 10) + '/' + d.slice(5, 7)
    const [yy, mm, dd] = d.split('-').map(Number)
    const label = `${String(dd).padStart(2, '0')}/${String(mm).padStart(2, '0')}/${yy}`

    return { date: pt.date, count: pt.count, x, y, h: Math.max(pt.count > 0 ? 4 : 1, h), barW, shortLabel, label }
  })
})

function showLabel(i: number, len: number) {
  if (len <= 12) {
    return true
  }
  if (len <= 24) {
    return i % 2 === 0
  }
  return i % 3 === 0 || i === len - 1
}
</script>
