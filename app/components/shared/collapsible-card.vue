<template>
  <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
    <UCollapsible 
      v-for="(item, index) in items" 
      :key="item.label" 
      :open="openIndex === index"
      :unmount-on-hide="false" 
      class="border-b border-slate-100 last:border-0"
      :class="openIndex === index ? 'bg-orange-50/50' : 'bg-transparent'" 
      @update:open="toggleAccordion(index)"
    >
      <button
        class="w-full flex justify-between items-center py-5 px-6 text-left focus:outline-none hover:bg-orange-50/30 transition-colors"
      >
        <span 
          class="text-lg font-bold transition-colors"
          :class="openIndex === index ? 'text-primary' : 'text-slate-700'"
        >
          {{ item.label }}
        </span>
        <UIcon 
          name="i-lucide-chevron-down" 
          class="w-5 h-5 transition-transform duration-300"
          :class="openIndex === index ? 'rotate-180 text-primary' : 'text-slate-400'" 
        />
      </button>

      <template #content>
        <div class="px-6 py-4 text-slate-600 leading-relaxed">
          {{ item.content }}
        </div>
      </template>
    </UCollapsible>
  </div>
</template>

<script setup lang="ts">
interface Item {
  label: string
  content: string
}

interface Props {
  items: Item[]
}

const props = defineProps<Props>()

const openIndex = ref(0)

const toggleAccordion = (index: number) => {
  openIndex.value = openIndex.value === index ? -1 : index
}
</script>

<style scoped></style>
