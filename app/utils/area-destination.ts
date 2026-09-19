export function advertiserAreaDestination(token: string | null | undefined, role?: string | null): string {
  if (!token) {
    return '/login'
  }
  if (role === 'admin') {
    return '/admin'
  }
  return '/conta'
}

export function registerOrProfileDestination(opts: {
  isApprovedAdvertiser: boolean
  publicSlug?: string | null
  serviceType?: string | null
  publicPath?: (slug: string, serviceType?: string | null) => string
}): string {
  if (!opts.isApprovedAdvertiser) {
    return '/cadastro'
  }
  const slug = opts.publicSlug?.trim()
  if (slug && opts.publicPath) {
    return opts.publicPath(slug, opts.serviceType)
  }
  if (slug) {
    return `/${opts.serviceType === 'masseuse' ? 'massagista' : 'acompanhante'}/${slug}`
  }
  return '/conta/perfil'
}
