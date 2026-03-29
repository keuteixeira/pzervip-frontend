export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return
  }
  const { fetchMe, user } = useAuth()
  await fetchMe()
  if (user.value?.role !== 'admin') {
    return navigateTo('/login')
  }
})
