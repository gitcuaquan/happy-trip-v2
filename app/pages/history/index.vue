<template>
  <div class="min-h-screen bg-gray-50">

    <!-- ─── Header cam ─── -->
    <div class="bg-[#FF7A00] px-5 pt-12 pb-8 relative overflow-hidden rounded-b-[40px] lg:rounded-none">
      <div class="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
      <div class="absolute top-8 -right-2 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />

      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3 relative z-10">
          <UAvatar icon="i-lucide-user-round" size="md" class="bg-transparent border border-white/40 text-white" />
          <div>
            <p class="text-white/80 text-xs">Xin chào,</p>
            <p class="text-white font-extrabold text-sm">{{ user.name }}</p>
            <p class="text-white/80 text-xs">{{ user.phone }}</p>
          </div>
        </div>

        <div class="ml-28 px-1">
          <UButton variant="ghost" icon="i-lucide-log-out" class="text-white hover:bg-white/20" to="/" />
        </div>
      </div>
    </div>

    <UContainer>
      <div class="px-5 -mt-7 relative z-10 mb-2">
        <div
          class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-1.5 flex gap-2 items-center border-gray-50">
          <UInput v-model="q" icon="i-lucide-search" placeholder="Tìm điểm đến, điểm đón..." variant="none"
            class="flex-1" :ui="{
              leadingIcon: 'text-gray-400',
              base: 'text-sm text-gray-700'
            }" />

          <DatePicker 
            v-model="searchDate" 
            hide-time-input
            no-default
            allow-past
            >
           
            <UButton icon="i-lucide-calendar" color="primary" variant="soft"
              class="rounded-xl px-3 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-500">
            </UButton>
          </DatePicker>
        </div>
      </div>

      <!-- Tabs -->
      <div>
        <UTabs v-model="activeTab" :items="tabs" variant="pill" :ui="{
          list: 'bg-gray-100 p-1.5 rounded-xl w-full',
          indicator: 'bg-white shadow-sm rounded-lg',
          trigger: 'flex-1 justify-center text-xs font-bold py-2 rounded-lg text-gray-500 data-[state=active]:text-[#FF7A00]',
        }" />
      </div>

      <!-- ─── Content ─── -->
      <UContainer class="py-5">
        <!-- List -->
        <div v-if="filteredOrders.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <HistoryCardItem v-for="order in filteredOrders" :key="order.id" :order="order" />
        </div>

        <!-- Empty -->
        <div v-else class="py-16 flex flex-col items-center text-center">
          <div class="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-3">
            <UIcon name="i-lucide-car" class="size-8 text-orange-200" />
          </div>
          <p class="text-gray-700 font-bold text-sm mb-1">Chưa có cuốc xe nào</p>
          <p class="text-gray-400 text-xs">Không có chuyến đi nào trong mục này.</p>
        </div>

      </UContainer>

    </UContainer>
  </div>

</template>

<script lang="ts" setup>
import HistoryCardItem from '~/components/history/card-item.vue'
import DatePicker from '~/components/ui/DatePicker.vue'
import type { HistoryOrder, HistoryOrderStatus } from '~/type'

const user = { name: 'Nguyễn Văn An', phone: '0123 456 789' }

const mockOrders: HistoryOrder[] = [
  {
    id: 'HT-001', short_id: '001', status: 'in_progress', status_name: 'Đang thực hiện',
    departure: { city: 'Hà Nội', district: 'Hoàn Kiếm', address_1: '45 Trần Hưng Đạo' },
    destination: { city: 'Hà Nội', district: 'Sóc Sơn', address_1: 'Sân bay Nội Bài' },
    date_of_destination: '2026-05-07T06:00:00',
    price_guest_after: 320000, name_service: 'Xe 7 chỗ', distance: 42,
    customer: { full_name: 'Lê Văn C', phone: '0912345678' },
  },
  {
    id: 'HT-002', short_id: '002', status: 'in_progress', status_name: 'Đang thực hiện',
    departure: { city: 'Hà Nội', district: 'Hoàng Mai', address_1: '15 Minh Khai' },
    destination: { city: 'Bắc Ninh', district: 'Tiên Du', address_1: '29 Lê Thái Tổ' },
    date_of_destination: '2026-05-07T14:10:00',
    price_guest_after: 135000, name_service: 'Xe 4 chỗ', distance: 28.5,
    customer: { full_name: 'Trần Văn B', phone: '0987654321' },
  },
  {
    id: 'HT-003', short_id: '003', status: 'completed', status_name: 'Đã hoàn thành',
    departure: { city: 'TP. HCM', district: 'Thủ Đức', address_1: 'KĐT Sala' },
    destination: { city: 'TP. HCM', district: 'Quận 1', address_1: 'Nhà thờ Đức Bà' },
    date_of_destination: '2026-05-06T07:30:00',
    price_guest_after: 85000, name_service: 'Xe 4 chỗ', distance: 8.3,
    customer: { full_name: 'Lê Hoàng C', phone: '0901234567' },
  },
  {
    id: 'HT-004', short_id: '004', status: 'completed', status_name: 'Đã hoàn thành',
    departure: { city: 'TP. HCM', district: 'Quận 1', address_1: '123 Nguyễn Huệ' },
    destination: { city: 'TP. HCM', district: 'Tân Bình', address_1: 'Sân bay Tân Sơn Nhất' },
    date_of_destination: '2026-05-06T14:30:00',
    price_guest_after: 150000, name_service: 'Xe 4 chỗ', distance: 12.4,
    customer: { full_name: 'Nguyễn Văn A', phone: '0909090909' },
  },
  {
    id: 'HT-005', short_id: '005', status: 'completed', status_name: 'Đã hoàn thành',
    departure: { city: 'An Giang', district: '', address_1: '' },
    destination: { city: 'Bà Rịa - Vũng Tàu', district: '', address_1: '' },
    date_of_destination: '2026-05-05T08:00:00',
    price_guest_after: 2430000, name_service: 'Xe 5 chỗ',
  },
  {
    id: 'HT-006', short_id: '006', status: 'completed', status_name: 'Đã hoàn thành',
    departure: { city: 'Đà Nẵng', district: 'Hải Châu', address_1: '1 Bạch Đằng' },
    destination: { city: 'Huế', district: '', address_1: '' },
    date_of_destination: '2026-05-04T22:15:00',
    price_guest_after: 490000, name_service: 'Xe 7 chỗ', distance: 98,
    customer: { full_name: 'Phạm Văn D', phone: '0911111111' },
  },
  {
    id: 'HT-007', short_id: '007', status: 'cancelled', status_name: 'Đã hủy',
    departure: { city: 'Hà Nội', district: 'Hoàn Kiếm', address_1: '80 Hai Bà Trưng' },
    destination: { city: 'Hà Nội', district: 'Từ Liêm', address_1: 'Trung tâm Hội nghị' },
    date_of_destination: '2026-05-04T13:00:00',
    price_guest_after: 90000, name_service: 'Xe 4 chỗ',
  },
  {
    id: 'HT-008', short_id: '008', status: 'cancelled', status_name: 'Đã hủy',
    departure: { city: 'TP. HCM', district: 'Quận 1', address_1: 'Chợ Bến Thành' },
    destination: { city: 'TP. HCM', district: 'Quận 1', address_1: 'Bùi Viện' },
    date_of_destination: '2026-05-03T18:00:00',
    price_guest_after: 45000, name_service: 'Xe 4 chỗ',
  },
  {
    id: 'HT-009', short_id: '009', status: 'cancelled', status_name: 'Đã hủy',
    departure: { city: 'Hà Nội', district: 'Hoàn Kiếm', address_1: '10 Đinh Lễ' },
    destination: { city: 'Hà Nội', district: 'Nam Từ Liêm', address_1: 'Bến xe Mỹ Đình' },
    date_of_destination: '2026-05-03T08:45:00',
    price_guest_after: 75000, name_service: 'Xe 4 chỗ',
  },
  {
    id: 'HT-010', short_id: '010', status: 'completed', status_name: 'Đã hoàn thành',
    departure: { city: 'TP. HCM', district: 'Quận 1', address_1: '5 Phan Chu Trinh' },
    destination: { city: 'TP. HCM', district: 'Thủ Đức', address_1: 'ĐH Quốc gia HCM' },
    date_of_destination: '2026-05-02T17:30:00',
    price_guest_after: 120000, name_service: 'Xe 4 chỗ', distance: 22.3,
    customer: { full_name: 'Vũ Thị E', phone: '0922222222' },
  },
]




const activeTab = ref<HistoryOrderStatus | 'all'>('all')

const tabs = computed(() => [
  { value: 'all', label: 'Tất cả', count: mockOrders.length },
  { value: 'in_progress', label: 'Đang thực hiện', count: mockOrders.filter(o => o.status === 'in_progress').length },
  { value: 'completed', label: 'Hoàn thành', count: mockOrders.filter(o => o.status === 'completed').length },
  { value: 'cancelled', label: 'Đã hủy', count: mockOrders.filter(o => o.status === 'cancelled').length },
])

// filter 
const q = ref('') // Lọc theo input 
const searchDate = ref<Date | null | undefined>(undefined) // Lọc theo ngày )

const filteredOrders = computed(() => {

  let list = mockOrders

  if (activeTab.value !== 'all') {
    list = list.filter(o => o.status === activeTab.value)
  }

  if (searchDate.value) {
    const targetDateStr = new Date(searchDate.value).toISOString().substring(0, 10) // Lấy phần YYYY-MM-DD

    list = list.filter(order => {
      if (!order.date_of_destination) return false
      const orderDateStr = order.date_of_destination.substring(0, 10)
      return orderDateStr === targetDateStr
    })
  }

  const searchText = q.value.trim().toLowerCase()
  if (searchText) {
    list = list.filter(order => {
      const departureStr = `${order.departure.address_1} ${order.departure.district} ${order.departure.city}`.toLowerCase()
      const destinationStr = `${order.destination.address_1} ${order.destination.district} ${order.destination.city}`.toLowerCase()
      const idStr = (order.short_id || '').toLowerCase()

      return departureStr.includes(searchText) ||
        destinationStr.includes(searchText) ||
        idStr.includes(searchText)
    })
  }

  return list
})

const completedCount = computed(() => mockOrders.filter(o => o.status === 'completed').length)
const inProgressCount = computed(() => mockOrders.filter(o => o.status === 'in_progress').length) 
</script>

<style>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>