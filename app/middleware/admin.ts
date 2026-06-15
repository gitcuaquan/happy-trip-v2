export default defineNuxtRouteMiddleware((to) => {
  // Bỏ qua page login
  if (to.path === '/admin/login') return

  const token = useCookie('ht_admin_token')
  if (!token.value) {
    return navigateTo('/admin/login')
  }
})
