<template>
  <UContainer class="py-10">
    <!-- ── Header ──────────────────────────────────────────────────── -->
    <div class="text-center mb-12">
      <h2 class="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6" v-html="contact.title">
      </h2>
      <div class="w-20 h-2 bg-primary mx-auto rounded-full"></div>
      <p class="mt-4 text-gray-500 mx-w-xl mx-auto text-base">
        {{ contact.description }}
      </p>
    </div>


    <!-- ── Main Grid ───────────────────────────────────────────────── -->
    <div class="grid gap-8 lg:grid-cols-2 items-stretch">

      <!-- LEFT ─────────────────────────────────────────────────────── -->
      <div class="flex flex-col gap-5">
        <UCard :ui="{
          root: 'border border-primary-100 shadow-sm shadow-primary-50/50',
          body: 'p-7'
        }">
          <p class="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
            {{ contact.information }}
          </p>

          <div class="divide-y divide-slate-100">
            <NuxtLink v-for="item in contact.info" :key="item.label" :to="item.href ?? undefined"
              :external="!!item.href" :target="item.href?.startsWith('http') ? '_blank' : undefined"
              :class="{ 'pointer-events-none': !item.href }"
              class="group -mx-3 flex items-start gap-4 rounded-xl px-3 py-4 transition-colors hover:bg-primary-50/60">
              <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-100/70">
                <UIcon :name="item.icon" class="size-5 text-primary-500" />
              </div>

              <div class="min-w-0">
                <p class="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{{ item.label }}
                </p>
                <p class="text-sm font-semibold text-slate-800">{{ item.main }}</p>
                <p class="mt-0.5 text-xs text-slate-500">{{ item.sub }}</p>
              </div>

              <UIcon v-if="item.href" name="i-lucide-chevron-right"
                class="ml-auto mt-1 size-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-400" />
            </NuxtLink>
          </div>
        </UCard>
        <!-- Map -->
        <div class="overflow-hidden rounded-xl border border-primary-100 shadow-sm">
          <div class="relative">
            <iframe :src="contact.map.embed" :title="contact.map.title" width="100%" height="280"
              style="border: 0; display: block; filter: saturate(0.85) contrast(0.95);" allowfullscreen loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"></iframe>
            <div
              class="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-white/60 to-transparent">
            </div>
            <NuxtLink :to="contact.map.url" external target="_blank"
              class="absolute bottom-3 left-1/2 -translate-x-1/2">
              <UButton color="neutral" size="xs" class="shadow-md shadow-black/10" icon="i-lucide-external-link">
                Xem trên Google Maps
              </UButton>
            </NuxtLink>

          </div>
        </div>

      </div>

      <!-- RIGHT ────────────────────────────────────────────────────── -->
      <div>
        <UCard :ui="{
          root: 'border border-primary-100 shadow-sm shadow-primary-50/50 overflow-hidden',
          body: 'p-7'
        }">
          <!-- Success state -->
          <Transition name="scale-fade" mode="out-in">
            <div v-if="isSuccess" class="flex flex-col items-center justify-center gap-5 py-14 text-center">
              <div
                class="flex size-20 items-center justify-center rounded-full bg-primary-100 ring-8 ring-primary-50 animate-pulse">
                <UIcon name="i-lucide-check" class="size-10 text-primary-500 animate-check" />
              </div>
              <div>
                <h4 class="text-xl font-bold text-slate-800">{{ contact.success.title }}</h4>
                <p class="mt-1.5 text-sm text-slate-800">{{ contact.success.description }}</p>
              </div>
              <UButton variant="outline" color="primary" icon="i-lucide-rotate-ccw" @click="resetForm()">
                {{ contact.success.return }}
              </UButton>
            </div>

            <!-- ── Form state ── -->
            <div v-else key="form">
              <div class="mb-6 text-center">
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
                  {{ contact.form.header.send }}
                </p>
                <h4 class="text-xl font-bold text-slate-800">
                  {{ contact.form.header.title }}
                </h4>
                <p class="mt-1 text-sm text-slate-500">
                  {{ contact.form.header.description }}
                </p>
              </div>

              <UForm :schema="schema" :state="form" @submit="onSubmit" class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <UFormField v-for="field in contact.form.fields" :key="field.name" :name="field.name"
                  :label="field.label" :required="field.required"
                  :class="field.fullWidth ? 'col-span-2' : 'sm:col-span-1'" class="col-span-2">
                  <UInput v-if="field.type === 'input'" v-model="form[field.name]" :type="field.inputType || 'text'"
                    :placeholder="field.placeholder" :leading-icon="field.icon" size="xl" class="w-full" :ui="{
                      base: 'h-14 text-base px-4',
                      leading: 'ps-4',
                      leadingIcon: 'size-5'
                    }" />

                  <USelect v-else-if="field.type === 'select'" v-model="form[field.name]"
                    :placeholder="field.placeholder" :leading-icon="field.icon" :items="field.items" value-key="value"
                    label-key="label" size="xl" class="w-full" :ui="{
                      base: 'h-14 text-base px-4',
                      leading: 'ps-4',
                      leadingIcon: 'size-5'
                    }" />

                  <UTextarea v-else-if="field.type === 'textarea'" v-model="form[field.name]"
                    :placeholder="field.placeholder" :rows="5" :maxrows="8" autoresize size="xl" class="w-full" :ui="{
                      base: 'text-base px-4 py-3',
                    }" />
                </UFormField>

                <!-- <UFormField name="agree" class="col-span-2">
                  <div class="flex items-start gap-2.5">
                    <UCheckbox v-model="form.agree" id="agree" :ui="{
                      base: 'mt-0.5'
                    }" />
                    <label for="agree" class="text-sm text-slate-500 leading-relaxed cursor-pointer select-none">
                      Tôi đồng ý với
                      <NuxtLink to="/terms" class="text-primary-500 hover:underline font-medium">điều khoản dịch vụ
                      </NuxtLink>
                      và
                      <NuxtLink to="/privacy" class="text-primary-500 hover:underline font-medium">chính sách bảo mật
                      </NuxtLink>
                      của Happy Trip.
                    </label>
                  </div>
                </UFormField> -->

                <UButton type="submit" color="primary" size="lg" block :loading="isLoading" :disabled="isLoading"
                  trailing class="col-span-2 mt-1 font-semibold tracking-wide" :ui="{
                    base: 'relative justify-center text-base px-4 py-4',
                  }">
                  {{ isLoading ? 'Đang gửi...' : contact.form.header.send }}
                </UButton>
              </UForm>
            </div>
          </Transition>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<script lang="ts" setup>
import { z } from 'zod'
import type { Transition } from 'vue'
import type { FormSubmitEvent } from '@nuxt/ui'


// ─── Types ───────────────────────────────────────────────────────────────────
const schema = z.object({
  fullname: z.string().min(2, 'Vui lòng nhập họ tên (tối thiểu 2 kí tự)').max(100, 'Họ tên quá dài'),
  phone: z.string().min(10, 'số điện thoại không hợp lệ').max(11, 'số điện thoại quá dài').regex(/^\d+$/, 'số điện thoại chỉ được chứa chữ số'),
  email: z.string().nonempty('Vui lòng nhập địa chỉ email').email('Địa chỉ email không hợp lệ'),
  topic: z.string().nonempty('Vui lòng chọn chủ đề liên hệ'),
  message: z.string().min(2, 'Vui lòng nhập nội dung liên hệ'),
  agree: z.boolean().refine(val => val === true, 'Bạn phải đồng ý với chính sách bảo mật để gửi liên hệ')
})

type Schema = z.output<typeof schema>

// ─── State ───────────────────────────────────────────────────────────────────
const form = ref<Schema>({
  fullname: '',
  phone: '',
  email: '',
  topic: '',
  message: '',
  agree: false,
})

const isLoading = ref(false)
const isSuccess = ref(false)

const contact = computed(() => ({
  title: 'Liên hệ với <span class="text-primary"> HAPPY</span> TRIP' as string,
  description: 'Hỗ trợ đặt xe, hợp tác tài xế và chăm sóc khách hàng 24/7 — chúng tôi luôn ở đây khi bạn cần.',
  information: 'Thông tin liên hệ',
  map: {
    url: 'https://maps.google.com/?q=47+Nguyen+Tuan+Ha+Noi',
    embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.099!2d105.7822!3d21.0285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAyJzM0LjMiTiAxMDXCsDQ2JzU1LjgiRQ!5e0!3m2!1svi!2svn!4v1234567890',
    title: 'Bản đồ văn phòng Happy ',
  },
  info: [
    {
      icon: 'i-lucide-phone',
      label: 'TỔNG ĐÀI HỖ TRỢ 24/7',
      main: '097 297 0000',
      sub: 'Miễn phí cước gọi',
      href: 'tel:097 297 0000',
    },
    {
      icon: 'i-lucide-mail',
      label: 'EMAIL LIÊN HỆ',
      main: 'happytripexpress@gmail.com',
      sub: 'Phản hồi trong vòng 2h làm việc',
      href: 'mailto:happytripexpress@gmail.com',
    },
    {
      icon: 'i-lucide-clock',
      label: 'GIỜ LÀM VIỆC',
      main: '7:00 - 22:00 hàng ngày',
      sub: 'Hotline hỗ trợ 24/7 kể cả ngày lễ',
      href: null,
    },
  ],
  form: {
    header: {
      send: 'Gửi tin nhắn',
      title: 'Liên hệ với chúng tôi',
      description: 'HappyTrip sẽ phản hồi bạn sớm nhất!',
    },
    fields: [
      {
        name: 'fullname',
        label: 'Họ tên',
        type: 'input',
        inputType: 'text',
        placeholder: 'Nhập họ tên của bạn',
        icon: 'i-lucide-user',
        required: true,
        fullWidth: false,
      },
      {
        name: 'email',
        label: 'Email',
        type: 'input',
        inputType: 'email',
        placeholder: 'Nhập địa chỉ email của bạn',
        icon: 'i-lucide-mail',
        required: false,
        fullWidth: false
      },
      {
        name: 'phone',
        label: 'Số điện thoại',
        type: 'input',
        inputType: 'tel',
        placeholder: 'Nhập số điện thoại của bạn',
        icon: 'i-lucide-phone',
        required: true,
        fullWidth: true
      },
      {
        name: 'topic',
        label: 'Chủ đề liên hệ',
        type: 'select',
        placeholder: 'Chọn chủ đề liên hệ',
        icon: 'i-lucide-tag',
        required: true,
        fullWidth: true,
        items: [
          { label: 'Đặt xe / Huỷ chuyến', value: 'booking' },
          { label: 'Hợp tác tài xế / Đối tác', value: 'driver' },
          { label: 'Thanh toán / Hoá đơn', value: 'payment' },
          { label: 'Báo cáo sự cố', value: 'incident' },
          { label: 'Khác', value: 'other' },
        ] as Array<{ label: string; value: string }>,
      },
      {
        name: 'message',
        label: 'Nội dung',
        type: 'textarea',
        placeholder: 'Nội dung chi tiết...',
        required: true,
        fullWidth: true
      },
    ] as const,
  },
  success: {
    title: 'Gửi thành công',
    description: 'Cảm ơn bạn đã liên hệ với chúng tôi! Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất có thể.',
    return: 'Quay lại trang chủ',
  }
}))

async function onSubmit(_event: FormSubmitEvent<Schema>) {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    isSuccess.value = true
  } catch (error) {
    console.error('Lỗi khi gửi liên hệ:', error)
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  isSuccess.value = false
  form.value = {
    fullname: '',
    phone: '',
    email: '',
    topic: '',
    message: '',
    agree: false,
  }
}
</script>

<style scoped>
.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.scale-fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.scale-fade-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

.scale-fade-enter-to,
.scale-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

@keyframes checkmark-appear {
  from {
    opacity: 0;
    transform: scale(0.5);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-check {
  animation: checkmark-appear 0.6s ease-out forwards;
  animation-delay: 0.2s;
}
</style>
