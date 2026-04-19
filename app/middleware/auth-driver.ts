export default defineNuxtRouteMiddleware((to) => {
  const driverToken = useCookie('driver_token')

  // Tạo fake token để test
  if (!driverToken.value) {
    driverToken.value = 'test_token_' + Date.now()
  }
})