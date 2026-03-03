<script setup lang="ts">
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
  type DateValue,
  today,
  Time,
} from "@internationalized/date";

const df = new DateFormatter("vi-VN", {
  dateStyle: "medium",
});
const dateNow = today(getLocalTimeZone());

const modelValue = shallowRef(
  new CalendarDate(dateNow.year, dateNow.month, dateNow.day + 1),
);
const isDateUnavailable = (date: DateValue) => {
  return date.compare(dateNow) <= 0;
};
const time = shallowRef(new Time(12, 30, 0));
</script>

<template>
  <UPopover>
    <UButton
      color="neutral"
      size="xl"
      variant="outline"
      icon="i-lucide-calendar"
    >
      {{
        modelValue
          ? df.format(modelValue.toDate(getLocalTimeZone()))
          : "Hãy chọn ngày"
      }}
    </UButton>

    <template #content>
      <UCalendar
        :is-date-unavailable="isDateUnavailable"
        v-model="modelValue"
        class="p-2"
      />
      <div class="flex justify-center pb-3">
        <UFormField label="Giờ đón" required>
          <UInputTime v-model="time" />
        </UFormField>
      </div>
    </template>
  </UPopover>
</template>
