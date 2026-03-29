<template>
  <Teleport to="body">
    <div
      v-if="open && item"
      class="fixed inset-0 z-[100] flex flex-col bg-black/95 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Visualização em tela cheia"
    >
      <button
        type="button"
        class="absolute right-4 top-4 z-10 rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
        @click="close"
      >
        Fechar
      </button>
      <div class="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 pt-10">
        <audio
          v-if="item.kind === 'audio'"
          :src="item.url"
          controls
          class="w-full max-w-lg"
          autoplay
        />
        <video
          v-else-if="item.kind === 'video'"
          :key="item.url"
          :src="item.url"
          controls
          playsinline
          class="max-h-[78vh] max-w-full rounded-lg"
          autoplay
        />
        <img
          v-else
          :src="item.url"
          :alt="altText"
          class="max-h-[85vh] max-w-full object-contain"
        />
        <div class="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            class="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-30"
            :disabled="index <= 0"
            @click="prev"
          >
            Anterior
          </button>
          <span class="text-sm text-zinc-400">{{ index + 1 }} / {{ items.length }}</span>
          <button
            type="button"
            class="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-30"
            :disabled="index >= items.length - 1"
            @click="next"
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
export type LightboxItem = { kind: 'audio' | 'video' | 'image'; url: string }

const props = defineProps<{
  items: LightboxItem[]
  modelValue: boolean
  startIndex: number
  altText?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const open = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const index = ref(0)

watch(
  () => props.startIndex,
  (v) => {
    index.value = Math.max(0, Math.min(v, Math.max(0, props.items.length - 1)))
  },
  { immediate: true },
)

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      index.value = Math.max(0, Math.min(props.startIndex, Math.max(0, props.items.length - 1)))
    }
  },
)

const item = computed(() => props.items[index.value] ?? null)

function close() {
  open.value = false
}

function prev() {
  if (index.value > 0) {
    index.value -= 1
  }
}

function next() {
  if (index.value < props.items.length - 1) {
    index.value += 1
  }
}

function onKey(e: KeyboardEvent) {
  if (!open.value) {
    return
  }
  if (e.key === 'Escape') {
    close()
  }
  if (e.key === 'ArrowLeft') {
    prev()
  }
  if (e.key === 'ArrowRight') {
    next()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
})
</script>
