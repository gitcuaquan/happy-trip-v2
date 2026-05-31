<template>
  <!-- Announcements Ticker (non-critical, fail silently) -->
  <DriverAnnouncements :announcements="announcements" />

  <!-- Hero Section -->
  <DriverHero />

  <!-- Benefits Section -->
  <DriverBenefits />

  <!-- Requirements Section -->
  <DriverRequirements />

  <!-- Footer CTA -->
  <DriverFooterCta />
</template>

<script setup lang="ts">
import type { Announcement } from '~/type'

definePageMeta({
  layout: 'default'
})

const announcements = ref<Announcement[]>([])
</script>
