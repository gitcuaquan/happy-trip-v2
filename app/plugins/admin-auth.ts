export default defineNuxtPlugin(async () => {
  const token = useCookie('ht_admin_token')
  const { syncAdminMe } = useAdminAuth()

  if (token.value) {
    await syncAdminMe()
  }
})
