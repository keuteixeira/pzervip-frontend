/**
 * Microsoft Clarity — snippet oficial (https://learn.microsoft.com/clarity/).
 * Configura NUXT_PUBLIC_CLARITY_PROJECT_ID (ex.: w7zhnpwtuq). Não há pacote npm oficial;
 * pacotes de terceiros só encapsulam o mesmo script.
 *
 * - Não injeta o script enquanto a rota for `/admin` (entrada direta no painel).
 * - Se o utilizador veio do site público e entra no admin: `clarity('consent', false)`
 *   (para de gravar / cookies até nova consent — Learn MS).
 * - Ao sair do admin para o site público: `clarity('consent')` para voltar a permitir tracking.
 */
import { isAdminSitePath } from '~/utils/admin-route'

declare global {
  interface Window {
    /** Microsoft Clarity — https://learn.microsoft.com/clarity/setup-and-installation/clarity-api */
    clarity?: (...args: unknown[]) => void
  }
}

export default defineNuxtPlugin(() => {
  const id = String(useRuntimeConfig().public.clarityProjectId || '').trim()
  if (!id || !import.meta.client) {
    return
  }

  function inject() {
    if (document.querySelector(`script[data-prazervip-clarity="${id}"]`)) {
      return
    }

    const inline = document.createElement('script')
    inline.setAttribute('data-prazervip-clarity', id)
    inline.type = 'text/javascript'
    const safe = JSON.stringify(id)
    inline.textContent = `(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", ${safe});`
    document.head.appendChild(inline)
  }

  const router = useRouter()

  function tryInject(path: string) {
    if (isAdminSitePath(path)) {
      return
    }
    inject()
  }

  function syncClarityConsentForRoute(toPath: string, fromPath: string) {
    const c = window.clarity
    if (typeof c !== 'function') {
      return
    }
    const toAdmin = isAdminSitePath(toPath)
    const fromAdmin = isAdminSitePath(fromPath)
    try {
      if (toAdmin && !fromAdmin) {
        c('consent', false)
      } else if (!toAdmin && fromAdmin) {
        c('consent')
      }
    } catch {
      /* Clarity indisponível ou API alterada */
    }
  }

  tryInject(router.currentRoute.value.path)
  router.afterEach((to, from) => {
    syncClarityConsentForRoute(to.path, from.path)
    tryInject(to.path)
  })
})
