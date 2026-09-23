<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
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
        <div
          ref="stageRef"
          class="img-crop-stage relative h-[min(70vh,560px)] w-full overflow-hidden rounded-xl bg-zinc-950"
        />
        <p v-if="initError" class="text-sm text-red-400" role="alert">{{ initError }}</p>
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
import Cropper from 'cropperjs/dist/cropper.esm.js'
import 'cropperjs/dist/cropper.css'

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
const stageRef = ref<HTMLElement | null>(null)
const objectUrl = ref<string | null>(null)
let cropper: Cropper | null = null
let initSeq = 0
const busy = ref(false)
const cropperReady = ref(false)
const initError = ref('')

function destroyCropper() {
  cropper?.destroy()
  cropper = null
  cropperReady.value = false
}

function clearStage() {
  if (stageRef.value) {
    stageRef.value.innerHTML = ''
  }
}

function cleanupUrl() {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = null
  }
}

function resetStage() {
  initSeq += 1
  destroyCropper()
  clearStage()
  cleanupUrl()
  initError.value = ''
}

function onCancel() {
  busy.value = false
  resetStage()
  emit('update:modelValue', false)
}

function initCropper(img: HTMLImageElement, seq: number) {
  if (cropper || seq !== initSeq || !img.isConnected || !props.modelValue) {
    return
  }
  try {
    cropper = new Cropper(img, {
      aspectRatio: props.aspectRatio,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.8,
      responsive: true,
      background: false,
      guides: true,
      highlight: true,
      ready() {
        if (seq === initSeq) {
          cropperReady.value = true
        }
      },
    })
  } catch {
    if (seq === initSeq) {
      initError.value = 'Não foi possível abrir o recorte. Tente outra imagem.'
    }
  }
}

async function mountSourceImage() {
  const seq = ++initSeq
  destroyCropper()
  clearStage()
  cleanupUrl()
  initError.value = ''
  if (!props.modelValue || !props.file) {
    return
  }
  objectUrl.value = URL.createObjectURL(props.file)
  await nextTick()
  const stage = stageRef.value
  if (!stage || seq !== initSeq) {
    return
  }
  const img = document.createElement('img')
  img.alt = ''
  img.src = objectUrl.value
  const start = () => {
    initCropper(img, seq)
  }
  img.addEventListener('load', start, { once: true })
  stage.appendChild(img)
  if (img.complete && img.naturalWidth > 0) {
    start()
  }
}

watch(
  () => [props.modelValue, props.file] as const,
  ([open, file]) => {
    if (!open || !file) {
      resetStage()
      return
    }
    void mountSourceImage()
  },
  { immediate: true, flush: 'post' },
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
    resetStage()
    emit('update:modelValue', false)
  } finally {
    busy.value = false
  }
}

onBeforeUnmount(() => {
  resetStage()
})
</script>

<style>
.img-crop-stage img {
  display: block;
  max-height: 100%;
  max-width: 100%;
}

.img-crop-stage .cropper-container {
  max-height: 100%;
}

.img-crop-stage .cropper-container img {
  max-width: none !important;
}
</style>
