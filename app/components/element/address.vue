<template>
  <div class="grid grid-cols-2 gap-2">

    <USelectMenu
      v-model="selectedCityId"
      :items="filteredCities"
      label-key="name"
      value-key="id"
      :leading-icon="props.icon"
      :placeholder="`${props.label} — Tỉnh / TP`"
      :search-input="{ placeholder: 'Tìm tỉnh / thành phố...' }"
      color="neutral"
      variant="outline"
      size="sm"
      class="col-span-1 w-full"
      @update:model-value="onCityChange"
    />

    <USelectMenu
      v-model="selectedDistrictName"
      :items="availableDistrictNames"
      leading-icon="i-lucide-map"
      placeholder="Phường / Xã"
      :search-input="{ placeholder: 'Tìm phường / xã...' }"
      :disabled="!selectedCityId"
      color="neutral"
      variant="outline"
      size="sm"
      class="col-span-1 w-full"
      @update:model-value="onDistrictChange"
    />

    <UInput
      v-model="detailAddress"
      leading-icon="i-lucide-house"
      placeholder="Số nhà, tên đường..."
      :disabled="!selectedDistrictName"
      color="neutral"
      variant="outline"
      size="sm"
      class="col-span-2 w-full"
      @input="emit('update:address', detailAddress)"
    />

  </div>
</template>

<script lang="ts" setup>
interface City {
  id: string
  name: string
}

interface District {
  status: boolean
  name: string
}

interface CityResponse {
  id: string
  districts: District[]
}

const props = defineProps<{
  icon: string
  label: string
  placeholder: string
  excludeCity?: string
  province: string
  city: string
  address: string
}>()

const emit = defineEmits<{
  (e: 'update:province', value: string): void
  (e: 'update:city', value: string): void
  (e: 'update:address', value: string): void
}>()

// ─── dùng id để USelectMenu khớp kiểu giá trị emit ra ───
const selectedCityId = ref<string>('')
const selectedDistrictName = ref<string>('')
const detailAddress = ref('')

const { data: cities } = useFetch<City[]>('https://sys.happytrip.vn/api/city/list', {
  method: 'POST',
  body: { status: true },
  params: { fields: 'id,name' },
})

const { data: cityData, execute: fetchDistricts } = useFetch<CityResponse>(
  () => `https://sys.happytrip.vn/api/city/${selectedCityId.value}`,
  { method: 'GET', immediate: false },
)

const filteredCities = computed(() => {
  if (!cities.value) return []
  return [...cities.value]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(c => c.id !== props.excludeCity)
})

const availableDistrictNames = computed(() => {
  return cityData.value?.districts
    ?.filter(d => d.status)
    .map(d => d.name) ?? []
})

async function onCityChange(cityId: string) {
  selectedDistrictName.value = ''
  detailAddress.value = ''
  emit('update:province', '')
  emit('update:address', '')

  const city = cities.value?.find(c => c.id === cityId)
  if (city) {
    emit('update:city', city.name)
    await fetchDistricts()
  }
}

function onDistrictChange(district: string) {
  emit('update:province', district)
  detailAddress.value = ''
  emit('update:address', '')
}
</script>
