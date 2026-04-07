/**
 * Textos para SEO no explorar (ex.: «acompanhantes masculinos Salvador», «garota de programa»).
 * Títulos e descrições espelham a intenção de busca; Google prioriza isso + texto visível na página.
 */

export type ExploreGenderSlug = 'homens' | 'mulheres' | 'trans'

function clip(s: string, max = 158): string {
  const t = s.trim()
  if (t.length <= max) {
    return t
  }
  return `${t.slice(0, max - 1).trim()}…`
}

const PACK: Record<
  ExploreGenderSlug,
  {
    metaKeywords: string
    citySeoTitle(city: string, uf: string): string
    citySeoDescription(city: string, uf: string, profileCount: number): string
    cityH1(city: string): string
    cityIntro(city: string, uf: string): string
    hubTitle: string
    /** Linha visível abaixo do H1 do hub por gênero */
    hubSubheading: string
    hubDescription: string
    stateSeoTitle(stateName: string, uf: string): string
    stateSeoDescription(stateName: string, uf: string): string
    regionSeoTitle(regionDisplayName: string): string
    regionSeoDescription(regionDisplayName: string): string
  }
> = {
  homens: {
    metaKeywords:
      'acompanhantes masculinos, acompanhante masculino, garotos de programa, garoto de programa, massagista masculino, homens, classificados',
    citySeoTitle: (city, uf) =>
      `Garotos de programa e acompanhantes masculinos em ${city} (${uf}) · Prazer.Vip`,
    citySeoDescription: (city, uf, n) => {
      const q = n === 1 ? 'Um perfil' : `${n} perfis`
      return clip(
        `[18+] ${q} de garotos de programa e acompanhantes masculinos em ${city} (${uf}): discrição, fotos e contato direto com quem anuncia. Prazer.Vip — privacidade e escolha na hora.`,
      )
    },
    cityH1: (city) => `Garotos de programa e acompanhantes masculinos em ${city}`,
    cityIntro: (city, uf) =>
      `Buscando garoto de programa ou acompanhante masculino em ${city} (${uf})? Veja anúncios verificados, filtre massagista ou acompanhante e fale direto com o perfil.`,
    hubTitle: 'Garotos de programa e acompanhantes masculinos por cidade · Prazer.Vip',
    hubSubheading:
      'Garotos de programa e acompanhantes masculinos — escolha região, estado e cidade com anúncios verificados.',
    hubDescription: clip(
      '[18+] Garotos de programa, acompanhantes masculinos e massagistas homens em todo o Brasil. Escolha o estado, entre na cidade e veja quem está disponível agora no Prazer.Vip.',
    ),
    stateSeoTitle: (stateName, uf) =>
      `Garotos de programa e acompanhantes masculinos em ${stateName} (${uf}) — cidades · Prazer.Vip`,
    stateSeoDescription: (stateName, uf) =>
      clip(
        `[18+] Cidades de ${stateName} (${uf}) com garotos de programa e acompanhantes masculinos. Abra a cidade que quiser e veja perfis com foto no Prazer.Vip.`,
      ),
    regionSeoTitle: (region) =>
      `Garotos de programa e acompanhantes masculinos — região ${region} · Prazer.Vip`,
    regionSeoDescription: (region) =>
      clip(
        `[18+] Região ${region}: estados e cidades com garotos de programa e acompanhantes masculinos. Navegue até a capital ou o interior no Prazer.Vip.`,
      ),
  },
  mulheres: {
    metaKeywords:
      'acompanhantes femininas, acompanhantes mulheres, garotas de programa, garota de programa, massagistas, classificados',
    citySeoTitle: (city, uf) =>
      `Garotas de programa e acompanhantes em ${city} (${uf}) · Prazer.Vip`,
    citySeoDescription: (city, uf, n) => {
      const q = n === 1 ? 'Um perfil' : `${n} perfis`
      return clip(
        `[18+] ${q} de garotas de programa, massagistas e acompanhantes em ${city} (${uf}): discrição, fotos reais e contato na medida. Encontre quem combina com você no Prazer.Vip.`,
      )
    },
    cityH1: (city) => `Garotas de programa e acompanhantes em ${city}`,
    cityIntro: (city, uf) =>
      `Procura massagista, acompanhante ou garota de programa em ${city} (${uf})? Lista verificada no Prazer.Vip — use o filtro para afinar o tipo de atendimento.`,
    hubTitle: 'Garotas de programa, massagistas e acompanhantes por cidade · Prazer.Vip',
    hubSubheading:
      'Garotas de programa, massagistas e acompanhantes — navegue por região até a cidade que quiser.',
    hubDescription: clip(
      '[18+] Garotas de programa, massagistas e acompanhantes femininas em todo o Brasil. Estado → cidade → perfis com foto e contato no Prazer.Vip.',
    ),
    stateSeoTitle: (stateName, uf) =>
      `Garotas de programa e acompanhantes em ${stateName} (${uf}) — cidades · Prazer.Vip`,
    stateSeoDescription: (stateName, uf) =>
      clip(
        `[18+] Cidades de ${stateName} (${uf}) com garotas de programa, massagistas e acompanhantes. Escolha a cidade e veja anúncios no Prazer.Vip.`,
      ),
    regionSeoTitle: (region) =>
      `Garotas de programa e acompanhantes — região ${region} · Prazer.Vip`,
    regionSeoDescription: (region) =>
      clip(
        `[18+] Região ${region}: estados com garotas de programa, massagistas e acompanhantes. Entre na UF e na cidade no Prazer.Vip.`,
      ),
  },
  trans: {
    metaKeywords:
      'acompanhantes trans, travestis, trans, massagistas trans, garotas trans, classificados',
    citySeoTitle: (city, uf) =>
      `Travestis e acompanhantes trans em ${city} (${uf}) · Prazer.Vip`,
    citySeoDescription: (city, uf, n) => {
      const q = n === 1 ? 'Um perfil' : `${n} perfis`
      return clip(
        `[18+] ${q} de travestis e acompanhantes trans em ${city} (${uf}): discrição, fotos e contato direto. Veja quem está na cidade no Prazer.Vip.`,
      )
    },
    cityH1: (city) => `Travestis e acompanhantes trans em ${city}`,
    cityIntro: (city, uf) =>
      `Buscando travesti ou acompanhante trans em ${city} (${uf})? Perfis verificados, filtro por massagista ou acompanhante e conversa direta no Prazer.Vip.`,
    hubTitle: 'Travestis e acompanhantes trans por cidade · Prazer.Vip',
    hubSubheading: 'Travestis e acompanhantes trans — encontre perfis por região, estado e cidade.',
    hubDescription: clip(
      '[18+] Travestis, acompanhantes trans e massagistas trans em todo o Brasil. Escolha estado e cidade e veja anúncios no Prazer.Vip.',
    ),
    stateSeoTitle: (stateName, uf) =>
      `Travestis e acompanhantes trans em ${stateName} (${uf}) — cidades · Prazer.Vip`,
    stateSeoDescription: (stateName, uf) =>
      clip(
        `[18+] Cidades de ${stateName} (${uf}) com travestis e acompanhantes trans. Abra a cidade desejada no Prazer.Vip.`,
      ),
    regionSeoTitle: (region) =>
      `Travestis e acompanhantes trans — região ${region} · Prazer.Vip`,
    regionSeoDescription: (region) =>
      clip(
        `[18+] Região ${region}: estados e cidades com travestis e acompanhantes trans. Navegue por UF no Prazer.Vip.`,
      ),
  },
}

export function exploreSeoPack(gender: string): (typeof PACK)[ExploreGenderSlug] | null {
  if (gender === 'homens' || gender === 'mulheres' || gender === 'trans') {
    return PACK[gender]
  }
  return null
}

export function cityListSeoTitle(cityName: string, stateUf: string, gender: string): string {
  const p = exploreSeoPack(gender)
  const uf = stateUf.toUpperCase()
  if (!p) {
    return `${cityName} (${uf}) · Prazer.Vip`
  }
  return p.citySeoTitle(cityName, uf)
}

export function cityListSeoDescription(
  cityName: string,
  stateUf: string,
  gender: string,
  profileCount: number,
): string {
  const p = exploreSeoPack(gender)
  const uf = stateUf.toUpperCase()
  if (!p) {
    return `${profileCount} perfis em ${cityName}, ${uf}. Prazer.Vip — maiores de 18.`
  }
  return p.citySeoDescription(cityName, uf, profileCount)
}

export function cityListPageH1(cityName: string, gender: string): string {
  const p = exploreSeoPack(gender)
  if (!p) {
    return cityName
  }
  return p.cityH1(cityName)
}

export function cityListSeoIntro(cityName: string, stateUf: string, gender: string): string {
  const p = exploreSeoPack(gender)
  const uf = stateUf.toUpperCase()
  if (!p) {
    return `Perfis em ${cityName} (${uf}) no Prazer.Vip.`
  }
  return p.cityIntro(cityName, uf)
}

export function exploreHubSeoTitle(): string {
  return 'Acompanhantes, garotas e garotos de programa por cidade | Prazer.Vip'
}

export function exploreHubSeoDescription(): string {
  return clip(
    '[18+] Mulheres, homens e trans: massagistas, acompanhantes e programas por cidade. Links diretos para capitais em destaque — Salvador, Fortaleza, São Paulo e mais no Prazer.Vip.',
  )
}

export function genderHubSeoTitle(gender: string): string {
  return exploreSeoPack(gender)?.hubTitle ?? 'Explorar · Prazer.Vip'
}

export function genderHubSeoDescription(gender: string): string {
  return exploreSeoPack(gender)?.hubDescription ?? 'Explorar cidades no Prazer.Vip.'
}

export function genderHubVisibleSubheading(gender: string): string {
  return exploreSeoPack(gender)?.hubSubheading ?? 'Escolha região e cidade.'
}

export function stateListSeoTitle(stateName: string, stateUf: string, gender: string): string {
  const p = exploreSeoPack(gender)
  const uf = stateUf.toUpperCase()
  if (!p) {
    return `Cidades em ${stateName} (${uf}) · Prazer.Vip`
  }
  return p.stateSeoTitle(stateName, uf)
}

export function stateListSeoDescription(stateName: string, stateUf: string, gender: string): string {
  const p = exploreSeoPack(gender)
  const uf = stateUf.toUpperCase()
  if (!p) {
    return `Cidades em ${stateName} (${uf}) no Prazer.Vip.`
  }
  return p.stateSeoDescription(stateName, uf)
}

export function metaKeywordsForGender(gender: string): string {
  return exploreSeoPack(gender)?.metaKeywords ?? ''
}

export const exploreHubMetaKeywords =
  'acompanhantes masculinos, acompanhantes femininas, garotas de programa, garotos de programa, trans, travestis, massagistas, por cidade, Salvador, Fortaleza, São Paulo, Brasil, classificados'

export function regionListSeoTitle(regionDisplayName: string, gender: string): string {
  const p = exploreSeoPack(gender)
  if (!p) {
    return `${regionDisplayName} · Prazer.Vip`
  }
  return p.regionSeoTitle(regionDisplayName)
}

export function regionListSeoDescription(regionDisplayName: string, gender: string): string {
  const p = exploreSeoPack(gender)
  if (!p) {
    return `Região ${regionDisplayName} no Prazer.Vip.`
  }
  return p.regionSeoDescription(regionDisplayName)
}
