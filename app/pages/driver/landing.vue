<template>
  <!-- Announcements Ticker (non-critical, fail silently) -->
  <DriverAnnouncements :announcements="announcements" />

  <!-- Hero Section -->
  <DriverHero />

  <!-- Benefits Section -->
  <DriverBenefits />

  <!-- Requirements Section -->
  <DriverRequirements />

  <!-- Register Form -->
  <!-- Footer CTA -->
  <DriverFooterCta />
</template>

<script setup lang="ts">
import { useDriverService } from '~/services/driver.service'
import type { Announcement } from '~/type'

definePageMeta({
  layout: 'default'
})

const driverService = useDriverService()
const announcements = ref<Announcement[]>([])
const isLoadingAnnouncements = ref(false)

const fetchAnnouncements = async () => {
  isLoadingAnnouncements.value = true
  try {
    announcements.value = await driverService.getAnnouncements()
  }
  catch (error) {
    console.warn('Announcements fetch failed:', error)
    announcements.value = []
  }
  finally {
    isLoadingAnnouncements.value = false
  }
}

onMounted(() => {
  fetchAnnouncements()
})
</script>
