import Swal from 'sweetalert2'

/**
 * Diálogos SweetAlert2 com textos em português do Brasil.
 */
export function useSwal() {
  async function swalConfirm(options: {
    title: string
    text?: string
    html?: string
    icon?: 'warning' | 'question' | 'info' | 'error' | 'success'
    confirmButtonText?: string
    cancelButtonText?: string
    confirmButtonColor?: string
  }): Promise<boolean> {
    const result = await Swal.fire({
      icon: options.icon ?? 'question',
      title: options.title,
      text: options.text,
      html: options.html,
      showCancelButton: true,
      focusCancel: true,
      confirmButtonText: options.confirmButtonText ?? 'Confirmar',
      cancelButtonText: options.cancelButtonText ?? 'Cancelar',
      confirmButtonColor: options.confirmButtonColor,
    })
    return result.isConfirmed
  }

  async function swalAlert(options: {
    title: string
    text?: string
    html?: string
    icon?: 'warning' | 'question' | 'info' | 'error' | 'success'
    confirmButtonText?: string
  }): Promise<void> {
    await Swal.fire({
      icon: options.icon ?? 'info',
      title: options.title,
      text: options.text,
      html: options.html,
      confirmButtonText: options.confirmButtonText ?? 'OK',
    })
  }

  /**
   * Recusa com campo de motivo opcional (textarea). Se o utilizador preencher, o backend pode notificar o anunciante por e-mail.
   */
  async function swalRejectWithReason(options: {
    title: string
    text?: string
  }): Promise<{ confirmed: boolean; reason: string }> {
    const result = await Swal.fire({
      icon: 'warning',
      title: options.title,
      text: options.text,
      input: 'textarea',
      inputPlaceholder:
        'Opcional: motivo para o anunciante. Se preencher, enviamos por e-mail com a referência da solicitação.',
      showCancelButton: true,
      focusCancel: true,
      confirmButtonText: 'Recusar',
      cancelButtonText: 'Cancelar',
      inputAttributes: {
        'aria-label': 'Motivo da recusa',
        rows: '4',
      },
    })
    if (!result.isConfirmed) {
      return { confirmed: false, reason: '' }
    }
    return { confirmed: true, reason: String(result.value ?? '').trim() }
  }

  return { swalConfirm, swalAlert, swalRejectWithReason }
}
