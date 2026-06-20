<template>
  <div class="bg-gray-900 hidden md:block p-2">
    <UContainer>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2 text-[12px] text-white">
          <UIcon name="i-lucide-mail" />
          HAPPYTRIPEXPRESS@GMAIL.COM
        </div>
        <div class="flex items-center gap-2 text-[12px] text-white">
          <UIcon name="i-lucide-phone" />
          HOTLINE: 0972 97 0000
        </div>
      </div>
    </UContainer>
  </div>
  <UHeader mode="drawer">
    <template #left>
      <AppLogo class="w-auto h-6 shrink-0" />
    </template>
    <UNavigationMenu :items="items" variant="link" :ui="{
      linkLabel: 'font-bold text-gray-900 hover:text-primary transition-colors duration-300 hover:border-b-2 hover:border-primary border-transparent border-b-2',
      list: 'gap-10',
    }" class="uppercase" />
    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
    <template #right>
      <ClientOnly>
        <!-- Admin đã login -->
        <template v-if="isAdmin">
          <UDropdownMenu :items="adminMenuItems">
            <UButton variant="ghost"
              class="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors">
              <UBadge label="Admin" color="primary" variant="subtle" size="md" />
              <span class="text-sm font-semibold text-gray-800 dark:text-white max-w-28 truncate">
                {{ getAdmin?.full_name || getAdmin?.phone }}
              </span>
              <UIcon name="i-lucide-chevron-down" class="size-3.5 text-muted shrink-0" />
            </UButton>
          </UDropdownMenu>
        </template>

        <!-- Customer đã login -->
        <template v-else-if="isLoggedIn">
          <UDropdownMenu :items="menuItems">
            <UButton variant="ghost"
              class="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors">
              <div class="relative w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                <span class="text-xs font-bold text-primary uppercase leading-none">
                  {{ getCustomer?.full_name?.charAt(0) ?? '?' }}
                </span>
                <span
                  v-if="needCreatePassword"
                  class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white"
                  title="Tài khoản chưa có mật khẩu"
                />
              </div>
              <span class="text-sm font-semibold text-gray-800 dark:text-white max-w-24 truncate">
                {{ getCustomer?.phone }}
              </span>
              <UIcon name="i-lucide-chevron-down" class="size-3.5 text-muted shrink-0" />
            </UButton>
          </UDropdownMenu>
        </template>

        <!-- Chưa login -->
        <template v-else>
          <UButton to="/login" label="Đăng nhập" icon="i-lucide-user" color="primary" variant="solid" size="xs"
            class="rounded-full uppercase font-bold text-xs tracking-wide py-2.5 lg:px-5" />
        </template>
      </ClientOnly>
    </template>
  </UHeader>

  <ClientOnly>
    <SharedCreatePasswordModal v-if="isLoggedIn" v-model="showCreatePwd" />
  </ClientOnly>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from "@nuxt/ui";

const { isLoggedIn, isAdmin, getCustomer, getAdmin, logOut, logOutAdmin } = useAuth()

const showCreatePwd = ref(false)
const needCreatePassword = computed(() => isLoggedIn.value && getCustomer.value?.has_password === false)

const menuItems = computed(() => {
  const groups: any[] = [
    [
      {
        label: 'Chuyến xe của tôi',
        icon: 'i-lucide-package',
        onSelect: () => navigateTo('/history')
      }
    ],
  ]
  if (needCreatePassword.value) {
    groups.push([
      {
        label: 'Tạo mật khẩu',
        icon: 'i-lucide-key-round',
        onSelect: () => { showCreatePwd.value = true }
      }
    ])
  }
  groups.push([
    {
      label: 'Đăng xuất',
      icon: 'i-lucide-log-out',
      color: 'error' as const,
      onSelect: logOut
    }
  ])
  return groups
})

const adminMenuItems = computed(() => [
  [
    {
      label: 'Quản lý bài viết',
      icon: 'i-lucide-file-text',
      onSelect: () => navigateTo('/admin/blog/')
    }
  ],
  [
    {
      label: 'Đăng xuất',
      icon: 'i-lucide-log-out',
      color: 'error' as const,
      onSelect: logOutAdmin
    }
  ]
])

const items = computed<NavigationMenuItem[]>(() => {
  const all: NavigationMenuItem[] = [
    {
      label: "Đặt xe",
      to: "/",
    },
    {
      label: "Tài xế",
      to: '/driver',
    },
    {
      label: "Chính sách",
      to: "/policy",
    },
    {
      label: "Về chúng tôi",
      to: "/introduce",
    },
    {
      label: "Liên hệ",
      to: "/contact",
    },
  ]
  return isAdmin.value ? all.filter(i => i.label !== 'Đặt xe') : all
});
</script>

<style></style>
