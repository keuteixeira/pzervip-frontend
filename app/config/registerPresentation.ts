/**
 * Apresentação e fotos (cadastro etapa 6).
 *
 * Capa: textos e dimensões sugeridas — edite aqui para ajustar a UI sem deploy do backend.
 * Galeria: quantidade mín/máx vem do backend (`GALLERY_MIN_PHOTOS`, `GALLERY_MAX_PHOTOS`)
 * e de GET /v1/config/register-media; use REGISTER_GALLERY_DEFAULTS só como fallback offline.
 */
export const REGISTER_COVER = {
  suggestedWidthPx: 1200,
  suggestedHeightPx: 400,
  /** Uma linha curta para o usuário (ex.: card de perfil / listagem) */
  suggestedSizeLabel: '1200 × 400 px',
  aspectHint: 'Imagem larga, tipo banner horizontal.',
  maxFileMb: 10,
  formatsHint: 'JPG, PNG ou WebP.',
} as const

export const REGISTER_GALLERY_DEFAULTS = {
  min: 3,
  max: 5,
} as const
