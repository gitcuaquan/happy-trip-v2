<template>
  <UContainer class="py-6 space-y-6">
    <!-- Header Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <UButton
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          to="/admin/blog"
          aria-label="Quay lại"
        />
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Quản Lý Mega Menu
            </h1>
            <UBadge label="Header Nav" color="primary" variant="subtle" size="xs" class="font-bold" />
            <div
              v-if="isSyncing"
              class="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-semibold animate-pulse"
            >
              <UIcon name="i-lucide-loader-2" class="size-3.5 animate-spin" />
              <span>Đang tải...</span>
            </div>
          </div>
          <p class="text-xs text-muted mt-0.5">
            Tùy biến các cột tuyến xe, ghim bài viết cẩm nang và banner trên Menu Header
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <UButton
          variant="outline"
          color="neutral"
          icon="i-lucide-rotate-ccw"
          label="Khôi phục mặc định"
          :loading="resetting"
          @click="confirmReset"
        />
        <UButton
          color="primary"
          icon="i-lucide-save"
          label="Lưu Thay Đổi"
          class="font-bold shadow-md px-5"
          :loading="saving"
          @click="onSave"
        />
      </div>
    </div>

    <!-- Alert nếu phiên đăng nhập admin đã hết hạn -->
    <UAlert
      v-if="sessionExpired"
      color="warning"
      variant="subtle"
      icon="i-lucide-alert-triangle"
      title="Phiên đăng nhập Admin đã hết hạn"
      description="Bạn đang xem dữ liệu ở chế độ hiển thị công khai. Để chỉnh sửa và lưu thay đổi lên hệ thống, vui lòng đăng nhập lại."
      :actions="[
        {
          label: 'Đăng nhập lại ngay',
          color: 'primary',
          variant: 'solid',
          icon: 'i-lucide-log-in',
          to: '/admin/login?redirect=/admin/menu'
        }
      ]"
    />

    <!-- Main Content (Không bị block giao diện, luôn render trực tiếp) -->
    <div class="space-y-6">
      <!-- Section 1: Cấu hình Banner & Hotline (Luôn mở) -->
      <UCard class="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <template #header>
          <div class="flex items-center gap-2.5 py-0.5">
            <div class="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <UIcon name="i-lucide-sliders" class="size-4.5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">Cấu hình Banner trên & Chân Mega Menu</h3>
              <p class="text-xs text-muted">Hiển thị slogan, nút kêu gọi hành động (CTA) và số hotline</p>
            </div>
          </div>
        </template>

        <div class="space-y-4 pt-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Tiêu đề Banner trên" hint="Dòng chữ nổi bật trên cùng">
              <UInput
                v-model="menuData.banner_top.title"
                placeholder="VD: Thuê Xe Riêng Đi Tỉnh 2 Chiều & Sân Bay"
                icon="i-lucide-heading"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Phụ đề Banner trên" hint="Mô tả ngắn kèm cam kết">
              <UInput
                v-model="menuData.banner_top.subtitle"
                placeholder="VD: Đón trả tận nhà · Giá trọn gói minh bạch · Phục vụ 24/7"
                icon="i-lucide-subtitles"
                class="w-full"
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <UFormField label="Chữ nút liên kết (CTA)" hint="Nút xem cam kết">
              <UInput
                v-model="menuData.banner_top.cta_text"
                placeholder="VD: Xem cam kết dịch vụ"
                icon="i-lucide-mouse-pointer-click"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Đường dẫn CTA" hint="Link khi click vào nút">
              <UInput
                v-model="menuData.banner_top.cta_link"
                placeholder="VD: /#dich-vu"
                icon="i-lucide-link"
                class="w-full font-mono text-xs"
              />
            </UFormField>
            <UFormField label="Hotline chân menu" hint="Số điện thoại tổng đài">
              <UInput
                v-model="menuData.footer_bar.hotline"
                placeholder="VD: 0972 97 0000"
                icon="i-lucide-phone-call"
                class="w-full font-bold"
              />
            </UFormField>
          </div>
        </div>
      </UCard>

      <!-- Section 2: Quản lý các Cột Mega Menu -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <UIcon name="i-lucide-columns-3" class="size-4.5" />
          </div>
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">
              Danh sách Cột Mega Menu ({{ menuData.columns.length }} cột)
            </h2>
            <p class="text-xs text-muted">Kéo thả thứ tự hoặc tùy biến các liên kết trong từng cột</p>
          </div>
        </div>
        <UButton
          size="sm"
          variant="soft"
          color="primary"
          icon="i-lucide-plus"
          label="Thêm Cột Mới"
          class="font-bold"
          @click="onAddColumn"
        />
      </div>

      <!-- Columns Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        <div
          v-for="(col, colIdx) in menuData.columns"
          :key="col.column_id || colIdx"
          class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700"
        >
          <!-- Column Header -->
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
            <div class="flex items-center justify-between gap-1">
              <div class="flex items-center gap-1.5">
                <span class="text-[11px] font-black px-2 py-0.5 rounded-md bg-primary/15 text-primary uppercase tracking-wide">
                  Cột {{ colIdx + 1 }}
                </span>
                <span class="text-xs text-muted font-medium">({{ col.items?.length || 0 }} mục)</span>
              </div>

              <div class="flex items-center gap-0.5">
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-arrow-left"
                  :disabled="colIdx === 0"
                  title="Di chuyển sang trái"
                  @click="moveColumn(colIdx, -1)"
                />
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-arrow-right"
                  :disabled="colIdx === menuData.columns.length - 1"
                  title="Di chuyển sang phải"
                  @click="moveColumn(colIdx, 1)"
                />
                <UButton
                  size="xs"
                  variant="ghost"
                  color="error"
                  icon="i-lucide-trash-2"
                  title="Xóa cột này"
                  @click="removeColumn(colIdx)"
                />
              </div>
            </div>

            <!-- Edit Column Title & Icon -->
            <div class="space-y-1.5">
              <UInput
                v-model="col.title"
                placeholder="Tên cột (VD: Miền Đông)"
                size="sm"
                icon="i-lucide-type"
                class="w-full font-bold"
              />
              <div class="flex items-center gap-1.5">
                <div class="size-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
                  <UIcon :name="col.icon || 'i-lucide-route'" class="size-4 text-primary" />
                </div>
                <UInput
                  v-model="col.icon"
                  placeholder="i-lucide-plane"
                  size="xs"
                  class="flex-1 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <!-- Items List Inside Column -->
          <div class="p-3 space-y-2.5 flex-1 min-h-56 max-h-[520px] overflow-y-auto">
            <div
              v-if="!col.items?.length"
              class="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs gap-2"
            >
              <div class="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <UIcon name="i-lucide-inbox" class="size-5" />
              </div>
              <p class="font-medium text-slate-500">Chưa có mục nào trong cột này</p>
              <p class="text-[11px] text-muted">Bấm nút ghim bài viết hoặc thêm tuyến bên dưới</p>
            </div>

            <div
              v-for="(item, itemIdx) in col.items"
              :key="itemIdx"
              class="p-2.5 rounded-xl border transition-all text-left space-y-2 group"
              :class="item.is_active ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/90 dark:border-slate-700/80 hover:border-primary/50 hover:bg-white dark:hover:bg-slate-800' : 'bg-slate-100/50 dark:bg-slate-950/40 border-dashed border-slate-200 dark:border-slate-800 opacity-55'"
            >
              <!-- Item Top Bar -->
              <div class="flex items-center justify-between gap-1">
                <div class="flex items-center gap-1.5">
                  <UBadge
                    v-if="item.item_type === 'article'"
                    label="Bài viết"
                    color="primary"
                    variant="subtle"
                    size="xs"
                    class="font-bold"
                  />
                  <UBadge
                    v-else-if="item.item_type === 'route'"
                    label="Tuyến xe"
                    color="info"
                    variant="subtle"
                    size="xs"
                    class="font-bold"
                  />
                  <UBadge
                    v-else
                    label="Tùy chỉnh"
                    color="neutral"
                    variant="subtle"
                    size="xs"
                    class="font-bold"
                  />
                </div>

                <div class="flex items-center gap-1">
                  <USwitch
                    v-model="item.is_active"
                    size="xs"
                    title="Bật/Tắt hiển thị"
                  />
                  <UButton
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    icon="i-lucide-chevron-up"
                    :disabled="itemIdx === 0"
                    title="Lên trên"
                    @click="moveItem(colIdx, itemIdx, -1)"
                  />
                  <UButton
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    icon="i-lucide-chevron-down"
                    :disabled="itemIdx === col.items.length - 1"
                    title="Xuống dưới"
                    @click="moveItem(colIdx, itemIdx, 1)"
                  />
                  <UButton
                    size="xs"
                    variant="ghost"
                    color="error"
                    icon="i-lucide-trash"
                    title="Xóa mục này"
                    @click="removeItem(colIdx, itemIdx)"
                  />
                </div>
              </div>

              <!-- Item Content Fields -->
              <div class="space-y-1.5">
                <UInput
                  v-model="item.title"
                  placeholder="Tiêu đề hiển thị"
                  size="xs"
                  icon="i-lucide-type"
                  class="w-full font-bold"
                />
                <UInput
                  v-model="item.description"
                  placeholder="Mô tả phụ (tùy chọn)"
                  size="xs"
                  icon="i-lucide-align-left"
                  class="w-full text-slate-500"
                />
                <div class="flex items-center gap-1">
                  <UInput
                    v-model="item.link"
                    placeholder="/xe-rieng-... hoặc /blog/..."
                    size="xs"
                    icon="i-lucide-link"
                    class="flex-1 font-mono text-[11px] text-primary"
                  />
                  <UButton
                    size="xs"
                    variant="soft"
                    color="primary"
                    icon="i-lucide-sparkles"
                    title="Đổi URL bằng Bộ chọn thông minh"
                    @click="openUrlHelperForItem(colIdx, itemIdx)"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Column Action Buttons -->
          <div class="p-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
            <UButton
              size="xs"
              color="primary"
              variant="solid"
              icon="i-lucide-pin"
              label="Ghim Bài Viết Vào Cột"
              class="w-full justify-center font-bold shadow-xs"
              @click="openArticlePicker(colIdx)"
            />
            <UButton
              size="xs"
              color="neutral"
              variant="soft"
              icon="i-lucide-plus"
              label="Thêm Tuyến / Link Tùy Chỉnh"
              class="w-full justify-center text-xs font-semibold"
              @click="openCustomItemModal(colIdx)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ================= MODAL 1: BỘ CHỌN BÀI VIẾT (CHUẨN NUXT UI v4) ================= -->
    <UModal
      v-model:open="showArticlePicker"
      title="Ghim Bài Viết Vào Mega Menu"
      :description="`Chọn bài viết từ hệ thống Cẩm nang & Chính sách để ghim vào Cột ${targetColIndex !== null ? targetColIndex + 1 : ''}`"
      :ui="{ content: 'sm:max-w-2xl' }"
    >
      <template #body>
        <div class="space-y-4">
          <!-- Search & Filter Controls -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <UInput
              v-model="articleSearchKeyword"
              icon="i-lucide-search"
              placeholder="Tìm theo tiêu đề bài viết, slug hoặc mô tả..."
              class="flex-1"
              size="md"
              :loading="articlesLoading"
              @update:model-value="onSearchArticlesDebounced"
            />

            <!-- Category Filter Tabs -->
            <div class="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
              <button
                type="button"
                v-for="cat in pickerCategoryTabs"
                :key="cat.val"
                class="px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer"
                :class="selectedPickerCat === cat.val ? 'bg-white dark:bg-slate-700 text-primary shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
                @click="changePickerCat(cat.val)"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>

          <!-- Articles List -->
          <div class="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            <!-- Loading Skeletons -->
            <div v-if="articlesLoading" class="space-y-2 py-2">
              <div v-for="i in 4" :key="i" class="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <USkeleton class="size-12 rounded-lg shrink-0" />
                <div class="space-y-1.5 flex-1">
                  <USkeleton class="h-4 w-3/4" />
                  <USkeleton class="h-3 w-1/2" />
                </div>
                <USkeleton class="h-8 w-20 rounded-lg shrink-0" />
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="!articlesList?.length"
              class="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 space-y-2"
            >
              <div class="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <UIcon name="i-lucide-file-search" class="size-6" />
              </div>
              <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200">Không tìm thấy bài viết phù hợp</h4>
              <p class="text-xs text-muted max-w-sm mx-auto">
                Thử tìm với từ khóa khác hoặc chuyển danh mục "Tất cả" để xem các bài viết có sẵn.
              </p>
              <UButton
                v-if="articleSearchKeyword || selectedPickerCat"
                size="xs"
                variant="soft"
                color="neutral"
                label="Đặt lại tìm kiếm"
                class="mt-2"
                @click="resetArticleSearch"
              />
            </div>

            <!-- Article Items Cards -->
            <div
              v-for="art in articlesList"
              v-else
              :key="art.id || art.slug"
              class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/60 hover:bg-primary/5 bg-white dark:bg-slate-900 flex items-center justify-between gap-3.5 transition-all cursor-pointer group shadow-xs"
              @click="selectArticleToPin(art)"
            >
              <!-- Thumbnail / Icon -->
              <div class="size-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                <img
                  v-if="art.thumbnail"
                  :src="resolveImageUrl(art.thumbnail)"
                  :alt="art.title"
                  class="size-full object-cover"
                  @error="onImgError($event)"
                />
                <UIcon
                  v-else
                  :name="art.category === 'blog' ? 'i-lucide-compass' : 'i-lucide-shield-check'"
                  class="size-6 text-primary"
                />
              </div>

              <!-- Content -->
              <div class="min-w-0 flex-1 space-y-1">
                <div class="flex items-center gap-2">
                  <UBadge
                    :label="art.category === 'blog' ? 'Cẩm nang' : 'Chính sách'"
                    :color="art.category === 'blog' ? 'primary' : 'info'"
                    variant="subtle"
                    size="xs"
                    class="font-bold"
                  />
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                    {{ art.title }}
                  </h4>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {{ art.excerpt || 'Không có mô tả phụ' }}
                </p>
                <div class="flex items-center gap-2 text-[10px] text-primary font-mono">
                  <span>/{{ art.category === 'policy' ? 'policy' : 'blog' }}/{{ art.slug }}</span>
                </div>
              </div>

              <!-- Action Button -->
              <UButton
                size="xs"
                color="primary"
                variant="solid"
                icon="i-lucide-pin"
                label="Ghim"
                class="shrink-0 font-bold shadow-xs group-hover:scale-105 transition-transform"
                @click.stop="selectArticleToPin(art)"
              />
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex items-center justify-between w-full">
          <span class="text-xs text-muted font-medium">
            Có {{ articlesList.length }} bài viết hiển thị
          </span>
          <UButton
            variant="outline"
            color="neutral"
            label="Đóng"
            @click="() => { showArticlePicker = false }"
          />
        </div>
      </template>
    </UModal>

    <!-- ================= MODAL 2: THÊM LIÊN KẾT & BỘ DỰNG URL THÔNG MINH ================= -->
    <UModal
      v-model:open="showCustomModal"
      title="Thêm Liên Kết / Tuyến Xe Vào Mega Menu"
      :description="`Thêm mục liên kết mới vào Cột ${targetColIndex !== null ? targetColIndex + 1 : ''}`"
      :ui="{ content: 'sm:max-w-2xl' }"
    >
      <template #body>
        <div class="space-y-5">
          <!-- Navigation Tabs for URL Builder Mode -->
          <div class="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              class="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              :class="builderTab === 'route' ? 'bg-white dark:bg-slate-700 text-primary shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'"
              @click="builderTab = 'route'"
            >
              <UIcon name="i-lucide-route" class="size-4" />
              <span>🚗 Dựng Tuyến Xe Đi Tỉnh</span>
            </button>

            <button
              type="button"
              class="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              :class="builderTab === 'preset' ? 'bg-white dark:bg-slate-700 text-primary shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'"
              @click="builderTab = 'preset'"
            >
              <UIcon name="i-lucide-layout-list" class="size-4" />
              <span>📌 Dịch Vụ & Trang Có Sẵn</span>
            </button>

            <button
              type="button"
              class="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              :class="builderTab === 'manual' ? 'bg-white dark:bg-slate-700 text-primary shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'"
              @click="builderTab = 'manual'"
            >
              <UIcon name="i-lucide-pencil" class="size-4" />
              <span>✍️ Nhập URL Tùy Ý</span>
            </button>
          </div>

          <!-- TAB 1: BỘ DỰNG TUYẾN XE TỰ ĐỘNG CHUẨN SEO -->
          <div v-if="builderTab === 'route'" class="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-wand-sparkles" class="size-4.5 text-primary" />
                <h4 class="text-xs font-black uppercase tracking-wider text-primary">Bộ sinh tuyến xe thông minh</h4>
              </div>
              <span class="text-[11px] text-muted">Tự động tạo URL /xe-rieng-...</span>
            </div>

            <!-- Route Builder Dropdowns (From <-> To) -->
            <div class="grid grid-cols-1 sm:grid-cols-9 gap-2.5 items-center">
              <!-- Điểm Đi -->
              <div class="sm:col-span-4 space-y-1">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">1. Nơi đón (Điểm đi)</label>
                <USelect
                  v-model="builderFromSlug"
                  :items="locationOptions"
                  placeholder="Chọn điểm đón..."
                  class="w-full font-bold"
                  size="md"
                />
              </div>

              <!-- Nút Hoán Đổi Chiều -->
              <div class="sm:col-span-1 flex items-center justify-center pt-4">
                <UButton
                  size="sm"
                  variant="outline"
                  color="primary"
                  icon="i-lucide-arrow-left-right"
                  title="Đổi chiều Điểm đi ⇄ Điểm đến"
                  class="rounded-full shadow-xs"
                  @click="swapRouteLocations"
                />
              </div>

              <!-- Điểm Đến -->
              <div class="sm:col-span-4 space-y-1">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">2. Nơi trả (Điểm đến)</label>
                <USelect
                  v-model="builderToSlug"
                  :items="locationOptions"
                  placeholder="Chọn điểm đến..."
                  class="w-full font-bold"
                  size="md"
                />
              </div>
            </div>

            <!-- Format Direction Selector -->
            <div class="flex items-center justify-between pt-1 text-xs">
              <span class="font-bold text-slate-700 dark:text-slate-300">Kiểu hiển thị tiêu đề:</span>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  v-for="d in [
                    { id: 'both', label: '2 Chiều (⇄)' },
                    { id: 'depart', label: 'Chiều đi (→)' },
                    { id: 'return', label: 'Chiều về (←)' }
                  ]"
                  :key="d.id"
                  class="px-2.5 py-1 text-xs font-bold rounded-md border transition-all cursor-pointer"
                  :class="builderDirection === d.id ? 'bg-primary text-white border-primary shadow-xs' : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-600'"
                  @click="builderDirection = d.id as any"
                >
                  {{ d.label }}
                </button>
              </div>
            </div>

            <!-- Preview Box -->
            <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-primary/30 flex items-center justify-between gap-3 shadow-inner">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-slate-900 dark:text-white">{{ generatedRouteTitle }}</span>
                  <UBadge label="Khớp Tuyến Hệ Thống" color="success" variant="subtle" size="xs" />
                </div>
                <div class="text-xs font-mono text-primary truncate mt-0.5">{{ generatedRouteUrl }}</div>
              </div>
              <UButton
                size="sm"
                color="primary"
                variant="solid"
                icon="i-lucide-check-circle"
                label="Áp Dụng Vào Form"
                class="font-bold shrink-0"
                @click="applyGeneratedRoute"
              />
            </div>
          </div>

          <!-- TAB 2: DANH SÁCH DỊCH VỤ & TRANG CÓ SẴN -->
          <div v-else-if="builderTab === 'preset'" class="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            <div v-for="group in systemPresetPages" :key="group.group" class="space-y-2">
              <h5 class="text-xs font-black text-slate-400 uppercase tracking-wider">{{ group.group }}</h5>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  v-for="item in group.items"
                  :key="item.link"
                  class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all flex items-start gap-2.5 group"
                  @click="applyPresetItem(item)"
                >
                  <div class="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <UIcon :name="item.icon" class="size-4" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <h6 class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary truncate">
                      {{ item.title }}
                    </h6>
                    <p class="text-[11px] text-muted line-clamp-1">{{ item.description }}</p>
                    <span class="text-[10px] text-primary font-mono">{{ item.link }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 3: NHẬP THỦ CÔNG (Gợi ý cú pháp) -->
          <div v-else class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-muted space-y-1.5">
            <div class="flex items-center gap-1.5 text-slate-800 dark:text-white font-bold">
              <UIcon name="i-lucide-info" class="size-4 text-primary" />
              <span>Gợi ý định dạng đường dẫn URL nội bộ:</span>
            </div>
            <ul class="list-disc list-inside space-y-0.5 text-[11px]">
              <li>Tuyến xe riêng: <code class="text-primary font-mono">/xe-rieng-tphcm-di-vung-tau</code></li>
              <li>Bài viết cẩm nang: <code class="text-primary font-mono">/blog/kinh-nghiem-thue-xe-rieng</code></li>
              <li>Chính sách quy chế: <code class="text-primary font-mono">/policy/quy-che-hoat-dong</code></li>
              <li>Phân mục trang chủ: <code class="text-primary font-mono">/#dat-xe</code>, <code class="text-primary font-mono">/#dich-vu-5-cho</code></li>
            </ul>
          </div>

          <!-- FORM FIELDS CHÍNH (Được tự động điền) -->
          <div class="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3.5">
            <!-- Item Type Selector -->
            <UFormField label="Loại mục" hint="Phân loại liên kết hiển thị">
              <div class="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  class="flex items-center justify-center gap-2 p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer"
                  :class="customForm.item_type === 'route' ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100'"
                  @click="() => { customForm.item_type = 'route' }"
                >
                  <UIcon name="i-lucide-route" class="size-4" />
                  <span>Tuyến Xe Đi Tỉnh</span>
                </button>
                <button
                  type="button"
                  class="flex items-center justify-center gap-2 p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer"
                  :class="customForm.item_type === 'custom' ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100'"
                  @click="() => { customForm.item_type = 'custom' }"
                >
                  <UIcon name="i-lucide-link" class="size-4" />
                  <span>Link Tùy Chỉnh / Bài Viết</span>
                </button>
              </div>
            </UFormField>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Title -->
              <UFormField label="Tiêu đề hiển thị *" required hint="Tên tuyến hoặc dịch vụ">
                <UInput
                  v-model="customForm.title"
                  placeholder="VD: Sài Gòn ⇄ Vũng Tàu"
                  icon="i-lucide-type"
                  size="md"
                  class="w-full font-bold"
                />
              </UFormField>

              <!-- Description -->
              <UFormField label="Mô tả phụ" hint="Hiển thị bên dưới tiêu đề (tùy chọn)">
                <UInput
                  v-model="customForm.description"
                  placeholder="VD: Đón trả tận resort & khách sạn"
                  icon="i-lucide-align-left"
                  size="md"
                  class="w-full"
                />
              </UFormField>
            </div>

            <!-- Link / URL -->
            <UFormField label="Đường dẫn liên kết (URL) *" required hint="URL nội bộ (/...) hoặc liên kết ngoài">
              <UInput
                v-model="customForm.link"
                placeholder="VD: /xe-rieng-tphcm-di-vung-tau"
                icon="i-lucide-external-link"
                size="md"
                class="w-full font-mono text-xs text-primary"
              />
            </UFormField>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex items-center justify-between w-full">
          <span class="text-xs text-muted font-mono">{{ customForm.link || 'Chưa chọn URL' }}</span>
          <div class="flex items-center gap-2">
            <UButton
              variant="ghost"
              color="neutral"
              label="Hủy bỏ"
              @click="() => { showCustomModal = false }"
            />
            <UButton
              color="primary"
              variant="solid"
              icon="i-lucide-check"
              :label="editingItemIndex !== null ? 'Cập Nhật Mục' : 'Thêm Vào Cột'"
              class="font-bold px-4 shadow-sm"
              @click="saveCustomItem"
            />
          </div>
        </div>
      </template>
    </UModal>
  </UContainer>
</template>

<script lang="ts" setup>
import { menuService } from '~/services/menu.service'
import { blogService } from '~/services/blog.service'
import { resolveImageUrl } from '~/utils'
import type { MegaMenuData, MegaMenuItem, MegaMenuColumn, Article } from '~/type'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { adminToken, logOutAdmin } = useAuth()
const toast = useToast()

useSeoMeta({
  title: 'Quản Lý Mega Menu - Admin Happy Trip',
})

const isSyncing = ref(false)
const saving = ref(false)
const resetting = ref(false)
const sessionExpired = ref(false)

const defaultFallbackColumns: MegaMenuColumn[] = [
  {
    column_id: 'col-airport',
    title: 'Đưa Đón Sân Bay',
    icon: 'i-lucide-plane',
    order: 1,
    items: [
      {
        title: 'Sân bay TSN ⇄ Vũng Tàu',
        description: 'Cao tốc Long Thành êm ái',
        link: '/xe-rieng-vung-tau-di-san-bay-tan-son-nhat',
        item_type: 'route',
        order: 1,
        is_active: true,
      },
    ],
  },
  {
    column_id: 'col-east',
    title: 'Miền Đông & Du Lịch',
    icon: 'i-lucide-palmtree',
    order: 2,
    items: [
      {
        title: 'Sài Gòn ⇄ Vũng Tàu / Hồ Tràm',
        description: 'Đón trả tận resort & khách sạn',
        link: '/xe-rieng-tphcm-di-vung-tau',
        item_type: 'route',
        order: 1,
        is_active: true,
      },
      {
        title: 'Sài Gòn ⇄ Đồng Nai',
        description: 'Biên Hòa, Long Khánh, KCN',
        link: '/xe-rieng-tphcm-di-dong-nai',
        item_type: 'route',
        order: 2,
        is_active: true,
      },
      {
        title: 'Sài Gòn ⇄ Tây Ninh',
        description: 'Núi Bà Đen, Tòa Thánh',
        link: '/xe-rieng-tphcm-di-tay-ninh',
        item_type: 'route',
        order: 3,
        is_active: true,
      },
      {
        title: 'Sài Gòn ⇄ Lâm Đồng (Đà Lạt)',
        description: 'Du lịch nghỉ dưỡng phố núi',
        link: '/xe-rieng-tphcm-di-da-lat',
        item_type: 'route',
        order: 4,
        is_active: true,
      },
      {
        title: 'Sài Gòn ⇄ Khánh Hòa (Nha Trang)',
        description: 'Cao tốc Bắc Nam liền mạch',
        link: '/xe-rieng-tphcm-di-nha-trang',
        item_type: 'route',
        order: 5,
        is_active: true,
      },
    ],
  },
  {
    column_id: 'col-west',
    title: 'Miền Tây (ĐBSCL)',
    icon: 'i-lucide-waves',
    order: 3,
    items: [
      {
        title: 'Sài Gòn ⇄ Cần Thơ',
        description: 'Thủ phủ miền Tây Nam Bộ',
        link: '/xe-rieng-tphcm-di-can-tho',
        item_type: 'route',
        order: 1,
        is_active: true,
      },
      {
        title: 'Sài Gòn ⇄ An Giang',
        description: 'Châu Đốc, Miếu Bà Chúa Xứ',
        link: '/xe-rieng-tphcm-di-an-giang',
        item_type: 'route',
        order: 2,
        is_active: true,
      },
      {
        title: 'Sài Gòn ⇄ Đồng Tháp',
        description: 'Cao Lãnh, Làng hoa Sa Đéc',
        link: '/xe-rieng-tphcm-di-dong-thap',
        item_type: 'route',
        order: 3,
        is_active: true,
      },
      {
        title: 'Sài Gòn ⇄ Vĩnh Long',
        description: 'Cầu Mỹ Thuận 2 nhanh chóng',
        link: '/xe-rieng-tphcm-di-vinh-long',
        item_type: 'route',
        order: 4,
        is_active: true,
      },
      {
        title: 'Sài Gòn ⇄ Cà Mau',
        description: 'Đất Mũi, trọn gói khứ hồi',
        link: '/xe-rieng-tphcm-di-ca-mau',
        item_type: 'route',
        order: 5,
        is_active: true,
      },
    ],
  },
  {
    column_id: 'col-highlands',
    title: 'Tây Nguyên',
    icon: 'i-lucide-mountain-snow',
    order: 4,
    items: [
      {
        title: 'Sài Gòn ⇄ Đắk Lắk',
        description: 'Buôn Ma Thuột thủ phủ cà phê',
        link: '/xe-rieng-tphcm-di-dak-lak',
        item_type: 'route',
        order: 1,
        is_active: true,
      },
      {
        title: 'Sài Gòn ⇄ Gia Lai',
        description: 'Pleiku, Biển Hồ phố núi',
        link: '/xe-rieng-tphcm-di-gia-lai',
        item_type: 'route',
        order: 2,
        is_active: true,
      },
    ],
  },
]

const menuData = reactive<MegaMenuData>({
  menu_key: 'routes',
  title: 'Tuyến Đi Tỉnh 2 Chiều',
  banner_top: {
    title: 'Thuê Xe Riêng Đi Tỉnh 2 Chiều & Sân Bay',
    subtitle: 'Đón trả tận nhà · Giá trọn gói minh bạch · Phục vụ 24/7',
    cta_text: 'Xem cam kết dịch vụ',
    cta_link: '/#dich-vu',
  },
  columns: defaultFallbackColumns,
  footer_bar: {
    items: ['Bao trọn xe 100%', 'Đón đúng giờ hẹn', '0đ phụ phí ẩn'],
    hotline: '0972 97 0000',
  },
  is_active: true,
})

// Load Menu with Fallback (Non-blocking, không làm gián đoạn hay block giao diện)
async function loadMenu() {
  isSyncing.value = true
  sessionExpired.value = false
  try {
    const token = adminToken.value || ''
    let data: MegaMenuData | null = null

    if (token) {
      try {
        data = await menuService.getAdminMenu(token, 'routes')
      } catch (err: any) {
        if (err?.statusCode === 401 || err?.data?.statusCode === 401) {
          sessionExpired.value = true
        } else {
          throw err
        }
      }
    } else {
      sessionExpired.value = true
    }

    // Fallback: nếu token hết hạn/lỗi, nạp dữ liệu public để vẫn render cấu hình
    if (!data) {
      data = await menuService.getPublicMenu('routes')
    }

    if (data && data.columns && data.columns.length > 0) {
      Object.assign(menuData, data)
    }
  } catch (err: any) {
    console.warn('Lỗi khi nạp dữ liệu Mega Menu mới nhất:', err)
  } finally {
    isSyncing.value = false
  }
}

onMounted(() => {
  loadMenu()
})

// Columns management
function onAddColumn() {
  const newIdx = menuData.columns.length + 1
  menuData.columns.push({
    column_id: `col-${Date.now()}`,
    title: `Cột ${newIdx}`,
    icon: 'i-lucide-route',
    order: newIdx,
    items: [],
  })
}

function removeColumn(index: number) {
  if (confirm(`Bạn có chắc muốn xóa cột "${menuData.columns[index]?.title}" cùng tất cả các mục bên trong?`)) {
    menuData.columns.splice(index, 1)
  }
}

function moveColumn(index: number, delta: number) {
  const target = index + delta
  if (target < 0 || target >= menuData.columns.length) return
  const col = menuData.columns[index]
  if (col) {
    menuData.columns.splice(index, 1)
    menuData.columns.splice(target, 0, col)
  }
}

// Items management
function removeItem(colIdx: number, itemIdx: number) {
  const col = menuData.columns[colIdx]
  if (col?.items) {
    col.items.splice(itemIdx, 1)
  }
}

function moveItem(colIdx: number, itemIdx: number, delta: number) {
  const col = menuData.columns[colIdx]
  if (!col?.items) return
  const target = itemIdx + delta
  if (target < 0 || target >= col.items.length) return
  const item = col.items[itemIdx]
  if (item) {
    col.items.splice(itemIdx, 1)
    col.items.splice(target, 0, item)
  }
}

// Save Changes
async function onSave() {
  if (sessionExpired.value || !adminToken.value) {
    toast.add({
      title: 'Phiên đăng nhập đã hết hạn',
      description: 'Vui lòng đăng nhập lại để lưu thay đổi',
      color: 'warning',
      icon: 'i-lucide-log-in',
    })
    logOutAdmin()
    return
  }

  saving.value = true
  try {
    const token = adminToken.value || ''
    await menuService.updateAdminMenu(token, {
      menu_key: menuData.menu_key,
      title: menuData.title,
      banner_top: menuData.banner_top,
      columns: menuData.columns,
      footer_bar: menuData.footer_bar,
      is_active: menuData.is_active,
    })

    toast.add({
      title: 'Đã lưu cấu hình Mega Menu thành công',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  } catch (err: any) {
    if (err?.statusCode === 401 || err?.data?.statusCode === 401) {
      sessionExpired.value = true
      toast.add({
        title: 'Phiên đăng nhập đã hết hạn',
        description: 'Vui lòng đăng nhập lại để lưu thay đổi',
        color: 'warning',
        icon: 'i-lucide-log-in',
      })
      logOutAdmin()
      return
    }
    toast.add({
      title: 'Lỗi khi lưu Mega Menu',
      description: err?.data?.message || err.message,
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    saving.value = false
  }
}

// Reset to Default
async function confirmReset() {
  if (!confirm('Bạn có chắc chắn muốn khôi phục Mega Menu về cấu trúc mặc định của hệ thống? Mọi thay đổi tùy chỉnh sẽ bị đặt lại.')) {
    return
  }

  if (sessionExpired.value || !adminToken.value) {
    toast.add({
      title: 'Phiên đăng nhập đã hết hạn',
      description: 'Vui lòng đăng nhập lại để khôi phục mặc định',
      color: 'warning',
      icon: 'i-lucide-log-in',
    })
    logOutAdmin()
    return
  }

  resetting.value = true
  try {
    const token = adminToken.value || ''
    const data = await menuService.resetAdminMenu(token, 'routes')
    if (data) {
      Object.assign(menuData, data)
    }
    toast.add({
      title: 'Đã khôi phục Mega Menu về mặc định',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  } catch (err: any) {
    toast.add({
      title: 'Lỗi khôi phục mặc định',
      description: err?.data?.message || err.message,
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    resetting.value = false
  }
}

// ================= MODAL 1: BỘ CHỌN BÀI VIẾT =================
const showArticlePicker = ref(false)
const targetColIndex = ref<number | null>(null)
const articleSearchKeyword = ref('')
const selectedPickerCat = ref('')
const articlesLoading = ref(false)
const articlesList = ref<Article[]>([])
let searchTimeout: any = null

const pickerCategoryTabs = [
  { label: 'Tất cả', val: '' },
  { label: 'Cẩm nang du lịch', val: 'blog' },
  { label: 'Chính sách & Quy chế', val: 'policy' },
]

async function openArticlePicker(colIdx: number) {
  targetColIndex.value = colIdx
  showArticlePicker.value = true
  articleSearchKeyword.value = ''
  selectedPickerCat.value = ''
  await fetchArticles('', '')
}

function changePickerCat(cat: string) {
  selectedPickerCat.value = cat
  fetchArticles(articleSearchKeyword.value, cat)
}

function resetArticleSearch() {
  articleSearchKeyword.value = ''
  selectedPickerCat.value = ''
  fetchArticles('', '')
}

async function fetchArticles(keyword = '', category = selectedPickerCat.value) {
  articlesLoading.value = true
  try {
    const token = adminToken.value || ''
    if (token) {
      try {
        const res = await blogService.getAdminArticles(token, {
          page: 1,
          limit: 50,
          keyword,
          category: (category === 'blog' || category === 'policy') ? category : undefined,
        })
        if (res?.data) {
          articlesList.value = res.data
          return
        }
      } catch {
        // Fallback below
      }
    }

    // Public fallback
    const [blogRes, policyRes] = await Promise.allSettled([
      category !== 'policy' ? blogService.getBlogList({ page: 1, limit: 30, keyword }) : Promise.resolve({ data: [] }),
      category !== 'blog' ? blogService.getPolicyList({ page: 1, limit: 30, keyword }) : Promise.resolve({ data: [] }),
    ])
    const blogs = blogRes.status === 'fulfilled' ? (blogRes.value as any)?.data || [] : []
    const policies = policyRes.status === 'fulfilled' ? (policyRes.value as any)?.data || [] : []
    articlesList.value = [...blogs, ...policies]
  } catch (err: any) {
    console.error('Lỗi khi tải danh sách bài viết:', err)
    articlesList.value = []
  } finally {
    articlesLoading.value = false
  }
}

function onSearchArticlesDebounced(val: string) {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchArticles(val, selectedPickerCat.value)
  }, 300)
}

function onImgError(event: Event) {
  const target = event.target as HTMLElement
  if (target) target.style.display = 'none'
}

function selectArticleToPin(art: Article) {
  if (targetColIndex.value === null) return
  const col = menuData.columns[targetColIndex.value]
  if (!col) return

  if (!col.items) col.items = []

  const linkPath = art.category === 'policy' ? `/policy/${art.slug}` : `/blog/${art.slug}`

  const newItem: MegaMenuItem = {
    title: art.title,
    description: art.excerpt || '',
    link: linkPath,
    item_type: 'article',
    article_id: art.id,
    order: col.items.length + 1,
    is_active: true,
  }

  col.items.push(newItem)

  toast.add({
    title: `Đã ghim bài viết vào Cột ${targetColIndex.value + 1}`,
    description: `"${art.title}"`,
    color: 'success',
    icon: 'i-lucide-check-circle',
  })

  showArticlePicker.value = false
}

// ================= MODAL 2: BỘ DỰNG URL NỘI BỘ & THÊM MỤC =================
const showCustomModal = ref(false)
const builderTab = ref<'route' | 'preset' | 'manual'>('route')
const editingItemIndex = ref<number | null>(null)

const customForm = reactive<{
  title: string
  description: string
  link: string
  item_type: 'route' | 'custom'
}>({
  title: '',
  description: '',
  link: '',
  item_type: 'route',
})

// Route Generator Data & Presets
const locationOptions = [
  { label: 'TP. Hồ Chí Minh / Sài Gòn', value: 'tphcm' },
  { label: 'Sân Bay Tân Sơn Nhất (TSN)', value: 'san-bay-tan-son-nhat' },
  { label: 'Vũng Tàu', value: 'vung-tau' },
  { label: 'Hồ Tràm', value: 'ho-tram' },
  { label: 'Long Hải', value: 'long-hai' },
  { label: 'Lâm Đồng (Đà Lạt)', value: 'da-lat' },
  { label: 'Khánh Hòa (Nha Trang)', value: 'nha-trang' },
  { label: 'Cần Thơ', value: 'can-tho' },
  { label: 'Đồng Nai (Biên Hòa)', value: 'dong-nai' },
  { label: 'Tây Ninh (Núi Bà Đen)', value: 'tay-ninh' },
  { label: 'An Giang (Châu Đốc)', value: 'an-giang' },
  { label: 'Đồng Tháp (Sa Đéc)', value: 'dong-thap' },
  { label: 'Vĩnh Long', value: 'vinh-long' },
  { label: 'Cà Mau (Đất Mũi)', value: 'ca-mau' },
  { label: 'Đắk Lắk (Buôn Ma Thuột)', value: 'dak-lak' },
  { label: 'Gia Lai (Pleiku)', value: 'gia-lai' },
]

const locationNameMap: Record<string, string> = {
  'tphcm': 'Sài Gòn',
  'san-bay-tan-son-nhat': 'Sân Bay TSN',
  'vung-tau': 'Vũng Tàu',
  'ho-tram': 'Hồ Tràm',
  'long-hai': 'Long Hải',
  'da-lat': 'Đà Lạt',
  'nha-trang': 'Nha Trang',
  'can-tho': 'Cần Thơ',
  'dong-nai': 'Đồng Nai',
  'tay-ninh': 'Tây Ninh',
  'an-giang': 'An Giang',
  'dong-thap': 'Đồng Tháp',
  'vinh-long': 'Vĩnh Long',
  'ca-mau': 'Cà Mau',
  'dak-lak': 'Đắk Lắk',
  'gia-lai': 'Gia Lai',
}

const routeDescriptionMap: Record<string, string> = {
  'vung-tau': 'Đón trả tận resort & khách sạn bãi biển',
  'ho-tram': 'Nghỉ dưỡng resort biển cao cấp trọn gói',
  'long-hai': 'Đón tận nơi, trọn gói khứ hồi êm ái',
  'da-lat': 'Du lịch nghỉ dưỡng phố núi, đèo êm ái',
  'nha-trang': 'Cao tốc Bắc Nam liền mạch êm ái',
  'can-tho': 'Thủ phủ miền Tây Nam Bộ, cao tốc nhanh',
  'san-bay-tan-son-nhat': 'Đón tiễn đúng giờ bay 24/7, 0đ phụ phí',
  'dong-nai': 'Biên Hòa, Long Khánh, các khu công nghiệp',
  'tay-ninh': 'Núi Bà Đen, Tòa Thánh trọn gói trong ngày',
  'an-giang': 'Châu Đốc, Miếu Bà Chúa Xứ khứ hồi',
  'dong-thap': 'Cao Lãnh, Làng hoa Sa Đéc trọn gói',
  'vinh-long': 'Cầu Mỹ Thuận 2 nhanh chóng, êm ái',
  'ca-mau': 'Về Đất Mũi, trọn gói khứ hồi giá tốt',
  'dak-lak': 'Buôn Ma Thuột thủ phủ cà phê',
  'gia-lai': 'Pleiku, Biển Hồ phố núi Tây Nguyên',
}

const builderFromSlug = ref('tphcm')
const builderToSlug = ref('vung-tau')
const builderDirection = ref<'both' | 'depart' | 'return'>('both')

const generatedRouteUrl = computed(() => {
  const f = builderFromSlug.value || 'tphcm'
  const t = builderToSlug.value || 'vung-tau'
  return `/xe-rieng-${f}-di-${t}`
})

const generatedRouteTitle = computed(() => {
  const fromName = locationNameMap[builderFromSlug.value] || builderFromSlug.value
  const toName = locationNameMap[builderToSlug.value] || builderToSlug.value
  if (builderDirection.value === 'both') {
    return `${fromName} ⇄ ${toName}`
  } else if (builderDirection.value === 'depart') {
    return `${fromName} → ${toName}`
  } else {
    return `${toName} → ${fromName}`
  }
})

const generatedRouteDesc = computed(() => {
  return routeDescriptionMap[builderToSlug.value] || routeDescriptionMap[builderFromSlug.value] || 'Đón trả tận nơi · Giá trọn gói 0đ phụ phí'
})

function swapRouteLocations() {
  const temp = builderFromSlug.value
  builderFromSlug.value = builderToSlug.value
  builderToSlug.value = temp
}

function applyGeneratedRoute() {
  customForm.title = generatedRouteTitle.value
  customForm.description = generatedRouteDesc.value
  customForm.link = generatedRouteUrl.value
  customForm.item_type = 'route'
  toast.add({
    title: 'Đã áp dụng tuyến xe',
    description: `${generatedRouteTitle.value} (${generatedRouteUrl.value})`,
    color: 'success',
    icon: 'i-lucide-check-circle',
  })
}

// Preset Pages Group
const systemPresetPages = [
  {
    group: 'Dịch vụ xe riêng Happy Trip',
    items: [
      {
        title: 'Xe Riêng 5 Chỗ (Sedan)',
        description: 'Sedan đời mới êm ái, tối ưu chi phí 1-3 người',
        link: '/#dich-vu-5-cho',
        icon: 'i-lucide-car',
        type: 'route' as const,
      },
      {
        title: 'Xe Riêng 7 Chỗ (MPV / SUV)',
        description: 'MPV / SUV rộng rãi, cốp lớn cho 4-6 người',
        link: '/#dich-vu-7-cho',
        icon: 'i-lucide-car-front',
        type: 'route' as const,
      },
      {
        title: 'Xe Đưa Đón Sân Bay TSN',
        description: 'Đón tiễn đúng giờ bay Tân Sơn Nhất 24/7',
        link: '/xe-rieng-tphcm-di-san-bay-tan-son-nhat',
        icon: 'i-lucide-plane-takeoff',
        type: 'route' as const,
      },
      {
        title: 'Xe Công Tác & Du Lịch',
        description: 'Thuê xe theo lịch trình / tour trọn gói',
        link: '/#dich-vu-cong-tac',
        icon: 'i-lucide-briefcase',
        type: 'route' as const,
      },
    ],
  },
  {
    group: 'Trang chung & Khung đặt xe',
    items: [
      {
        title: 'Khung Đặt Xe Nhanh',
        description: 'Đặt xe trọn gói trực tuyến 24/7',
        link: '/#dat-xe',
        icon: 'i-lucide-calendar-check',
        type: 'custom' as const,
      },
      {
        title: 'Dành Cho Tài Xế Đối Tác',
        description: 'Đăng ký nhận chuyến, thu nhập ổn định',
        link: '/driver',
        icon: 'i-lucide-steering-wheel',
        type: 'custom' as const,
      },
      {
        title: 'Cẩm Nang Du Lịch',
        description: 'Kinh nghiệm du lịch, cẩm nang thuê xe',
        link: '/blog',
        icon: 'i-lucide-compass',
        type: 'custom' as const,
      },
      {
        title: 'Chính Sách & Điều Khoản',
        description: 'Quy chế hoạt động và cam kết dịch vụ',
        link: '/policy',
        icon: 'i-lucide-shield-check',
        type: 'custom' as const,
      },
      {
        title: 'Về Chúng Tôi',
        description: 'Giới thiệu nền tảng Happy Trip Express',
        link: '/introduce',
        icon: 'i-lucide-users',
        type: 'custom' as const,
      },
      {
        title: 'Liên Hệ 24/7',
        description: 'Hotline và thông tin hỗ trợ khách hàng',
        link: '/contact',
        icon: 'i-lucide-phone',
        type: 'custom' as const,
      },
    ],
  },
]

function applyPresetItem(item: { title: string; description: string; link: string; type: 'route' | 'custom' }) {
  customForm.title = item.title
  customForm.description = item.description
  customForm.link = item.link
  customForm.item_type = item.type
  toast.add({
    title: 'Đã chọn trang hệ thống',
    description: item.title,
    color: 'success',
    icon: 'i-lucide-check-circle',
  })
}

function openCustomItemModal(colIdx: number) {
  targetColIndex.value = colIdx
  editingItemIndex.value = null
  builderTab.value = 'route'
  customForm.title = generatedRouteTitle.value
  customForm.description = generatedRouteDesc.value
  customForm.link = generatedRouteUrl.value
  customForm.item_type = 'route'
  showCustomModal.value = true
}

function openUrlHelperForItem(colIdx: number, itemIdx: number) {
  targetColIndex.value = colIdx
  editingItemIndex.value = itemIdx
  const col = menuData.columns[colIdx]
  const item = col?.items?.[itemIdx]
  if (item) {
    customForm.title = item.title
    customForm.description = item.description || ''
    customForm.link = item.link
    customForm.item_type = item.item_type === 'article' ? 'custom' : (item.item_type || 'route')

    // Tự động phân tích xem link có phải route không
    const match = item.link.match(/\/xe-rieng-([a-z0-9-]+)-di-([a-z0-9-]+)/)
    if (match && match[1] && match[2]) {
      builderFromSlug.value = match[1]
      builderToSlug.value = match[2]
      builderTab.value = 'route'
    } else {
      builderTab.value = 'preset'
    }
  }
  showCustomModal.value = true
}

function saveCustomItem() {
  if (!customForm.title.trim() || !customForm.link.trim()) {
    toast.add({
      title: 'Vui lòng nhập đầy đủ thông tin',
      description: 'Tiêu đề hiển thị và đường dẫn liên kết là bắt buộc',
      color: 'warning',
      icon: 'i-lucide-alert-triangle',
    })
    return
  }

  if (targetColIndex.value === null) return
  const col = menuData.columns[targetColIndex.value]
  if (!col) return

  if (!col.items) col.items = []

  if (editingItemIndex.value !== null && col.items[editingItemIndex.value]) {
    // Cập nhật item hiện có
    const targetItem = col.items[editingItemIndex.value]!
    targetItem.title = customForm.title.trim()
    targetItem.description = customForm.description.trim()
    targetItem.link = customForm.link.trim()
    targetItem.item_type = customForm.item_type
    toast.add({
      title: 'Đã cập nhật mục',
      description: customForm.title,
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  } else {
    // Thêm mới
    col.items.push({
      title: customForm.title.trim(),
      description: customForm.description.trim(),
      link: customForm.link.trim(),
      item_type: customForm.item_type,
      order: col.items.length + 1,
      is_active: true,
    })
    toast.add({
      title: 'Đã thêm mục mới vào cột',
      description: customForm.title,
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  }

  showCustomModal.value = false
}
</script>
