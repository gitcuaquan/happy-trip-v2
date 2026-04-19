<!-- layouts/driver.vue -->
<template>
  <div class="min-h-dvh bg-slate-100 flex items-center justify-center">
    <div
      class="
        relative w-full min-h-dvh bg-white flex flex-col overflow-hidden
        sm:max-w-107.5 sm:min-h-0 sm:rounded-3xl sm:shadow-2xl sm:my-8
      "
    >
      <slot />
    </div>
  </div>
</template>
