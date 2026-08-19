<template>
  <div class="grid grid-cols-2 gap-2 text-left">
    <UFormField
      size="sm"
      :name="namePrefix ? `${namePrefix}_city` : undefined"
      class="col-span-1 w-full"
      :ui="{ error: 'text-xs text-left' }"
    >
      <USelectMenu
        v-model="selectedCityId"
        :ui="{ leadingIcon: 'text-primary' }"
        :items="filteredCities"
        label-key="name"
        value-key="id"
        :leading-icon="props.icon"
        placeholder="Tỉnh / TP"
        :search-input="{ placeholder: 'Tìm kiếm...' }"
        color="neutral"
        variant="outline"
        class="w-full"
        aria-label="Tỉnh / Thành phố"
        @update:model-value="onCityChange"
      />
    </UFormField>

    <UFormField
      size="sm"
      :name="namePrefix ? `${namePrefix}_dictrict` : undefined"
      class="col-span-1 w-full"
      :ui="{ error: 'text-xs text-left' }"
    >
      <USelectMenu
        v-model="selectedDistrictName"
        :items="availableDistrictNames"
        :ui="{ leadingIcon: 'text-primary' }"
        leading-icon="i-lucide-map"
        placeholder="Phường / Xã"
        :search-input="{ placeholder: 'Tìm kiếm...' }"
        :disabled="!selectedCityId"
        color="neutral"
        variant="outline"
        class="w-full"
        aria-label="Phường / Xã"
        @update:model-value="onDistrictChange"
      />
    </UFormField>

    <UFormField
      size="sm"
      :name="namePrefix ? `${namePrefix}_address_1` : undefined"
      class="col-span-2 w-full"
      :ui="{ error: 'text-xs text-left' }"
    >
      <UInput
        v-model="detailAddress"
        leading-icon="i-lucide-house"
        :ui="{ leadingIcon: 'text-primary' }"
        placeholder="Số nhà, tên đường..."
        :disabled="!selectedDistrictName"
        color="neutral"
        variant="outline"
        class="w-full"
        @blur="onAddressBlur"
      />
    </UFormField>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  icon: string
  label: string
  placeholder: string
  province: string
  city: string
  address: string
  namePrefix: string
  excludeDistrict: string
}>()

const emit = defineEmits<{
  (e: 'update:province', value: string): void
  (e: 'update:city', value: string): void
  (e: 'update:address', value: string): void
}>()

// ─── dùng composable để cache city data ───
const { cities, fetchCities, fetchCityDetail, getCachedCityDetail } = useCityData()

// ─── dùng id để USelectMenu khớp kiểu giá trị emit ra ───
const selectedCityId = ref<string>('')
const selectedDistrictName = ref<string>('')
const detailAddress = ref('')

const cityData = computed(() => {
  if (!selectedCityId.value) return null
  return getCachedCityDetail(selectedCityId.value)
})

onMounted(() => {
  fetchCities()
})

watch(() => cities.value, (newCities) => {
  // Khi cities load xong, nếu có props.city thì set selectedCityId
  if (newCities && newCities.length > 0 && props.city) {
    const city = newCities.find(c => c.name === props.city)
    if (city && selectedCityId.value !== city.id) {
      selectedCityId.value = city.id
      fetchCityDetail(city.id)
    }
  }
})

const filteredCities = computed(() => {
  if (!cities.value) return []
  return [...cities.value].sort((a, b) => {
    const nameA = a.name.trim().toLowerCase()
    const nameB = b.name.trim().toLowerCase()

    // 1. Đưa Thành phố Hồ Chí Minh lên vị trí đầu tiên
    const isHcmA = nameA.includes('hồ chí minh') || nameA.includes('sai gon') || nameA.includes('sài gòn')
    const isHcmB = nameB.includes('hồ chí minh') || nameB.includes('sai gon') || nameB.includes('sài gòn')
    if (isHcmA && !isHcmB) return -1
    if (!isHcmA && isHcmB) return 1

    // 2. Đưa Thành phố Cần Thơ lên vị trí thứ hai
    const isCanThoA = nameA.includes('cần thơ') || nameA.includes('can tho')
    const isCanThoB = nameB.includes('cần thơ') || nameB.includes('can tho')
    if (isCanThoA && !isCanThoB) return -1
    if (!isCanThoA && isCanThoB) return 1

    // 3. Các tỉnh/thành phố khác sắp xếp theo bảng chữ cái Tiếng Việt
    return a.name.localeCompare(b.name, 'vi')
  })
})

const availableDistrictNames = computed(() => {
  return (
    cityData.value?.districts
      ?.filter(d => d.status && d.name !== props.excludeDistrict)
      .map(d => d.name) ?? []
  )
})

// Tự động chọn phường/xã đầu tiên nếu chưa chọn hoặc không hợp lệ
watch(availableDistrictNames, (districts) => {
  if (districts && districts.length > 0) {
    if (!selectedDistrictName.value || !districts.includes(selectedDistrictName.value)) {
      const firstDistrict = districts[0]
      if (firstDistrict) {
        selectedDistrictName.value = firstDistrict
        emit('update:province', firstDistrict)
      }
    }
  }
}, { immediate: true })

async function onCityChange(cityId: string) {
  selectedDistrictName.value = ''
  detailAddress.value = ''
  emit('update:province', '')
  emit('update:address', '')

  const city = cities.value?.find(c => c.id === cityId)
  if (city) {
    emit('update:city', city.name)
    await fetchCityDetail(cityId)
  }
}

function onDistrictChange(district: string) {
  emit('update:province', district)
  detailAddress.value = ''
  emit('update:address', '')
}

function onAddressBlur() {
  emit('update:address', detailAddress.value)
}

watch(() => props.address, (val) => {
  if (val !== detailAddress.value) detailAddress.value = val
})

watch(() => props.city, async (val) => {
  if (!val) {
    selectedCityId.value = ''
    selectedDistrictName.value = ''
  } else {
    // Nếu cities đã load, tìm và set ngay
    if (cities.value && cities.value.length > 0) {
      const city = cities.value.find(c => c.name === val)
      if (city) {
        selectedCityId.value = city.id
        await fetchCityDetail(city.id)
      }
    }
    // Nếu cities chưa load, watch trên cities.value sẽ handle
  }
})

watch(() => props.province, (val) => {
  if (val !== selectedDistrictName.value) {
    selectedDistrictName.value = val
    if (!val && availableDistrictNames.value.length > 0) {
      const firstDistrict = availableDistrictNames.value[0]
      if (firstDistrict) {
        selectedDistrictName.value = firstDistrict
        emit('update:province', firstDistrict)
      }
    }
  }
})
</script>
