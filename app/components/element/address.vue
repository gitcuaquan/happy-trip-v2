<template>
  <div class="grid grid-cols-2 gap-2 text-left">
    <UFormField size="sm" :name="namePrefix ? `${namePrefix}_city` : undefined" class="col-span-1 w-full"
      :ui="{ error: 'text-xs text-left' }">
      <USelectMenu v-model="selectedCityId" :ui="{ leadingIcon: 'text-primary' }" :items="filteredCities"
        label-key="name" value-key="id" :leading-icon="props.icon" placeholder="Tỉnh / TP"
        :search-input="{ placeholder: 'Tìm kiếm...' }" color="neutral" variant="outline" class="w-full"
        @update:model-value="onCityChange" />
    </UFormField>

    <UFormField size="sm" :name="namePrefix ? `${namePrefix}_dictrict` : undefined" class="col-span-1 w-full"
      :ui="{ error: 'text-xs text-left' }">
      <USelectMenu v-model="selectedDistrictName" :items="availableDistrictNames" :ui="{ leadingIcon: 'text-primary' }"
        leading-icon="i-lucide-map" placeholder="Phường / Xã" :search-input="{ placeholder: 'Tìm kiếm...' }"
        :disabled="!selectedCityId" color="neutral" variant="outline" class="w-full"
        @update:model-value="onDistrictChange" />
    </UFormField>

    <UFormField size="sm" :name="namePrefix ? `${namePrefix}_address_1` : undefined" class="col-span-2 w-full"
      :ui="{ error: 'text-xs text-left' }">
      <UInput v-model="detailAddress" leading-icon="i-lucide-house" :ui="{ leadingIcon: 'text-primary' }"
        placeholder="Số nhà, tên đường..." :disabled="!selectedDistrictName" color="neutral" variant="outline"
        class="w-full" @update:model-value="emit('update:address', $event)" />
    </UFormField>
  </div>
</template>
<script lang="ts" setup>
interface City {
  id: string;
  name: string;
}

interface District {
  status: boolean;
  name: string;
}

interface CityResponse {
  id: string;
  districts: District[];
}

const props = defineProps<{
  icon: string;
  label: string;
  placeholder: string;
  province: string;
  city: string;
  address: string;
  namePrefix: string;
  excludeDistrict: string
}>();

const emit = defineEmits<{
  (e: "update:province", value: string): void;
  (e: "update:city", value: string): void;
  (e: "update:address", value: string): void;
}>();

// ─── dùng id để USelectMenu khớp kiểu giá trị emit ra ───
const selectedCityId = ref<string>("");
const selectedDistrictName = ref<string>("");
const detailAddress = ref("");

const cities = ref<City[]>([]);
const cityData = ref<CityResponse | null>(null);

async function fetchCities() {
  try {
    cities.value = await $fetch<City[]>(
      "https://sys.happytrip.vn/api/city/list",
      {
        method: "POST",
        body: { status: true },
        params: { fields: "id,name" },
      },
    );
  } catch {
    cities.value = [];
  }
}

async function fetchDistricts() {
  if (!selectedCityId.value) {
    cityData.value = null;
    return;
  }

  try {
    cityData.value = await $fetch<CityResponse>(
      `https://sys.happytrip.vn/api/city/${selectedCityId.value}`,
      {
        method: "GET",
      },
    );
  } catch {
    cityData.value = null;
  }
}

onMounted(() => {
  fetchCities();
  console.log("Address component mounted, fetching cities...");
});

watch(() => cities.value, (newCities) => {
  // Khi cities load xong, nếu có props.city thì set selectedCityId
  if (newCities && newCities.length > 0 && props.city) {
    const city = newCities.find((c) => c.name === props.city)
    if (city && selectedCityId.value !== city.id) {
      selectedCityId.value = city.id
      fetchDistricts()
    }
  }
})

const filteredCities = computed(() => {
  if (!cities.value) return [];
  return [...cities.value]
    .sort((a, b) => a.name.localeCompare(b.name))
});

const availableDistrictNames = computed(() => {
  return (
    cityData.value?.districts
      ?.filter((d) => d.status && d.name !== props.excludeDistrict)
      .map((d) => d.name) ?? []
  );
});


async function onCityChange(cityId: string) {
  selectedDistrictName.value = "";
  detailAddress.value = "";
  emit("update:province", "");
  emit("update:address", "");

  const city = cities.value?.find((c) => c.id === cityId);
  if (city) {
    emit("update:city", city.name);
    await fetchDistricts();
  }
}

function onDistrictChange(district: string) {
  emit("update:province", district);
  detailAddress.value = "";
  emit("update:address", "");
}

watch(() => props.address, (val) => {
  if (val !== detailAddress.value) detailAddress.value = val
})

watch(() => props.city, async (val) => {
  if (!val) {
    selectedCityId.value = ''
    selectedDistrictName.value = ''
    cityData.value = null
  } else {
    // Nếu cities đã load, tìm và set ngay
    if (cities.value && cities.value.length > 0) {
      const city = cities.value.find((c) => c.name === val)
      if (city) {
        selectedCityId.value = city.id
        await fetchDistricts()
      }
    }
    // Nếu cities chưa load, watch trên cities.value sẽ handle
  }
})

watch(() => props.province, (val) => {
  if (val !== selectedDistrictName.value) {
    selectedDistrictName.value = val
  }
})

</script>
