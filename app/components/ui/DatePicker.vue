<script setup lang="ts">
import {
  CalendarDate,
  DateFormatter,
  type DateValue,
  Time,
  parseAbsoluteToLocal,
} from "@internationalized/date";

const dateFormatter = new DateFormatter("vi-VN", {
  dateStyle: "medium",
});


const props = defineProps<{
  modelValue?: Date | null;
  hideTimeInput?: boolean;
  noDefault?: boolean;
  allowPast?: boolean; 
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: Date | string | null): void;
}>();

// Cập nhật thời gian hiện tại mỗi giây để đảm bảo rằng minDate và minTimeOfMinDate luôn chính xác
const now  = shallowRef(new Date());

let timer: ReturnType<typeof setInterval> | null = null;

onMounted(()=>{
  timer = setInterval(() => {
    now.value = new Date();
  }, 1000);
})

onUnmounted(()=>{
  if(timer) clearInterval(timer);
})

// Tính toán ngày giờ tối thiểu dựa trên thời gian hiện tại = hiện tại + 1 tiếng 
const minDateTime = computed(()=> {
  const d = new Date(now.value);
  d.setHours(d.getHours() + 1);
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

const modelValue = shallowRef(
  props.modelValue
    ? new CalendarDate(
        props.modelValue.getFullYear(),
        props.modelValue.getMonth() + 1,
        props.modelValue.getDate(),
      )
    : props.noDefault ? null : minDate.value // mặc định: ngày của mốc tối thiểu (hiện tại + 1h)
);
// Chặn các ngày trước minDate (trừ khi allowPast) 
const isDateUnavailable = (date: DateValue) => {
  if(props.allowPast) return false;
  return date.compare(minDate.value) < 0;
};
const time = shallowRef(
  props.modelValue
    ? new Time(
        props.modelValue.getHours(), // nếu đã có ngày giờ được chọn thì giờ sẽ là giờ của ngày đó
        props.modelValue.getMinutes(), // nếu đã có ngày giờ được chọn thì phút sẽ là phút của ngày đó
        props.modelValue.getSeconds(), // nếu đã có ngày giờ được chọn thì giây sẽ là giây của ngày đó
      )
    :  minTimeOfMinDate.value, // mặc định: giờ của mốc tối thiểu
);

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
          size="md"
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
          class="p-4"
        />
      </template>
    </UPopover>

    <UInputTime v-if="!hideTimeInput" :ui="{ leadingIcon: 'text-primary' }" v-model="time" icon="i-lucide-alarm-clock" :is-time-unavailable="isTimeUnavailable" />
  </div>
</template>
