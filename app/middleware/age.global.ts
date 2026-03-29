export default defineNuxtRouteMiddleware((to) => {
  const { isAgeConfirmed } = useAgeGate()

  if (to.path === '/') {
    if (isAgeConfirmed()) {
      return navigateTo('/explorar')
    }
    return
  }

  const allowWithoutAge =
    to.path.startsWith('/login') ||
    to.path.startsWith('/auth') ||
    to.path.startsWith('/cadastro') ||
    to.path.startsWith('/admin') ||
    to.path === '/contato' ||
    to.path === '/politica-de-privacidade' ||
    to.path === '/termos-de-servico' ||
    to.path === '/sobre-nos' ||
    to.path === '/anunciar'

  if (allowWithoutAge) {
    return
  }

  if (to.path.startsWith('/explorar') && !isAgeConfirmed()) {
    return navigateTo('/')
  }
})
