/**
 * Microsoft Clarity — snippet oficial (https://learn.microsoft.com/clarity/).
 * Configura NUXT_PUBLIC_CLARITY_PROJECT_ID (ex.: w7zhnpwtuq). Não há pacote npm oficial;
 * pacotes de terceiros só encapsulam o mesmo script.
 */
export default defineNuxtPlugin(() => {
  const id = String(useRuntimeConfig().public.clarityProjectId || '').trim()
  if (!id || !import.meta.client) {
    return
  }
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
})
