/**
 * Builder do formulário de pré-cadastro (admin).
 * Persistência local em sessionStorage até existir API dedicada.
 */

const STORAGE_KEY = 'pzervip_registration_form_builder_v1'

export type RegFieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'number'

export type RegFormQuestion = {
  id: number
  key: string
  label: string
  field_type: RegFieldType
  required: boolean
  options: string[]
  rules_note: string
  sort_order: number
}

export type RegFormDefinition = {
  id: number
  title: string
  description: string
  questions: RegFormQuestion[]
  _nextQuestionId: number
}

function seed(): RegFormDefinition[] {
  return [
    {
      id: 1,
      title: 'Pré-cadastro de anunciante',
      description: 'Fluxo exibido no portal — estruture perguntas e regras aqui.',
      questions: [],
      _nextQuestionId: 1,
    },
  ]
}

function normalizeForms(forms: RegFormDefinition[]): RegFormDefinition[] {
  return forms.map((f) => {
    const qs = (f.questions ?? []).map((q) => ({
      ...q,
      options: Array.isArray(q.options) ? q.options : [],
      rules_note: q.rules_note ?? '',
    }))
    const maxId = qs.reduce((m, q) => Math.max(m, q.id), 0)
    const next = typeof f._nextQuestionId === 'number' && f._nextQuestionId > maxId ? f._nextQuestionId : maxId + 1
    return {
      ...f,
      questions: qs,
      _nextQuestionId: next,
    }
  })
}

function loadRaw(): RegFormDefinition[] | null {
  if (!import.meta.client) {
    return null
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as RegFormDefinition[]
    return normalizeForms(parsed)
  } catch {
    return null
  }
}

function saveRaw(forms: RegFormDefinition[]) {
  if (!import.meta.client) {
    return
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(forms))
}

export function useRegistrationFormBuilder() {
  const forms = useState<RegFormDefinition[]>('reg-form-builder-forms', () => [])
  const ready = useState<boolean>('reg-form-builder-ready', () => false)

  function hydrate() {
    if (ready.value) {
      return
    }
    if (!import.meta.client) {
      return
    }
    const stored = loadRaw()
    forms.value = stored && stored.length > 0 ? stored : seed()
    ready.value = true
    if (!stored) {
      saveRaw(forms.value)
    }
  }

  function persist() {
    saveRaw(forms.value)
  }

  function getForm(formId: number) {
    return forms.value.find((f) => f.id === formId) ?? null
  }

  function updateFormMeta(formId: number, title: string, description: string) {
    hydrate()
    const f = getForm(formId)
    if (!f) {
      return false
    }
    f.title = title.trim()
    f.description = description.trim()
    persist()
    return true
  }

  function addQuestion(
    formId: number,
    input: { key: string; label: string; field_type: RegFieldType; required: boolean },
  ): RegFormQuestion | null {
    hydrate()
    const f = getForm(formId)
    if (!f) {
      return null
    }
    const id = f._nextQuestionId++
    const q: RegFormQuestion = {
      id,
      key: input.key.trim(),
      label: input.label.trim(),
      field_type: input.field_type,
      required: input.required,
      options: [],
      rules_note: '',
      sort_order: f.questions.length,
    }
    f.questions.push(q)
    persist()
    return q
  }

  function updateQuestion(
    formId: number,
    questionId: number,
    patch: Partial<
      Pick<RegFormQuestion, 'key' | 'label' | 'field_type' | 'required' | 'options' | 'rules_note' | 'sort_order'>
    >,
  ) {
    hydrate()
    const f = getForm(formId)
    if (!f) {
      return false
    }
    const q = f.questions.find((x) => x.id === questionId)
    if (!q) {
      return false
    }
    Object.assign(q, patch)
    persist()
    return true
  }

  function getQuestion(formId: number, questionId: number) {
    hydrate()
    const f = getForm(formId)
    return f?.questions.find((x) => x.id === questionId) ?? null
  }

  function removeQuestion(formId: number, questionId: number) {
    hydrate()
    const f = getForm(formId)
    if (!f) {
      return false
    }
    f.questions = f.questions.filter((x) => x.id !== questionId)
    persist()
    return true
  }

  return {
    forms,
    ready,
    hydrate,
    getForm,
    updateFormMeta,
    addQuestion,
    updateQuestion,
    getQuestion,
    removeQuestion,
  }
}
