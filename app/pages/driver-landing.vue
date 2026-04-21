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


// Services
const driverService = useDriverService()

//  State
const announcements = ref<Announcement[]>([])
const isLoadingAnnouncements = ref(false)

// Fetch announcements (non-critical, fail silently)
const fetchAnnouncements = async () => {
  isLoadingAnnouncements.value = true
  try {
    announcements.value = await driverService.getAnnouncements()
  } catch (error) {
    // Fail silently - không throw error
    console.warn('Announcements fetch failed:', error)
    announcements.value = []
  } finally {
    isLoadingAnnouncements.value = false
  }
}

//  Lifecycle
onMounted(() => {
  fetchAnnouncements()
})
</script>
