import { apiErrorMessage } from '~/utils/api-error-message'

export type LaravelPaginator<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export function useAdminList<T>(opts: {
  endpoint: string
  extraQuery?: () => Record<string, string | number | undefined | null>
  defaultPerPage?: number
}) {
  const { request } = useApi()
  const q = ref('')
  const page = ref(1)
  const perPage = ref(opts.defaultPerPage ?? 20)
  const loading = ref(false)
  const error = ref('')
  const result = ref<LaravelPaginator<T> | null>(null)
  let debounce: ReturnType<typeof setTimeout> | null = null

  const items = computed(() => result.value?.data ?? [])
  const total = computed(() => result.value?.total ?? 0)
  const lastPage = computed(() => result.value?.last_page ?? 1)
  const from = computed(() => result.value?.from ?? 0)
  const to = computed(() => result.value?.to ?? 0)

  function buildPath() {
    const qs = new URLSearchParams()
    qs.set('page', String(page.value))
    qs.set('per_page', String(perPage.value))
    const term = q.value.trim()
    if (term) {
      qs.set('q', term)
    }
    const extra = opts.extraQuery?.() ?? {}
    for (const [key, value] of Object.entries(extra)) {
      if (value !== undefined && value !== null && String(value) !== '') {
        qs.set(key, String(value))
      }
    }
    return `${opts.endpoint}?${qs.toString()}`
  }

  async function load() {
    loading.value = true
    error.value = ''
    try {
      result.value = await request<LaravelPaginator<T>>(buildPath())
    } catch (e: unknown) {
      error.value = apiErrorMessage(e, 'Não foi possível carregar a lista.')
      result.value = null
    } finally {
      loading.value = false
    }
  }

  function scheduleSearch() {
    page.value = 1
    if (debounce) {
      clearTimeout(debounce)
    }
    debounce = setTimeout(() => {
      void load()
    }, 320)
  }

  function goToPage(next: number) {
    page.value = Math.max(1, next)
    void load()
  }

  function setPerPage(next: number) {
    perPage.value = next
    page.value = 1
    void load()
  }

  onBeforeUnmount(() => {
    if (debounce) {
      clearTimeout(debounce)
    }
  })

  return {
    q,
    page,
    perPage,
    loading,
    error,
    result,
    items,
    total,
    lastPage,
    from,
    to,
    load,
    scheduleSearch,
    goToPage,
    setPerPage,
  }
}
