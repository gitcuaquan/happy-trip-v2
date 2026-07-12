interface City {
  id: string
  name: string
}

interface District {
  status: boolean
  name: string
}

interface CityDetail {
  id: string
  districts: District[]
}

export function useCityData() {
  const cities = useState<City[]>('city-list', () => [])
  const cityDetailCache = useState<Record<string, CityDetail>>('city-detail-cache', () => ({}))
  const citiesLoading = useState<boolean>('city-list-loading', () => false)
  const cityDetailLoading = useState<Record<string, boolean>>('city-detail-loading', () => ({}))

  // Dùng promise để tránh race condition khi 2 component cùng gọi fetchCities
  let citiesPromise: Promise<City[]> | null = null

  async function fetchCities(): Promise<City[]> {
    // Đã có data → trả về luôn
    if (cities.value.length > 0) return cities.value

    // Đang load → chờ promise cũ
    if (citiesPromise) return citiesPromise

    citiesLoading.value = true
    citiesPromise = $fetch<City[]>(
      `${useRuntimeConfig().public.apiBase}/api/city/list`,
      {
        method: 'POST',
        body: { status: true },
        params: { fields: 'id,name' },
      }
    ).then((data) => {
      cities.value = data
      return data
    }).catch(() => {
      cities.value = []
      return [] as City[]
    }).finally(() => {
      citiesLoading.value = false
      citiesPromise = null
    })

    return citiesPromise
  }

  // Dùng map promise để tránh race condition khi 2 component cùng gọi fetchCityDetail
  const cityDetailPromises = new Map<string, Promise<CityDetail | null>>()

  async function fetchCityDetail(cityId: string): Promise<CityDetail | null> {
    if (!cityId) return null

    // Đã có cache → trả về luôn
    if (cityDetailCache.value[cityId]) return cityDetailCache.value[cityId]

    // Đang load → chờ promise cũ
    if (cityDetailPromises.has(cityId)) return cityDetailPromises.get(cityId)!

    cityDetailLoading.value[cityId] = true

    const promise = $fetch<CityDetail>(
      `${useRuntimeConfig().public.apiBase}/api/city/${cityId}`,
      { method: 'GET' }
    ).then((data) => {
      cityDetailCache.value[cityId] = data
      return data
    }).catch(() => {
      return null
    }).finally(() => {
      cityDetailLoading.value[cityId] = false
      cityDetailPromises.delete(cityId)
    })

    cityDetailPromises.set(cityId, promise)
    return promise
  }

  function getCachedCityDetail(cityId: string): CityDetail | null {
    return cityDetailCache.value[cityId] || null
  }

  return {
    cities,
    citiesLoading,
    fetchCities,
    fetchCityDetail,
    getCachedCityDetail,
  }
}
