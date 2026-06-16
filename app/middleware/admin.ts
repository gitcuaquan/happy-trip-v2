export default defineNuxtRouteMiddleware((to) => {
  const { isAdmin } = useAuth()
  if (!isAdmin.value && to.path !== '/admin/login') {
    return navigateTo('/admin/login')
  }
})
