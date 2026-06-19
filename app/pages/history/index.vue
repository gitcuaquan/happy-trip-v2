<template>
  <ClientOnly>
    <div class="min-h-screen bg-gray-50">
      <div class="bg-[#FF7A00] px-5 pt-12 pb-8 relative overflow-hidden rounded-b-[40px] lg:rounded-none">
        <div class="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div class="absolute top-8 -right-2 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
      </div>

      <UContainer>
        <div class="-mt-7 relative z-10 mb-2">
          <div
            class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-1.5 flex gap-2 items-center border-gray-50">
            <UInput v-model="q" icon="i-lucide-search" placeholder="Tìm điểm đến, điểm đón..." variant="none"
              class="flex-1" />
            <DatePicker v-model="searchDate" hide-time-input no-default allow-past>
              <UButton icon="i-lucide-calendar" color="primary" variant="soft"
                class="rounded-xl px-3 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-500"
                aria-label="Chọn ngày" />
            </DatePicker>
          </div>
        </div>

        <div class="flex justify-end mb-4">
          <UTabs v-model="activeTabIndex" :items="tabs" variant="pill" :ui="{
            root: 'w-full md:w-1/2',
            list: 'bg-gray-100 p-1.5 rounded-xl',
            indicator: 'bg-white shadow-sm rounded-lg',
            trigger: 'flex-1 justify-center text-xs font-bold rounded-lg text-gray-500 data-[state=active]:text-[#FF7A00]',
          }" />
        </div>

        <div v-if="isLoading" class="py-16 flex justify-center">
          <UIcon name="i-lucide-loader-2" class="size-8 text-orange-500 animate-spin" />
        </div>

        <div v-else-if="realOrders.length > 0">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div v-for="order in realOrders" :key="order.id" class="block">
              <HistoryCardItem :order="order" @refreshList="fetchOrders" @cancel="openCancelModal"
                @navigate="navigateTo(`/history/${order.id}`)" @rebook="handleRebookOrder(order)"
                @return-trip="handleReturnTripOrder(order)" />
            </div>
          </div>

          <div class="mt-6 flex justify-center">
            <UPagination v-model="currentPage" :page-count="limit" :total="totalCount" />
          </div>
        </div>
        <div v-else class="py-16 flex flex-col items-center text-center">
          <div class="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-3">
            <UIcon name="i-lucide-car" class="size-8 text-orange-200" />
          </div>
          <p class="text-gray-700 font-bold text-sm mb-1">Chưa có cuốc xe nào</p>
          <p class="text-gray-400 text-xs">Hãy điều chỉnh bộ lọc hoặc đặt xe ngay.</p>
        </div>
      </UContainer>
    </div>
  </ClientOnly>
  <!-- Confirm Cancel Modal -->
  <ConfirmModal v-model="showCancelModal" title="Xác nhận hủy chuyến"
    message="Bạn có chắc chắn muốn hủy chuyến này không? Hành động này không thể hoàn tác." confirmLabel="Hủy chuyến"
    confirmColor="error" icon="i-lucide-alert-triangle" :isLoading="isCanceling" @confirm="handleCancelOrder" />
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import type { Order, OrderListBodyFilter, OrderListQueryParams } from '~/type'
import { orderService } from '../../services/order.service'
import { useAuth } from '~/composables/useAuth'
import { useOrderForm } from '~/composables/useOrderForm'
import ConfirmModal from '~/components/shared/confirm-modal.vue'
import DatePicker from '~/components/ui/DatePicker.vue'

const toast = useToast()
const { token } = useAuth()

// 1. STATE BỀ MẶT (UI & Data)
const realOrders = ref<Order[]>([])
const isLoading = ref(false)
const totalCount = ref(0)
const currentPage = ref(1)
const limit = 10

// 2. STATE BỘ LỌC
const q = ref('')
const searchDate = ref<Date | null>(null)
const activeTabIndex = ref(0)

// Tab cấu hình: label hiển thị + mảng trạng thái tương ứng để filter
const tabs = [
  { label: 'Tất cả', statuses: undefined },             // Không lọc trạng thái
  { label: 'Đang thực hiện', statuses: [0, 1] },     // Chờ, Đã nhận, Đang chạy
  { label: 'Hoàn thành', statuses: [2] },               // Hoàn thành
  { label: 'Đã hủy', statuses: [3] },                   // Đã hủy
]

// 3. HÀM GỌI API CHÍNH
const fetchOrders = async () => {
  if (!token.value) {
    navigateTo('/login')
    return
  }

  isLoading.value = true
  try {
    // Phân trang
    const queryParams: OrderListQueryParams = {
      page: currentPage.value,
      limit: limit,
      sort_by: 'created_desc'
    }

    // Lọc theo tab hiện tại
    const currentTab = tabs[activeTabIndex.value]

    // Ép kiểu chuẩn thay vì dùng 'any'
    const bodyFilter: Partial<OrderListBodyFilter> = {
      keyword: q.value.trim() || undefined,
      order_status_list: currentTab!.statuses, // Lấy mảng [0,1,2] hoặc [3] ném thẳng vào đây
    }

    // Xử lý ngày tháng chuẩn chỉ
    if (searchDate.value) {
      const dateStr = searchDate.value.toISOString().split('T')[0]
      bodyFilter.from_date_of_destination = dateStr
      bodyFilter.to_date_of_destination = dateStr
    }

    const response = await orderService.getOrderList(token.value, queryParams, bodyFilter)

    realOrders.value = response.data || []
    totalCount.value = response.pagination?.count || 0

  } catch (error) {
    console.error('[HistoryPage] Lỗi lấy danh sách:', error)
    realOrders.value = []
  } finally {
    isLoading.value = false
  }
}

// 4. HỦY CHUYẾN
const showCancelModal = ref(false)
const isCanceling = ref(false)
const cancelTargetId = ref<string>('')

const openCancelModal = (orderId: string) => {
  cancelTargetId.value = orderId
  showCancelModal.value = true
}

const handleCancelOrder = async () => {
  if (!token.value || !cancelTargetId.value) return
  isCanceling.value = true

  try {
    await orderService.cancelOrder(token.value, cancelTargetId.value)
    toast.add({ title: 'Thành công', description: 'Hủy chuyến thành công!', color: 'success' })
    showCancelModal.value = false
    fetchOrders()
  } catch (error) {
    toast.add({ title: 'Lỗi', description: 'Có lỗi xảy ra khi hủy chuyến!', color: 'error' })
  } finally {
    isCanceling.value = false
  }
}

// Xử lý "Đặt lại chuyến" - lưu dữ liệu và chuyển về home
const handleRebookOrder = (order: Order) => {
  const { setOrderFormFromPreviousOrder } = useOrderForm()
  setOrderFormFromPreviousOrder(order)
  navigateTo('/')
}

// Xử lý "Đặt chiều về" - hoán đổi điểm đón/đến rồi chuyển về home
const handleReturnTripOrder = (order: Order) => {
  const { setOrderFormAsReturnTrip } = useOrderForm()
  setOrderFormAsReturnTrip(order)
  navigateTo('/')
}


// 5. WATCHERS & LIFECYCLE

// Luồng 1: Nếu người dùng thay đổi Lọc (Đổi Tab, Gõ tìm kiếm, Chọn ngày)
// -> Bắt buộc phải đưa về trang 1 rồi mới lấy data
watch([q, searchDate, activeTabIndex], () => {
  if (currentPage.value === 1) {
    fetchOrders() // Đang ở trang 1 sẵn thì gọi luôn
  } else {
    currentPage.value = 1 // Hành động gán = 1 này sẽ kích hoạt Luồng 2 bên dưới
  }
})

// Luồng 2: Nếu người dùng chỉ bấm chuyển Trang (2, 3, 4...)
// -> Không đụng chạm gì bộ lọc, chỉ gọi lại API
watch(currentPage, () => {
  fetchOrders()
})

onMounted(() => {
  fetchOrders()
})
</script>