import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function listVuePages(dir: string, prefix = ''): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      out.push(...listVuePages(full, `${prefix}/${name}`))
      continue
    }
    if (name.endsWith('.vue')) {
      out.push(`${prefix}/${name.replace(/\.vue$/, '')}`.replace(/\/index$/, '') || '/')
    }
  }
  return out.sort()
}

describe('inventário de páginas', () => {
  const pages = listVuePages(join(process.cwd(), 'app/pages'))

  it('tem as rotas públicas, da conta e do admin', () => {
    const needed = [
      '/',
      '/login',
      '/register',
      '/contact',
      '/about',
      '/explore',
      '/account',
      '/account/profile',
      '/account/seguranca',
      '/account/support',
      '/admin',
      '/admin/cadastros',
      '/admin/cadastros/[id]',
      '/admin/anunciantes',
      '/admin/anunciantes/[id]',
      '/admin/financeiro',
      '/admin/chamados',
      '/admin/contato',
      '/admin/midias',
      '/admin/comentarios',
      '/admin/texto-perfil',
    ]
    for (const path of needed) {
      expect(pages).toContain(path)
    }
  })

  it('não deixa página admin sem o prefixo /admin', () => {
    const adminPages = pages.filter((p) => p.startsWith('/admin'))
    expect(adminPages.length).toBeGreaterThan(8)
  })
})
