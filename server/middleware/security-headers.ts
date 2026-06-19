export default defineEventHandler((event) => {
  const url = getRequestURL(event).pathname

  if (url.startsWith('/images/') || url.startsWith('/favicon/') || url.startsWith('/_nuxt/')) {
    setHeader(event, 'cache-control', 'public, max-age=31536000, immutable')
  }

  if (url.startsWith('/uploads/')) {
    setHeader(event, 'cache-control', 'public, max-age=86400, stale-while-revalidate=604800')
  }

  setHeader(event, 'strict-transport-security', 'max-age=31536000; includeSubDomains; preload')
  setHeader(event, 'x-content-type-options', 'nosniff')
  setHeader(event, 'x-frame-options', 'DENY')
  setHeader(event, 'referrer-policy', 'strict-origin-when-cross-origin')
})
