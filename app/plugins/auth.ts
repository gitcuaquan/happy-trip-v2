export default defineNuxtPlugin(async () => {
  const token = useCookie('ht_token')
  const { syncMe } = useAuth()

  if (token.value) {
    await syncMe()
  }
})