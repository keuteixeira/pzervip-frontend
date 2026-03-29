<template>
  <div class="relative">
    <button
      type="button"
      class="input flex w-full items-center justify-between text-left"
      :class="{ 'text-zinc-500': !modelValue }"
      @click="open = !open"
    >
      <span>{{ displayLabel }}</span>
      <span class="text-zinc-500" aria-hidden="true">▾</span>
    </button>
    <div v-if="open" class="fixed inset-0 z-40" aria-hidden="true" @click="open = false" />
    <div
      v-if="open"
      class="absolute left-0 top-full z-50 mt-1 w-full min-w-[280px] rounded-xl border border-zinc-700 bg-zinc-900 p-3 shadow-xl"
      @click.stop
    >
      <div class="mb-3 flex flex-wrap items-stretch gap-2">
        <select
          class="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white outline-none ring-brand focus:ring-2"
          :value="view.getMonth()"
          aria-label="Mês"
          @change="onMonthChange"
        >
          <option v-for="opt in monthOptionsForView" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <select
          class="min-w-[5.5rem] rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white outline-none ring-brand focus:ring-2"
          :value="view.getFullYear()"
          aria-label="Ano"
          @change="onYearChange"
        >
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
      <div class="grid grid-cols-7 gap-0.5 text-center text-xs text-zinc-500">
        <span v-for="w in weekDays" :key="w" class="py-1">{{ w }}</span>
      </div>
      <div class="mt-1 grid grid-cols-7 gap-0.5">
        <button
          v-for="(cell, idx) in cells"
          :key="idx"
          type="button"
          :disabled="cell.day === null || cell.outOfRange"
          class="rounded-lg py-2 text-sm transition"
          :class="[
            cell.day === null ? 'invisible' : '',
            cell.outOfRange ? 'cursor-not-allowed text-zinc-600' : 'text-zinc-200 hover:bg-zinc-800',
            cell.selected ? 'bg-brand font-semibold text-white hover:bg-brand-muted' : '',
          ]"
          @click="cell.day !== null && !cell.outOfRange && pick(cell.day)"
        >
          {{ cell.day }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)

/** View: first day of visible month (local). */
const view = ref(startOfMonth(new Date()))

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const yearOptions = computed(() => {
  const minY = minDate.value.getFullYear()
  const maxY = maxDate.value.getFullYear()
  const out: number[] = []
  for (let y = maxY; y >= minY; y -= 1) {
    out.push(y)
  }
  return out
})

/** Meses permitidos para o ano atualmente visível (evita mês futuro no ano corrente). */
const monthOptionsForView = computed(() => {
  const y = view.value.getFullYear()
  const minY = minDate.value.getFullYear()
  const maxY = maxDate.value.getFullYear()
  const minM = minDate.value.getMonth()
  const maxM = maxDate.value.getMonth()
  let start = 0
  let end = 11
  if (y === minY) {
    start = minM
  }
  if (y === maxY) {
    end = maxM
  }
  return Array.from({ length: end - start + 1 }, (_, i) => ({
    value: start + i,
    label: monthNames[start + i],
  }))
})

const minDate = computed(() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 120)
  return d
})

const maxDate = computed(() => new Date())

function parseIso(s: string): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return null
  }
  const [y, m, day] = s.split('-').map(Number)
  const d = new Date(y, m - 1, day)
  if (d.getFullYear() !== y || d.getMonth() !== m - 1 || d.getDate() !== day) {
    return null
  }
  return d
}

const selected = computed(() => (props.modelValue ? parseIso(props.modelValue) : null))

const displayLabel = computed(() => {
  if (!props.modelValue || !selected.value) {
    return 'Data de nascimento *'
  }
  return selected.value.toLocaleDateString('pt-BR')
})

const cells = computed(() => {
  const y = view.value.getFullYear()
  const m = view.value.getMonth()
  const first = new Date(y, m, 1)
  const startPad = first.getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const out: { day: number | null; selected: boolean; outOfRange: boolean }[] = []

  for (let i = 0; i < startPad; i++) {
    out.push({ day: null, selected: false, outOfRange: false })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(y, m, day)
    const outOfRange = d < stripTime(minDate.value) || d > stripTime(maxDate.value)
    const sel =
      selected.value !== null &&
      selected.value.getFullYear() === y &&
      selected.value.getMonth() === m &&
      selected.value.getDate() === day
    out.push({ day, selected: sel, outOfRange })
  }
  while (out.length % 7 !== 0) {
    out.push({ day: null, selected: false, outOfRange: false })
  }
  return out
})

function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function clampViewMonth(d: Date): Date {
  const first = startOfMonth(d)
  const minFirst = startOfMonth(minDate.value)
  const maxFirst = startOfMonth(maxDate.value)
  if (first < minFirst) {
    return minFirst
  }
  if (first > maxFirst) {
    return maxFirst
  }
  return first
}

function onMonthChange(e: Event) {
  const m = Number((e.target as HTMLSelectElement).value)
  const d = new Date(view.value.getFullYear(), m, 1)
  view.value = clampViewMonth(d)
}

function onYearChange(e: Event) {
  const y = Number((e.target as HTMLSelectElement).value)
  const d = new Date(y, view.value.getMonth(), 1)
  view.value = clampViewMonth(d)
}

watch(monthOptionsForView, (opts) => {
  const m = view.value.getMonth()
  if (!opts.some((o) => o.value === m)) {
    const pick = opts[opts.length - 1]?.value ?? 0
    view.value = clampViewMonth(new Date(view.value.getFullYear(), pick, 1))
  }
})

function pick(day: number) {
  const y = view.value.getFullYear()
  const m = view.value.getMonth()
  const d = new Date(y, m, day)
  const iso = toIsoLocal(d)
  emit('update:modelValue', iso)
  open.value = false
}

function toIsoLocal(d: Date): string {
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${day}`
}

watch(
  () => props.modelValue,
  (v) => {
    const p = v ? parseIso(v) : null
    if (p) {
      view.value = clampViewMonth(startOfMonth(p))
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.input {
  @apply w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand;
}
</style>
