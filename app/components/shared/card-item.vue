<template>
  <div class="group p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100
           dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1
           transition-all duration-300">
    <div v-if="item.icon" class="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl w-fit
              transition-colors duration-300">
      <UIcon :name="item.icon"
        class="size-6 sm:size-7 text-primary  transition-colors duration-300" />
    </div>
    <h3 class="font-bold text-slate-900 dark:text-white text-base sm:text-lg mb-2 sm:mb-3">
      {{ item.title }}
    </h3>
    <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
      {{ item.description }}
    </p>
  </div>
</template>

<script setup lang="ts">
export interface CardItem {
  icon?: string
  title: string
  description: string
}

defineProps<{ item: CardItem }>()
</script>