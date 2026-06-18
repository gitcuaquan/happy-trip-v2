<script setup lang="ts">
import { uploadService } from '~/services/upload.service'

const imageUrl = ref('')

const onUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement)
    .files?.[0]

  if (!file) return

  try {
    const result = await uploadService.upload(file)

    imageUrl.value = result.url
  } catch (error) {
    console.error(error)
  }
}

const onDelete = async () => {
  if (!imageUrl.value) return

  try {
    await uploadService.remove(imageUrl.value)

    imageUrl.value = ''
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <input
    type="file"
    @change="onUpload"
  >

  <img
    v-if="imageUrl"
    :src="imageUrl"
    width="200"
  >

  <button
    v-if="imageUrl"
    @click="onDelete"
  >
    Delete
  </button>
</template>