<script setup lang="ts">
import { getFromRoute, getToRoute } from '~/utils/routes'

const route = useRoute()

const fromSlug = route.params.from as string
const toSlug = route.params.to as string

const from = getFromRoute(fromSlug)
const to = getToRoute(toSlug)

if (!from || !to) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Tuyến không tồn tại'
  })
}

const canonicalSlug = from.canonical || from.slug

useSeoMeta({
  title: `Xe riêng ${from.name} đi ${to.name} - Happy Trip`,
  description: `Đặt xe riêng ${from.name} đi ${to.name} - Happy Trip`
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: `https://happytrip.vn/xe-rieng-${canonicalSlug}-di-${to.slug}`
    }
  ]
})
useSchemaOrg([
  defineWebPage({
    name: `Xe riêng ${from.name} đi ${to.name}`
  }),

  {
    '@type': 'Service',
    name: `Xe riêng ${from.name} đi ${to.name}`,
    provider: {
      '@type': 'Organization',
      name: 'Happy Trip'
    }
  }
])
</script>

<template>
  <div>
    <h1>
      Xe riêng {{ from.name }} đi {{ to.name }}
    </h1>
  </div>
</template>