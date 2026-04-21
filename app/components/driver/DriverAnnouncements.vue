<template>
  <div v-if="announcements.length > 0" class="bg-blue-50 border-b border-blue-200">
    <UContainer class="py-3">
      <div class="flex items-center gap-3 overflow-x-auto pb-2">
        <UIcon name="i-lucide-bell" class="w-5 h-5 text-blue-600 flex-shrink-0" />
        
        <div class="flex gap-6 overflow-x-auto">
          <div
            v-for="announcement in announcements"
            :key="announcement.id"
            class="text-sm text-blue-800 font-medium whitespace-nowrap flex-shrink-0"
          >
            {{ announcement.title }}
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { Announcement } from '~/type'

interface Props {
  announcements?: Announcement[]
}

withDefaults(defineProps<Props>(), {
  announcements: () => []
})
</script>
