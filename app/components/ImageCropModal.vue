<template>
  <Teleport to="body">
    <div
      v-if="modelValue && objectUrl"
      class="fixed inset-0 z-[200] flex flex-col overflow-y-auto bg-black/90 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
    >
      <div class="mx-auto flex w-full max-w-4xl flex-col gap-3 py-4">
        <h2 :id="titleId" class="text-lg font-semibold text-white">{{ title }}</h2>
        <p class="text-sm text-zinc-400">
          Arraste para centralizar. Use a roda do mouse ou gestos para aproximar. A área destacada é o que será enviado.
        </p>
        <div class="max-h-[min(70vh,560px)] w-full overflow-hidden rounded-xl bg-zinc-950">
          <img
            ref="imgRef"
            :src="objectUrl"
            alt=""
            class="block max-h-[min(70vh,560px)] w-full"
            @load="onImgLoad"
          />
        </div>
        <div class="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
            :disabled="busy"
            @click="onCancel"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            :disabled="busy || !cropperReady"
            @click="onConfirm"
          >
            {{ busy ? 'Gerando…' : 'Usar recorte' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type Cropper from 'cropperjs'

const props = defineProps<{
  modelValue: boolean
  file: File | null
  aspectRatio: number
  title: string
  outputName?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  cropped: [File]
}>()

const titleId = `img-crop-${Math.random().toString(36).slice(2, 9)}`
const imgRef = ref<HTMLImageElement | null>(null)
const objectUrl = ref<string | null>(null)
let cropper: Cropper | null = null
const busy = ref(false)
const cropperReady = ref(false)

function destroyCropper() {
  cropper?.destroy()
  cropper = null
  cropperReady.value = false
}

function cleanupUrl() {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = null
  }
}

function onCancel() {
  busy.value = false
  destroyCropper()
  cleanupUrl()
  emit('update:modelValue', false)
}

async function onImgLoad() {
  destroyCropper()
  const el = imgRef.value
  if (!el || !props.modelValue) {
    return
  }
  const { default: CropperCtor } = await import('cropperjs')
  await import('cropperjs/dist/cropper.css')
  cropper = new CropperCtor(el, {
    aspectRatio: props.aspectRatio,
    viewMode: 1,
    dragMode: 'move',
    autoCropArea: 1,
    responsive: true,
    background: false,
  })
  cropperReady.value = true
}

watch(
  () => props.modelValue && props.file,
  (open) => {
    destroyCropper()
    cleanupUrl()
    if (!open || !props.file) {
      return
    }
    objectUrl.value = URL.createObjectURL(props.file)
  },
)

watch(
  () => props.aspectRatio,
  () => {
    if (cropper) {
      cropper.setAspectRatio(props.aspectRatio)
    }
  },
)

async function onConfirm() {
  if (!cropper) {
    return
  }
  busy.value = true
  try {
    const canvas = cropper.getCroppedCanvas({
      maxWidth: 4096,
      maxHeight: 4096,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    })
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92),
    )
    if (!blob) {
      return
    }
    const base =
      props.outputName?.replace(/\.[^.]+$/, '') ||
      props.file?.name?.replace(/\.[^.]+$/, '') ||
      'recorte'
    const out = new File([blob], `${base}.jpg`, { type: 'image/jpeg' })
    emit('cropped', out)
    destroyCropper()
    cleanupUrl()
    emit('update:modelValue', false)
  } finally {
    busy.value = false
  }
}

onBeforeUnmount(() => {
  destroyCropper()
  cleanupUrl()
})
</script>
