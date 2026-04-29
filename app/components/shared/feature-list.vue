<template>
  <div class="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
    <div class="shrink-0 w-7 h-7 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
      <UIcon name="i-lucide-check" class="size-4 text-primary" />
    </div>
    <span class="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug">
      {{ feature }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ feature: string }>()
</script>