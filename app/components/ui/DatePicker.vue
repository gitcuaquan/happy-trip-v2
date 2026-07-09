<script setup lang="ts">
import {
  CalendarDate,
  DateFormatter,
  type DateValue,
  Time,
  parseAbsoluteToLocal,
} from "@internationalized/date";

const dateFormatter = new DateFormatter("vi-VN", {
  dateStyle: "full",
});


const props = defineProps<{
  modelValue?: Date | string | null;
  hideTimeInput?: boolean;
  noDefault?: boolean;
  allowPast?: boolean; 
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: Date | string | null): void;
}>();

// Cập nhật thời gian hiện tại mỗi giây để đảm bảo rằng minDate và minTimeOfMinDate luôn chính xác
// Khởi tạo null để tránh hydration mismatch (server vs client time khác nhau)
const now = shallowRef<Date | null>(null);

// Timer removed

// currentNow(): giá trị "now" an toàn — null khi SSR, Date khi client đã sẵn sàng
const currentNow = computed(() => now.value ?? new Date());

onMounted(() => {
  if (!import.meta.client) return;
  // Delay timer đến sau hydration để tránh mismatch
  onNuxtReady(() => {
    now.value = new Date();
  });
})

// Tính toán ngày giờ tối thiểu dựa trên thời gian hiện tại = hiện tại + 30p
const minDateTime = computed(()=> {
  const d = new Date(currentNow.value);
  d.setMinutes(d.getMinutes() + 30); 
  return d;
})

// Ngày tương ứng với mốc tối thiểu (nếu cộng 1h mà sang ngày mới thì minDate cũng tự nhảy sang ngày mới 
const minDate = computed(
  () => 
    new CalendarDate(
      minDateTime.value.getFullYear(),
      minDateTime.value.getMonth() + 1,
      minDateTime.value.getDate(),
    )
)

// Giờ tương ứng với mốc tối thiểu (nếu cộng 1h mà sang ngày mới thì giờ tối thiểu sẽ là 00:00)
const minTimeOfMinDate = computed(
  () => 
    new Time(
      minDateTime.value.getHours(),
      minDateTime.value.getMinutes(),
      minDateTime.value.getSeconds(),
    )
)

const propValue = computed(() =>
  props.modelValue ? new Date(props.modelValue) : null
)

const modelValue = shallowRef<CalendarDate | null>(
  propValue.value
    ? new CalendarDate(
        propValue.value.getFullYear(),
        propValue.value.getMonth() + 1,
        propValue.value.getDate(),
      )
    : null,
);

onMounted(() => {
  if (!import.meta.client) return;
  onNuxtReady(() => {
    if (!modelValue.value && !props.noDefault && minDate.value) {
      modelValue.value = minDate.value;
    }
  });
});
// Chặn các ngày trước minDate (trừ khi allowPast) 
const isDateUnavailable = (date: DateValue) => {
  if(props.allowPast) return false;
  return date.compare(minDate.value) < 0;
};
const time = shallowRef<Time | null>(
  propValue.value
    ? new Time(
        propValue.value.getHours(),
        propValue.value.getMinutes(),
        propValue.value.getSeconds(),
      )
    : null,
);

onMounted(() => {
  if (!import.meta.client) return;
  onNuxtReady(() => {
    if (!time.value && minTimeOfMinDate.value) {
      time.value = minTimeOfMinDate.value;
    }
  });
});

// Chặn giờ < minTime, chỉ khi ngày đang chọn đúng bằng minDate.
// Nếu chọn ngày sau minDate thì không giới hạn giờ.
const isTimeUnavailable = (t: Time) => {
  if(!modelValue.value) return false; // nếu chưa chọn ngày thì không giới hạn giờ
  if(modelValue.value.compare(minDate.value) > 0) return false; // nếu ngày, nếu ngày đã chọn lớn hơn ngày tối thiểu thì không giới hạn giờ
  return t.compare(minTimeOfMinDate.value) < 0; // nếu ngày đã chọn là ngày tối thiểu thì giờ phải lớn hơn giờ tối thiểu
}

// Tự động đẩy time lên minTime nếu:
// - Đổi sang ngày là minDate mà time hiện tại đã nhỏ hơn minTime, hoặc
// - Đang đứng ở minDate và minTime tăng dần theo thời gian thực (do interval mỗi giây)
//   khiến time đã chọn trước đó bị "lọt" vào quá khứ.
watch([modelValue, minTimeOfMinDate], ()=> {
  if(!modelValue || !time.value) return; // nếu chưa chọn ngày hoặc giờ thì không cần kiểm tra
  if(modelValue.value?.compare(minDate.value) === 0 && time.value.compare(minTimeOfMinDate.value) < 0) {
    time.value = minTimeOfMinDate.value; // nếu ngày đã chọn là ngày tối thiểu và giờ đã chọn nhỏ hơn giờ tối thiểu thì cập nhật giờ thành giờ tối thiểu
  }
})

const selectedDateTime = computed(() => {
  if (!modelValue.value || !time.value) return null;

  return new Date(
    modelValue.value.year,
    modelValue.value.month - 1,
    modelValue.value.day,
    time.value.hour,
    time.value.minute,
    time.value.second,
  );
});

watch(
  [modelValue, time],
  ([newDate, newTime]) => {
    if (!newDate || !newTime) {
      emit("update:modelValue", null);
      return;
    }
    const mergedDate = new Date(
      newDate.year,
      newDate.month - 1,
      newDate.day,
      newTime.hour,
      newTime.minute,
      newTime.second,
    );

    emit(
      "update:modelValue",
      parseAbsoluteToLocal(mergedDate.toISOString()).toString().split("+")[0] ||
        null,
    );
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex items-center gap-2">
    <UPopover>
      <slot>
        <UButton
          color="neutral"
          size="sm"
          variant="outline"
          :ui="{ leadingIcon: 'text-primary' }"
          icon="i-lucide-calendar"
          class="w-full flex-3 justify-start text-left"
        >
          {{
            selectedDateTime
              ? dateFormatter.format(selectedDateTime)
              : "Hãy chọn ngày giờ"
          }}
        </UButton>
      </slot>

      <template #content>
        <UCalendar
          :is-date-unavailable="isDateUnavailable"
          v-model="modelValue"
          size="sm"
          class="p-4"
        />
      </template>
    </UPopover>

    <UInputTime size="sm" v-if="!hideTimeInput" :ui="{ leadingIcon: 'text-primary' }" v-model="time" icon="i-lucide-alarm-clock" :is-time-unavailable="(isTimeUnavailable as any)" />
  </div>
</template>
