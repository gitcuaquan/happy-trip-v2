<template>
  <section class="py-24" id="about">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-20 items-center">
        <div class="relative">
          <div
            class="absolute -top-10 -left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          ></div>
          <div
            class="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800"
          >
            <img
              alt="Xe du lịch cao cấp"
              class="w-full object-cover aspect-[4/5]"
              src="/images/about.png"
            />
          </div>
          <div
            class="absolute animate-bounce [animation-duration:5s] -bottom-10 right-0 md:-right-6 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl z-20 border border-slate-100 dark:border-slate-700 max-w-xs"
          >
            <div class="flex items-center gap-4 mb-4">
              <div
                class="bg-primary/10 p-3 rounded-lg flex items-center justify-center text-primary"
              >
                <UIcon name="i-lucide-shield-check" class="size-7" />
              </div>
              <div>
                <p
                  class="text-[10px] text-slate-500 font-bold uppercase tracking-widest"
                >
                  Đã kiểm chứng
                </p>
                <p class="text-2xl font-black">10,000+</p>
              </div>
            </div>
            <p class="text-xs text-slate-500 leading-relaxed">
              Hàng ngàn chuyến đi an toàn mỗi tháng được thực hiện bởi Happy
              Trip.
            </p>
          </div>
        </div>
        <div>
          <h2
            class="text-primary font-bold uppercase tracking-widest text-sm mb-4"
          >
            Vì sao chọn chúng tôi?
          </h2>
          <h3 class="text-4xl lg:text-5xl font-extrabold mb-10 leading-tight">
            Dịch vụ đặt xe <span class="text-primary">Tin Cậy</span> hàng đầu
            Việt Nam.
          </h3>
          <div class="space-y-8">
            <div class="flex gap-6">
              <div
                class="flex-shrink-0 w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center text-primary"
              >
                <UIcon name="i-lucide-shield" class="text-3xl" />
              </div>
              <div>
                <h4 class="text-xl font-bold mb-2">An toàn tuyệt đối</h4>
                <p
                  class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed"
                >
                  Tất cả tài xế được tuyển chọn kỹ lưỡng, khám sức khỏe định kỳ
                  và có hồ sơ lái xe chuyên nghiệp sạch sẽ.
                </p>
              </div>
            </div>
            <div class="flex gap-6">
              <div
                class="flex-shrink-0 w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center text-primary"
              >
                <UIcon name="i-lucide-tag" class="text-3xl" />
              </div>
              <div>
                <h4 class="text-xl font-bold mb-2">
                  Giá cước rẻ &amp; Rõ ràng
                </h4>
                <p
                  class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed"
                >
                  Giá trọn gói được thông báo ngay khi đặt, cam kết không phát
                  sinh bất kỳ chi phí ẩn nào khác trên hành trình.
                </p>
              </div>
            </div>
            <div class="flex gap-6">
              <div
                class="flex-shrink-0 w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center text-primary"
              >
                <UIcon name="i-lucide-clock" class="text-3xl" />
              </div>
              <div>
                <h4 class="text-xl font-bold mb-2">Đúng giờ, Đúng hẹn</h4>
                <p
                  class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed"
                >
                  Chúng tôi trân trọng thời gian của khách hàng. Xe luôn đến
                  trước 10-15 phút để chuẩn bị đón khách.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup></script>

<style></style>
