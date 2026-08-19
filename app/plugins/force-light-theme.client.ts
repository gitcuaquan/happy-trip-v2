// Ép toàn bộ app dùng light theme. Chạy sớm ở client để override mọi
// preference cũ trong localStorage / system preference.
export default defineNuxtPlugin(() => {
  try {
    localStorage.setItem('nuxt-color-mode', 'light')
  } catch {
    // localStorage có thể không khả dụng (private mode) — bỏ qua
  }

  const colorMode = useColorMode()
  colorMode.preference = 'light'
})
