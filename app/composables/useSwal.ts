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

  return { swalConfirm, swalAlert }
}
