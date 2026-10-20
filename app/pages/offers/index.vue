<template>
  <ClientOnly>
    <div class="min-h-screen bg-gray-50 pb-16">
      <!-- Hero -->
      <div class="bg-[#FF7A00] px-5 pt-10 pb-14 relative overflow-hidden rounded-b-[40px] lg:rounded-none">
        <div class="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div class="absolute top-8 -right-2 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
        <UContainer>
          <div class="relative z-10">
            <h1 class="text-white text-2xl font-black">
              Ưu đãi của tôi
            </h1>
            <p class="text-white/85 text-sm mt-1">
              Voucher và số dư giới thiệu dành cho bạn
            </p>
          </div>
        </UContainer>
      </div>

      <UContainer>
        <div class="-mt-8 relative z-10 space-y-5">
          <!-- Đang tải -->
          <div
            v-if="isLoading"
            class="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-16 flex justify-center"
          >
            <UIcon
              name="i-lucide-loader-2"
              class="size-8 text-orange-500 animate-spin"
            />
          </div>

          <!-- Lỗi: hiển thị nguyên văn nội dung lỗi từ API -->
          <div
            v-else-if="errorMsg"
            class="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 space-y-4"
          >
            <UAlert
              color="error"
              variant="subtle"
              icon="i-lucide-circle-x"
              title="Không thể tải ưu đãi"
              :description="errorMsg"
            />
            <UButton
              block
              class="justify-center rounded-xl font-bold"
              @click="fetchOffers"
            >
              Thử lại
            </UButton>
          </div>

          <template v-else>
            <!-- Số dư giới thiệu (hoặc lời mời giới thiệu khi chưa có số dư) -->
            <OfferReferralBalanceCard
              :summary="creditSummary"
              :details="creditDetails"
            />

            <!-- Voucher -->
            <section class="space-y-3">
              <h2 class="text-base font-black text-slate-800">
                Voucher
              </h2>

              <div
                v-if="vouchers.length > 0"
                class="grid grid-cols-1 lg:grid-cols-2 gap-3"
              >
                <OfferVoucherCard
                  v-for="voucher in vouchers"
                  :key="voucher.campaign_id"
                  :voucher="voucher"
                />
              </div>

              <div
                v-else
                class="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-10 flex flex-col items-center text-center"
              >
                <div class="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-3">
                  <UIcon
                    name="i-lucide-ticket-percent"
                    class="size-7 text-orange-200"
                  />
                </div>
                <p class="text-gray-700 font-bold text-sm">
                  Bạn chưa có voucher
                </p>
                <p class="text-gray-400 text-xs mt-1">
                  Voucher dành cho khách cũ sẽ xuất hiện tại đây.
                </p>
              </div>
            </section>

            <!-- Ưu đãi được chọn trong form đặt xe, không chọn trên trang này -->
            <div class="flex justify-center pt-1">
              <UButton
                to="/"
                size="lg"
                class="rounded-xl font-black px-8 shadow-md shadow-primary/25"
              >
                <UIcon
                  name="i-lucide-car"
                  class="size-5"
                />
                Đặt xe ngay
              </UButton>
            </div>
          </template>
        </div>
      </UContainer>
    </div>
  </ClientOnly>
</template>

<script lang="ts" setup>
import type { CustomerVoucher, ReferralCreditDetail, ReferralCreditSummary } from '~/type'
import { offerService } from '~/services/offer.service'

const { token } = useAuth()

const isLoading = ref(true)
const errorMsg = ref('')
const vouchers = ref<CustomerVoucher[]>([])
const creditDetails = ref<ReferralCreditDetail[]>([])
const creditSummary = ref<ReferralCreditSummary>({
  balance: 0,
  reserved_amount: 0,
  max_rate: 0,
  next_expiring_amount: null,
  next_expires_at: null
})

useSeoMeta({
  title: 'Ưu đãi của tôi',
  description: 'Xem voucher và số dư giới thiệu của bạn trên Happy Trip.'
})

/** Lỗi 400 trả dạng text — lấy nguyên văn để hiển thị */
function extractErrorMessage(error: unknown): string {
  const err = error as { data?: unknown, message?: string }
  if (typeof err?.data === 'string' && err.data.trim()) return err.data
  if (err?.data && typeof err.data === 'object' && 'message' in err.data) {
    const msg = (err.data as { message?: unknown }).message
    if (typeof msg === 'string' && msg.trim()) return msg
  }
  return err?.message || 'Có lỗi xảy ra khi tải ưu đãi. Vui lòng thử lại.'
}

function isUnauthorized(error: unknown): boolean {
  const err = error as { status?: number, statusCode?: number, response?: { status?: number } }
  return err?.status === 401 || err?.statusCode === 401 || err?.response?.status === 401
}

async function fetchOffers() {
  if (!token.value) {
    await navigateTo('/login')
    return
  }

  isLoading.value = true
  errorMsg.value = ''

  try {
    const [voucherList, credits] = await Promise.all([
      offerService.getVouchers(token.value),
      offerService.getReferralCredits(token.value)
    ])

    vouchers.value = voucherList || []
    creditDetails.value = credits?.details || []
    if (credits?.summary) {
      creditSummary.value = credits.summary
    }
  } catch (error) {
    if (isUnauthorized(error)) {
      await navigateTo('/login')
      return
    }
    errorMsg.value = extractErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchOffers)
</script>
