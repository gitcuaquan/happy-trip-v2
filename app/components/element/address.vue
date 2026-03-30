<template>
  <UFormField size="lg" :label="props.label" required name="pickup" :ui="{
    label:
      'font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider',
  }" class="w-full text-left"
    :error="(!isOpen && state.district && !state.address) ? 'Vui lòng nhập địa chỉ cụ thể' : undefined">
    <UPopover v-model:open="isOpen">
      <UInput :ui="{
        leadingIcon: 'text-primary',
        base: 'text-left truncate',
      }" :icon="props.icon" :value="addressShow" size="md" readonly class="w-full" />
      <template #content>
        <div class="p-2">
          <UStepper ref="stepper" size="xs" v-model="state.active" class="w-[280px] md:w-[320px]" :items="items">
            <template #city>
              <div class="flex flex-col gap-2">
                <UInput v-model="searchCityQuery" placeholder="Tìm thành phố..." icon="i-lucide-search" size="sm" />
                <div class="max-h-[200px] overflow-auto">
                  <div class="flex flex-col">
                    <template v-for="value in filteredCities" :key="value.id">
                      <div class="flex hover:bg-slate-50 p-1 rounded gap-1 items-center text-sm cursor-pointer"
                        v-if="props.excludeCity != value.id" @click="selectCity(value)">
                        <UIcon name="i-lucide-square-check" v-if="value.id == state.city?.id"
                          class="size-5 bg-primary text-default" />
                        <UIcon name="i-lucide-square" v-else class="size-5" />
                        <div class="font-bold">{{ value.name }}</div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </template>
            <template #district>
              <div class="flex flex-col gap-2">
                <UInput v-model="searchDistrictQuery" placeholder="Tìm quận/huyện..." icon="i-lucide-search"
                  size="sm" />
                <div class="max-h-[200px] overflow-auto">
                  <div class="flex flex-col">
                    <div class="flex hover:bg-slate-50 p-1 rounded gap-1 items-center text-sm cursor-pointer"
                      v-for="value in filteredDistricts" :key="value.name" @click="selectDistrict(value)">
                      <UIcon name="i-lucide-square-check" v-if="value.name == state.district?.name"
                        class="size-5 bg-primary text-default" />
                      <UIcon name="i-lucide-square" v-else class="size-5" />
                      <div class="font-bold">{{ value.name }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template #address>
              <div class="max-h-[200px] overflow-auto">
                <UFormField description="Nhập càng chi tiết càng tốt" label="Địa chỉ cụ thể" class="mb-0 w-full"
                  :error="!state.address ? 'Bắt buộc phải nhập chi tiết' : undefined">
                  <UInput v-model="state.address" ref="inputAddress"
                    @update:model-value="(val) => emit('update:address', String(val))" placeholder="Nhập địa chỉ cụ thể"
                    size="md" class="w-full" />
                </UFormField>
              </div>
            </template>
          </UStepper>
        </div>
      </template>
    </UPopover>
  </UFormField>
</template>

<script lang="ts" setup>
import type { StepperItem } from "@nuxt/ui";

const props = defineProps<{
  icon: string;
  label: string;
  placeholder: string;
  excludeCity?: string;
  province: string;
  city: string;
  address: string;
}>();

const emit = defineEmits<{
  (e: "update:province", value: string): void;
  (e: "update:city", value: string): void;
  (e: "update:address", value: string): void;
}>();
interface City {
  id: string;
  name: string;
}

interface DistrictResponse {
  id: number;
  districts: District[];
}

interface District {
  status: boolean;
  name: string;
}

const isOpen = ref(false);

const state = reactive({
  active: 0,
  city: null as City | null,
  district: null as District | null,
  address: "",
});

const cityAToZ = computed(() => {
  if (!cities.value) return [];
  return [...cities.value]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((city) => city.name !== props.excludeCity);
});

const inputAddress = useTemplateRef("inputAddress");

// Computed chỉ dùng để hiển thị, KHÔNG thay đổi state
const addressShow = computed(() => {
  const addressParts = [];
  if (state.city) {
    addressParts.unshift(state.city.name);
  }
  if (state.district) {
    addressParts.unshift(state.district.name);
  }
  if (state.address.trim() !== "") {
    addressParts.unshift(state.address);
  }
  if (addressParts.length > 0) {
    return addressParts.join(", ");
  }
  return props.placeholder || "Chọn điểm đón";
});

const searchCityQuery = ref("");
const searchDistrictQuery = ref("");

const removeAccents = (str: string) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
};

const filteredCities = computed(() => {
  if (!searchCityQuery.value) return cityAToZ.value;
  const q = removeAccents(searchCityQuery.value);
  return cityAToZ.value.filter((c: City) => removeAccents(c.name).includes(q));
});

const filteredDistricts = computed(() => {
  if (!districts.value?.districts) return [];
  if (!searchDistrictQuery.value) return districts.value.districts;
  const q = removeAccents(searchDistrictQuery.value);
  return districts.value.districts.filter((d: District) => removeAccents(d.name).includes(q));
});

const items = ref<StepperItem[]>([
  {
    title: "Thành phố",
    slot: "city" as const,
  },
  {
    title: "Quận/Huyện",
    slot: "district" as const,
  },
  {
    title: "Địa chỉ cụ thể",
    slot: "address" as const,
  },
]);

const { data: cities } = useFetch<City[]>(
  "https://sys.happytrip.vn/api/city/list",
  {
    method: "POST",
    body: {
      status: true,
    },
    params: {
      fields: "id,name",
    },
  },
);

const { data: districts, execute: fetchDistricts } = useFetch<DistrictResponse>(
  () => `https://sys.happytrip.vn/api/city/${state.city?.id}`,
  {
    method: "GET",
    immediate: false,
  },
);

// Hàm xử lý khi chọn city
const selectCity = async (city: City) => {
  state.city = city;
  state.district = null;
  searchDistrictQuery.value = "";
  emit("update:city", city.name);
  await fetchDistricts();
  state.active = 1;
};

// Hàm xử lý khi chọn district
const selectDistrict = (district: District) => {
  state.district = district;
  state.active = 2; // Chuyển sang bước address
  emit("update:province", district.name);
  // Tự động focus vào input địa chỉ cụ thể khi chọn district
  nextTick(() => {
    inputAddress.value?.inputRef?.focus();
  });
};
</script>
