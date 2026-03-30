<script setup lang="ts">
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
  type DateValue,
  today,
  Time,
  parseAbsoluteToLocal,
} from "@internationalized/date";

const dateTimeFormatter = new DateFormatter("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});
const dateNow = today(getLocalTimeZone());

const props = defineProps<{
  modelValue?: Date | null;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: Date | string | null): void;
}>();

const modelValue = shallowRef(
  props.modelValue
    ? new CalendarDate(
      props.modelValue.getFullYear(),
      props.modelValue.getMonth() + 1,
      props.modelValue.getDate(),
    )
    : dateNow.add({ days: 1 }),
);
const isDateUnavailable = (date: DateValue) => {
  return date.compare(dateNow) <= 0;
};
const time = shallowRef(
  props.modelValue
    ? new Time(
      props.modelValue.getHours(),
      props.modelValue.getMinutes(),
      props.modelValue.getSeconds(),
    )
    : new Time(12, 30, 0),
);

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
  <UPopover>
    <UButton color="neutral" size="md" variant="outline" :ui="{
      leadingIcon: 'text-primary',
    }" icon="i-lucide-calendar" class="w-full flex justify-start text-left">
      {{
        selectedDateTime
          ? dateTimeFormatter.format(selectedDateTime)
          : "Hãy chọn ngày giờ"
      }}
    </UButton>

    <template #content>
      <UCalendar :is-date-unavailable="isDateUnavailable" v-model="modelValue" class="p-4" />
      <div class="flex justify-center pb-3">
        <UFormField label="Giờ đón" required>
          <UInputTime v-model="time" />
        </UFormField>
      </div>
    </template>
  </UPopover>
</template>
