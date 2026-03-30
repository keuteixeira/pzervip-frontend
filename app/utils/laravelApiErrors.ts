type LaravelErrorPayload = { errors?: Record<string, string[]>; message?: string }

function getLaravelErrorPayload(e: unknown): LaravelErrorPayload | null {
  const err = e as {
    data?: LaravelErrorPayload
    response?: { _data?: LaravelErrorPayload }
    cause?: { data?: LaravelErrorPayload }
  }
  return err.data ?? err.response?._data ?? err.cause?.data ?? null
}

/** Primeira mensagem 422: tenta `fields` em ordem, depois qualquer campo, depois `message`. */
export function laravelErrorMessage(e: unknown, fields?: string[]): string | null {
  const d = getLaravelErrorPayload(e)
  if (!d) {
    return null
  }
  if (d.errors) {
    if (fields && fields.length > 0) {
      for (const f of fields) {
        const arr = d.errors[f]
        if (arr?.[0]) {
          return arr[0]
        }
      }
    }
    for (const k of Object.keys(d.errors)) {
      const arr = d.errors[k]
      if (Array.isArray(arr) && typeof arr[0] === 'string' && arr[0].length > 0) {
        return arr[0]
      }
    }
  }
  if (typeof d.message === 'string' && d.message.length > 0) {
    return d.message
  }
  return null
}

export function extractLaravelErrorMessage(e: unknown, fields?: string[]): string | null {
  return laravelErrorMessage(e, fields)
}
