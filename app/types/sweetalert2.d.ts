/**
 * Fallback quando o TS não resolve o pacote (ex.: workspace UNC/WSL sem node_modules visível ao IDE).
 */
declare module 'sweetalert2' {
  const Swal: {
    fire(options?: Record<string, unknown>): Promise<{ isConfirmed: boolean; value?: unknown }>
  }
  export default Swal
}
