import { describe, expect, it } from 'vitest'
import { advertiserAreaDestination, registerOrProfileDestination } from '~/utils/area-destination'
import { isAdminSitePath } from '~/utils/admin-route'
import { isAgeGateExemptPath, safeInternalNextPath } from '~/utils/age-gate-routes'
import { adminCadastroCanonicalPath, canonicalPathFromLegacy } from '~/utils/legacy-path'
import { buildPublicProfilePath } from '~/utils/public-profile-url'
import {
  adminApprovalStatusLabel,
  adminFormStatusLabel,
} from '~/utils/admin-labels'
import { exploreHubSeoDescription, exploreSeoPack } from '~/utils/explore-seo-copy'

describe('destino da área logada', () => {
  it('visitante vai para login', () => {
    expect(advertiserAreaDestination(null)).toBe('/login')
    expect(advertiserAreaDestination('')).toBe('/login')
  })

  it('admin vai para o painel e anunciante para a conta', () => {
    expect(advertiserAreaDestination('tok', 'admin')).toBe('/admin')
    expect(advertiserAreaDestination('tok', 'advertiser')).toBe('/conta')
  })

  it('cadastro vs perfil público conforme aprovação', () => {
    expect(registerOrProfileDestination({ isApprovedAdvertiser: false })).toBe('/cadastro')
    expect(
      registerOrProfileDestination({
        isApprovedAdvertiser: true,
        publicSlug: 'luna',
        serviceType: 'companion',
        publicPath: buildPublicProfilePath,
      }),
    ).toBe('/acompanhante/luna')
    expect(
      registerOrProfileDestination({
        isApprovedAdvertiser: true,
        publicSlug: 'sofia',
        serviceType: 'masseuse',
        publicPath: buildPublicProfilePath,
      }),
    ).toBe('/massagista/sofia')
    expect(registerOrProfileDestination({ isApprovedAdvertiser: true })).toBe('/conta/perfil')
  })
})

describe('rotas e age gate', () => {
  it('marca o painel admin', () => {
    expect(isAdminSitePath('/admin')).toBe(true)
    expect(isAdminSitePath('/admin/cadastros/9')).toBe(true)
    expect(isAdminSitePath('/conta')).toBe(false)
    expect(isAdminSitePath('/explorar')).toBe(false)
  })

  it('libera login, conta, cadastro e legal do age gate', () => {
    for (const path of [
      '/login',
      '/cadastro',
      '/conta',
      '/conta/perfil',
      '/admin/cadastros',
      '/contato',
      '/politica-de-privacidade',
      '/termos-de-servico',
      '/sobre-nos',
      '/anunciar',
      '/confirmar-email',
      '/entrar/recuperar',
    ]) {
      expect(isAgeGateExemptPath(path)).toBe(true)
    }
    expect(isAgeGateExemptPath('/explorar')).toBe(false)
    expect(isAgeGateExemptPath('/acompanhante/luna')).toBe(false)
  })

  it('bloqueia open redirect no next', () => {
    expect(safeInternalNextPath('/conta')).toBe('/conta')
    expect(safeInternalNextPath('https://evil.test')).toBeNull()
    expect(safeInternalNextPath('//evil.test')).toBeNull()
    expect(safeInternalNextPath(12)).toBeNull()
  })
})

describe('URLs legadas', () => {
  it('traduz explorar e conta', () => {
    expect(canonicalPathFromLegacy('/explore')).toBe('/explorar')
    expect(canonicalPathFromLegacy('/explore/mulheres/city/ba/salvador')).toBe(
      '/explorar/mulheres/cidade/ba/salvador',
    )
    expect(canonicalPathFromLegacy('/explore/mulheres/profile/luna')).toBe(
      '/explorar/mulheres/perfil/luna',
    )
    expect(canonicalPathFromLegacy('/account')).toBe('/conta')
    expect(canonicalPathFromLegacy('/account/profile')).toBe('/conta/perfil')
    expect(canonicalPathFromLegacy('/auth/forgot-password')).toBe('/entrar/recuperar')
    expect(canonicalPathFromLegacy('/auth/reset-password')).toBe('/entrar/redefinir')
    expect(canonicalPathFromLegacy('/explorar')).toBeNull()
  })

  it('corrige /admin/cadastro/:id', () => {
    expect(adminCadastroCanonicalPath('12')).toBe('/admin/cadastros/12')
    expect(adminCadastroCanonicalPath('')).toBe('/admin/cadastros')
    expect(adminCadastroCanonicalPath(null)).toBe('/admin/cadastros')
  })
})

describe('labels admin e SEO sem travessão', () => {
  it('traduz status de cadastro', () => {
    expect(adminApprovalStatusLabel('pending')).toBe('Pendente')
    expect(adminFormStatusLabel('draft')).toBe('Rascunho')
    expect(adminFormStatusLabel('complete')).toBe('Formulário completo')
  })

  it('não usa travessão em textos de SEO', () => {
    const pack = exploreSeoPack('mulheres')
    const blob = [
      pack?.hubSubheading,
      pack?.hubTitle,
      exploreHubSeoDescription(),
      pack?.stateSeoTitle('Bahia', 'BA'),
      pack?.regionSeoTitle('Nordeste'),
    ].join(' ')
    expect(blob).not.toContain('—')
  })
})
