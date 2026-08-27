<template>
  <!-- Top Bar: Hotline & Contact Info -->
  <div class="bg-slate-900 hidden md:block py-2 text-xs border-b border-slate-800">
    <UContainer>
      <div class="flex justify-between items-center text-slate-300">
        <div class="flex items-center gap-4">
          <a href="mailto:happytripexpress@gmail.com" class="flex items-center gap-1.5 hover:text-primary transition-colors">
            <UIcon name="i-lucide-mail" class="size-3.5 text-primary" />
            <span>HAPPYTRIPEXPRESS@GMAIL.COM</span>
          </a>
          <span class="text-slate-700">|</span>
          <span class="flex items-center gap-1.5 text-slate-400">
            <UIcon name="i-lucide-shield-check" class="size-3.5 text-emerald-400" />
            Nền tảng đặt xe riêng 100% không ghép
          </span>
        </div>
        <div class="flex items-center gap-4">
          <a href="tel:0972970000" class="flex items-center gap-1.5 font-bold text-white hover:text-primary transition-colors">
            <UIcon name="i-lucide-phone-call" class="size-3.5 text-primary animate-pulse" />
            HOTLINE 24/7: 0972 97 0000
          </a>
        </div>
      </div>
    </UContainer>
  </div>

  <!-- Main Navigation Header with Nuxt UI NavigationMenu -->
  <UHeader mode="drawer" class="border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md sticky top-0 z-40">
    <template #left>
      <div class="flex items-center gap-2">
        <AppLogo class="w-auto h-7 sm:h-8 shrink-0" />
      </div>
    </template>

    <!-- Desktop Navigation Menu using Nuxt UI UNavigationMenu with Slots -->
    <UNavigationMenu
      :items="items"
      variant="link"
      :ui="{
        list: 'gap-3 xl:gap-6',
        link: 'font-bold uppercase tracking-wide text-sm xl:text-[15px] text-slate-800 dark:text-slate-200 hover:text-primary transition-colors duration-200 py-2',
        viewport: 'shadow-2xl rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden',
        content: 'overflow-hidden max-h-none',
        viewportWrapper: 'justify-center',
      }"
    >
      <!-- Custom Content Slot for "Dịch Vụ Xe Riêng" (2-column balanced layout) -->
      <template #services-content>
        <div class="p-5 w-[680px] max-w-[92vw] bg-white dark:bg-slate-900 text-left grid grid-cols-12 gap-5 overflow-hidden">
          <!-- Left Column (7 cols): 4 Services -->
          <div class="col-span-7 space-y-1.5">
            <div class="px-2 py-1 mb-1.5 border-b border-slate-100 dark:border-slate-800">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Phân loại dòng xe</span>
            </div>

            <NuxtLink
              v-for="service in privateCarServices"
              :key="service.label"
              :to="service.to"
              class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors group"
            >
              <div class="w-8 h-8 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors shrink-0 mt-0.5">
                <UIcon :name="service.icon" class="size-4.5" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                    {{ service.label }}
                  </span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 leading-relaxed">
                  {{ service.description }}
                </p>
              </div>
            </NuxtLink>
          </div>

          <!-- Right Column (5 cols): Highlight Commitment Card -->
          <div class="col-span-5 flex flex-col justify-between p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-inner">
            <div class="space-y-2.5">
              <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/30">
                <UIcon name="i-lucide-sparkles" class="size-3.5" />
                <span>Happy Trip Cam Kết</span>
              </div>
              <h4 class="text-sm font-bold text-white leading-snug">
                Xe Riêng Chuẩn 5 Sao Đi Tỉnh & Sân Bay
              </h4>
              <ul class="space-y-1.5 text-xs text-slate-300">
                <li class="flex items-center gap-2">
                  <UIcon name="i-lucide-check-circle" class="size-4 text-emerald-400 shrink-0" />
                  <span>100% Không đón khách dọc đường</span>
                </li>
                <li class="flex items-center gap-2">
                  <UIcon name="i-lucide-check-circle" class="size-4 text-emerald-400 shrink-0" />
                  <span>Đón tận ngõ, trả tận cửa</span>
                </li>
                <li class="flex items-center gap-2">
                  <UIcon name="i-lucide-check-circle" class="size-4 text-emerald-400 shrink-0" />
                  <span>Giá trọn gói 0đ phụ phí</span>
                </li>
              </ul>
            </div>

            <a
              href="tel:0972970000"
              class="mt-3 flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-sm shadow-md transition-colors"
            >
              <UIcon name="i-lucide-phone-call" class="size-4" />
              <span>Gọi 0972 97 0000</span>
            </a>
          </div>
        </div>
      </template>

      <!-- Custom Content Slot for "Mega Menu Tuyến Đi Tỉnh 2 Chiều" -->
      <template #routes-content>
        <div class="p-6 w-[960px] max-w-[94vw] bg-white dark:bg-slate-900 space-y-4 text-left overflow-hidden">
          <!-- Mega Menu Top Header -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2.5">
              <UIcon name="i-lucide-route" class="size-6 text-primary shrink-0" />
              <div>
                <h4 class="text-sm font-bold text-slate-900 dark:text-white">
                  {{ bannerTop.title }}
                </h4>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  {{ bannerTop.subtitle }}
                </p>
              </div>
            </div>
            <UButton
              :to="bannerTop.cta_link"
              variant="ghost"
              color="primary"
              size="sm"
              trailing-icon="i-lucide-arrow-right"
              class="font-semibold text-xs py-1"
            >
              {{ bannerTop.cta_text }}
            </UButton>
          </div>

          <!-- Multi-Columns Grid -->
          <div
            class="grid gap-4"
            :class="dynamicMegaColumns.length <= 4 ? 'grid-cols-4' : 'grid-cols-4'"
          >
            <div
              v-for="col in dynamicMegaColumns"
              :key="col.title"
              class="space-y-2.5"
            >
              <!-- Column Title -->
              <div class="flex items-center gap-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                <UIcon :name="col.icon || 'i-lucide-route'" class="size-4 text-primary shrink-0" />
                <span class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide truncate">
                  {{ col.title }}
                </span>
              </div>

              <!-- Route / Article Items -->
              <div class="space-y-1">
                <NuxtLink
                  v-for="item in col.routes"
                  :key="item.link || item.slug"
                  :to="item.link ? (item.link.startsWith('/') ? item.link : `/${item.link}`) : `/${item.slug}`"
                  class="group flex flex-col p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors duration-150"
                >
                  <div class="flex items-start justify-between gap-1 text-xs xl:text-[13px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary leading-snug">
                    <span class="line-clamp-2">{{ item.name }}</span>
                    <UIcon name="i-lucide-arrow-up-right" class="size-3.5 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 mt-0.5" />
                  </div>
                  <span v-if="item.desc" class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {{ item.desc }}
                  </span>
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Mega Menu Footer Bar -->
          <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div class="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <template v-for="(txt, idx) in footerBar.items" :key="idx">
                <span class="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <UIcon name="i-lucide-check-circle-2" class="size-4 text-emerald-500" />
                  {{ txt }}
                </span>
                <span v-if="idx < footerBar.items.length - 1">•</span>
              </template>
            </div>
            <a
              :href="`tel:${(footerBar.hotline || '0972970000').replace(/\\s/g, '')}`"
              class="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <UIcon name="i-lucide-phone" class="size-3.5" />
              Tổng đài 24/7: {{ footerBar.hotline }}
            </a>
          </div>
        </div>
      </template>
    </UNavigationMenu>

    <!-- Mobile Navigation Drawer Body (UNavigationMenu in Vertical Mode) -->
    <template #body>
      <div class="space-y-4 py-2">
        <UNavigationMenu
          :items="items"
          orientation="vertical"
          class="-mx-2.5"
          :ui="{
            link: 'text-sm font-bold py-2.5',
            childLink: 'text-sm font-medium py-2',
            childLinkLabel: 'text-sm font-bold',
            childLinkDescription: 'text-xs text-slate-500',
          }"
        />

        <!-- Hotline Card in Mobile Drawer -->
        <div class="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-2 mt-6">
          <div class="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <UIcon name="i-lucide-headset" class="size-4 text-primary" />
            <span>Tổng đài hỗ trợ 24/7</span>
          </div>
          <a
            href="tel:0972970000"
            class="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-white font-black text-base tracking-wide shadow-md shadow-primary/30"
          >
            <UIcon name="i-lucide-phone-call" class="size-5 animate-bounce" />
            0972 97 0000
          </a>
        </div>
      </div>
    </template>

    <!-- Right Slot: User Login / Admin Profile -->
    <template #right>
      <ClientOnly>
        <!-- Admin đã login -->
        <template v-if="isAdmin">
          <UDropdownMenu :items="adminMenuItems">
            <UButton
              variant="ghost"
              class="flex items-center gap-2 px-3.5 py-2 rounded-full hover:bg-primary/10 transition-colors"
            >
              <UBadge label="Admin" color="primary" variant="subtle" size="md" />
              <span class="text-sm font-bold text-gray-800 dark:text-white max-w-28 truncate">
                {{ getAdmin?.full_name || getAdmin?.phone }}
              </span>
              <UIcon name="i-lucide-chevron-down" class="size-4 text-muted shrink-0" />
            </UButton>
          </UDropdownMenu>
        </template>

        <!-- Customer đã login -->
        <template v-else-if="isLoggedIn">
          <UDropdownMenu :items="menuItems">
            <UButton
              variant="ghost"
              class="flex items-center gap-2 px-3.5 py-2 rounded-full hover:bg-primary/10 transition-colors"
            >
              <div class="relative w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                <span class="text-sm font-bold text-primary uppercase leading-none">
                  {{ getCustomer?.full_name?.charAt(0) ?? '?' }}
                </span>
                <span
                  v-if="needCreatePassword"
                  class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white"
                  title="Tài khoản chưa có mật khẩu"
                />
              </div>
              <span class="text-sm font-bold text-gray-800 dark:text-white max-w-28 truncate">
                {{ getCustomer?.phone }}
              </span>
              <UIcon name="i-lucide-chevron-down" class="size-4 text-muted shrink-0" />
            </UButton>
          </UDropdownMenu>
        </template>

        <!-- Chưa login -->
        <template v-else>
          <UButton
            to="/login"
            label="Đăng nhập"
            icon="i-lucide-user"
            color="primary"
            variant="solid"
            size="sm"
            class="rounded-full uppercase font-bold text-xs xl:text-sm tracking-wide py-2 px-4 lg:px-5 shadow-sm hover:shadow-md transition-shadow"
          />
        </template>
      </ClientOnly>
    </template>
  </UHeader>

  <ClientOnly>
    <SharedCreatePasswordModal v-if="isLoggedIn" v-model="showCreatePwd" />
  </ClientOnly>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'
import { menuService } from '~/services/menu.service'
import type { MegaMenuData } from '~/type'

const { isLoggedIn, isAdmin, getCustomer, getAdmin, logOut, logOutAdmin } = useAuth()

const showCreatePwd = ref(false)
const needCreatePassword = computed(() => isLoggedIn.value && getCustomer.value?.has_password === false)

// Nạp dữ liệu Mega Menu Động từ CSDL (Non-blocking, không chặn render)
const { data: menuApiRes } = useLazyAsyncData('public-mega-menu-routes', () =>
  menuService.getPublicMenu('routes'),
  { default: () => null }
)

const megaMenuData = computed<MegaMenuData | null>(() => menuApiRes.value || null)

const bannerTop = computed(() => megaMenuData.value?.banner_top || {
  title: 'Thuê Xe Riêng Đi Tỉnh 2 Chiều & Sân Bay',
  subtitle: 'Đón trả tận nhà · Giá trọn gói minh bạch · Phục vụ 24/7',
  cta_text: 'Xem cam kết dịch vụ',
  cta_link: '/#dich-vu'
})

const footerBar = computed(() => megaMenuData.value?.footer_bar || {
  items: ['Bao trọn xe 100%', 'Đón đúng giờ hẹn', '0đ phụ phí ẩn'],
  hotline: '0972 97 0000'
})

// 1. Danh sách Dịch vụ xe riêng (Đã bỏ các badge không cần thiết)
const privateCarServices = [
  {
    label: 'Xe Riêng 5 Chỗ (Sedan)',
    description: 'Sedan đời mới êm ái, tối ưu chi phí 1-3 người',
    icon: 'i-lucide-car',
    to: '/#dich-vu-5-cho'
  },
  {
    label: 'Xe Riêng 7 Chỗ (MPV / SUV)',
    description: 'MPV / SUV rộng rãi, cốp lớn cho 4-6 người',
    icon: 'i-lucide-car-front',
    to: '/#dich-vu-7-cho'
  },
  {
    label: 'Xe Đưa Đón Sân Bay TSN',
    description: 'Đón tiễn đúng giờ bay Tân Sơn Nhất 24/7',
    icon: 'i-lucide-plane-takeoff',
    to: '/xe-rieng-tphcm-di-san-bay-tan-son-nhat'
  },
  {
    label: 'Xe Công Tác & Du Lịch',
    description: 'Thuê xe theo lịch trình / tour trọn gói',
    icon: 'i-lucide-briefcase',
    to: '/#dich-vu-cong-tac'
  }
]

// 2. Danh sách Tuyến xe đa cột Mega Menu (Fallback tĩnh nếu DB trống)
const fallbackMegaMenuColumns = [
  {
    title: 'Đưa Đón Sân Bay',
    icon: 'i-lucide-plane',
    routes: [
      {
        name: 'Sân bay TSN ⇄ Sài Gòn',
        slug: 'xe-rieng-tphcm-di-san-bay-tan-son-nhat',
        desc: 'Đón trả tận sảnh ga 24/7'
      },
      {
        name: 'Sân bay TSN ⇄ Vũng Tàu',
        slug: 'xe-rieng-vung-tau-di-san-bay-tan-son-nhat',
        desc: 'Cao tốc Long Thành êm ái',
        link: '/xe-rieng-vung-tau-di-san-bay-tan-son-nhat'
      }
    ]
  },
  {
    title: 'Miền Đông & Du Lịch',
    icon: 'i-lucide-palmtree',
    routes: [
      {
        name: 'Sài Gòn ⇄ Vũng Tàu / Hồ Tràm',
        slug: 'xe-rieng-tphcm-di-vung-tau',
        desc: 'Đón trả tận resort & khách sạn',
        link: '/xe-rieng-tphcm-di-vung-tau'
      },
      {
        name: 'Sài Gòn ⇄ Đồng Nai',
        slug: 'xe-rieng-tphcm-di-dong-nai',
        desc: 'Biên Hòa, Long Khánh, KCN',
        link: '/xe-rieng-tphcm-di-dong-nai'
      },
      {
        name: 'Sài Gòn ⇄ Tây Ninh',
        slug: 'xe-rieng-tphcm-di-tay-ninh',
        desc: 'Núi Bà Đen, Tòa Thánh',
        link: '/xe-rieng-tphcm-di-tay-ninh'
      },
      {
        name: 'Sài Gòn ⇄ Lâm Đồng (Đà Lạt)',
        slug: 'xe-rieng-tphcm-di-da-lat',
        desc: 'Du lịch nghỉ dưỡng phố núi',
        link: '/xe-rieng-tphcm-di-da-lat'
      },
      {
        name: 'Sài Gòn ⇄ Khánh Hòa (Nha Trang)',
        slug: 'xe-rieng-tphcm-di-nha-trang',
        desc: 'Cao tốc Bắc Nam liền mạch',
        link: '/xe-rieng-tphcm-di-nha-trang'
      }
    ]
  },
  {
    title: 'Miền Tây (ĐBSCL)',
    icon: 'i-lucide-waves',
    routes: [
      {
        name: 'Sài Gòn ⇄ Cần Thơ',
        slug: 'xe-rieng-tphcm-di-can-tho',
        desc: 'Thủ phủ miền Tây Nam Bộ',
        link: '/xe-rieng-tphcm-di-can-tho'
      },
      {
        name: 'Sài Gòn ⇄ An Giang',
        slug: 'xe-rieng-tphcm-di-an-giang',
        desc: 'Châu Đốc, Miếu Bà Chúa Xứ',
        link: '/xe-rieng-tphcm-di-an-giang'
      },
      {
        name: 'Sài Gòn ⇄ Đồng Tháp',
        slug: 'xe-rieng-tphcm-di-dong-thap',
        desc: 'Cao Lãnh, Làng hoa Sa Đéc',
        link: '/xe-rieng-tphcm-di-dong-thap'
      },
      {
        name: 'Sài Gòn ⇄ Vĩnh Long',
        slug: 'xe-rieng-tphcm-di-vinh-long',
        desc: 'Cầu Mỹ Thuận 2 nhanh chóng',
        link: '/xe-rieng-tphcm-di-vinh-long'
      },
      {
        name: 'Sài Gòn ⇄ Cà Mau',
        slug: 'xe-rieng-tphcm-di-ca-mau',
        desc: 'Đất Mũi, trọn gói khứ hồi',
        link: '/xe-rieng-tphcm-di-ca-mau'
      }
    ]
  },
  {
    title: 'Tây Nguyên',
    icon: 'i-lucide-mountain-snow',
    routes: [
      {
        name: 'Sài Gòn ⇄ Đắk Lắk',
        slug: 'xe-rieng-tphcm-di-dak-lak',
        desc: 'Buôn Ma Thuột thủ phủ cà phê',
        link: '/xe-rieng-tphcm-di-dak-lak'
      },
      {
        name: 'Sài Gòn ⇄ Gia Lai',
        slug: 'xe-rieng-tphcm-di-gia-lai',
        desc: 'Pleiku, Biển Hồ phố núi',
        link: '/xe-rieng-tphcm-di-gia-lai'
      }
    ]
  }
]

// Cột Mega Menu Động tính toán từ API CSDL
const dynamicMegaColumns = computed(() => {
  if (megaMenuData.value?.columns?.length) {
    return megaMenuData.value.columns.map(col => ({
      title: col.title,
      icon: col.icon || 'i-lucide-route',
      routes: (col.items || []).filter(item => item.is_active !== false).map(item => ({
        name: item.title,
        desc: item.description || '',
        slug: item.link.startsWith('/') ? item.link.substring(1) : item.link,
        link: item.link,
        item_type: item.item_type,
        badge: item.badge
      }))
    }))
  }
  return fallbackMegaMenuColumns
})

// 3. Khởi tạo menu items với slots và cấu trúc đa cấp cho Mobile
const items = computed<NavigationMenuItem[]>(() => {
  const all: NavigationMenuItem[] = [
    {
      label: 'Đặt Xe',
      to: '/',
    },
    {
      label: 'Dịch Vụ Xe Riêng',
      slot: 'services',
      children: privateCarServices
    },
    {
      label: 'Tuyến Đi Tỉnh 2 Chiều',
      slot: 'routes',
      children: dynamicMegaColumns.value.map(col => ({
        label: col.title,
        icon: col.icon,
        children: col.routes.map(r => ({
          label: r.name,
          description: r.desc,
          to: r.link ? (r.link.startsWith('/') ? r.link : `/${r.link}`) : `/${r.slug}`
        }))
      }))
    },
    {
      label: 'Tài Xế',
      to: '/driver'
    },
    {
      label: 'Cẩm Nang',
      to: '/blog'
    },
    {
      label: 'Chính Sách',
      to: '/policy'
    },
    {
      label: 'Về Chúng Tôi',
      to: '/introduce'
    },
    {
      label: 'Liên Hệ',
      to: '/contact'
    }
  ]

  return isAdmin.value ? all.filter(i => i.label !== 'Đặt Xe') : all
})

const menuItems = computed(() => {
  const groups: any[] = [
    [
      {
        label: 'Chuyến xe của tôi',
        icon: 'i-lucide-package',
        onSelect: () => { navigateTo('/history') }
      }
    ]
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
      onSelect: () => { logOut() }
    }
  ])
  return groups
})

const adminMenuItems = computed(() => [
  [
    {
      label: 'Quản lý bài viết',
      icon: 'i-lucide-file-text',
      onSelect: () => { navigateTo('/admin/blog/') }
    },
    {
      label: 'Quản lý Mega Menu',
      icon: 'i-lucide-layout-grid',
      onSelect: () => { navigateTo('/admin/menu/') }
    }
  ],
  [
    {
      label: 'Đăng xuất',
      icon: 'i-lucide-log-out',
      color: 'error' as const,
      onSelect: () => { logOutAdmin() }
    }
  ]
])
</script>
