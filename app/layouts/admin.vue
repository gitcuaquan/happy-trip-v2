<template>
  <div class="min-h-screen bg-slate-50">
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30">
      <UContainer class="flex items-center justify-between py-3">
        <div class="flex items-center gap-3">
          <AppLogo class="h-8 w-auto" />
          <UBadge label="Admin" color="primary" variant="subtle" size="md" />
        </div>

        <ClientOnly>
          <UDropdownMenu :items="menuItems">
            <UButton variant="ghost"
              class="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors">
              <div class="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                <span class="text-xs font-bold text-primary uppercase leading-none">
                  {{ getAdmin?.full_name?.charAt(0) ?? 'A' }}
                </span>
              </div>
              <span class="text-sm font-semibold text-gray-800 max-w-32 truncate">
                {{ getAdmin?.full_name || getAdmin?.phone || 'Admin' }}
              </span>
              <UIcon name="i-lucide-chevron-down" class="size-3.5 text-muted shrink-0" />
            </UButton>
          </UDropdownMenu>
        </ClientOnly>
      </UContainer>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>

<script lang="ts" setup>
const { getAdmin, logOutAdmin } = useAuth()

const menuItems = computed(() => [
  [
    {
      label: 'Quản lý bài viết',
      icon: 'i-lucide-file-text',
      onSelect: () => navigateTo('/admin/quan-ly/blog'),
    },
  ],
  [
    {
      label: 'Về trang chủ',
      icon: 'i-lucide-home',
      onSelect: () => navigateTo('/'),
    },
  ],
  [
    {
      label: 'Đăng xuất',
      icon: 'i-lucide-log-out',
      color: 'error' as const,
      onSelect: logOutAdmin,
    },
  ],
])
</script>
