import { calculatePartnerOrder } from '../../utils/partner-api'
import { normalizeCityName, normalizeWardName, sanitizeBookingFields } from '../../utils/address-normalizer'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {}

  // Chuẩn hóa và làm sạch dữ liệu đầu vào
  const sanitized = sanitizeBookingFields({
    pickupArea: body.pickupArea || body.departure_city,
    pickupWard: body.pickupWard || body.departure_district || body.departure_dictrict,
    pickupDetail: body.pickupDetail || body.departure_address_1,
    dropoffArea: body.dropoffArea || body.destination_city,
    dropoffWard: body.dropoffWard || body.destination_district || body.destination_dictrict,
    dropoffDetail: body.dropoffDetail || body.destination_address_1,
    date: body.date,
    time: body.time,
    car: body.car
  })

  const depCity = normalizeCityName(sanitized.pickupArea) || 'TP Hồ Chí Minh'
  const depDistrict = normalizeWardName(sanitized.pickupWard) || 'Phường Bàn Cờ'
  const depAddress = sanitized.pickupDetail || 'LH'

  const destCity = normalizeCityName(sanitized.dropoffArea) || 'TP Hồ Chí Minh'
  const destDistrict = normalizeWardName(sanitized.dropoffWard) || 'Phường Vũng Tàu'
  const destAddress = sanitized.dropoffDetail || 'LH'

  // Xác định id_service theo loại xe
  const is7Seats = (body.car && body.car.includes('7')) || body.service_id === '66947cea17482239472b88e8' || body.id_service === '66947cea17482239472b88e8'
  const serviceId = is7Seats ? '66947cea17482239472b88e8' : (body.service_id || body.id_service || '66947d0917482239472b9807')

  // Xác định thời gian đón
  let dateOfDestination = new Date()
  if (sanitized.date) {
    const timeParts = sanitized.time ? sanitized.time.split(':') : ['07', '00']
    const [year, month, day] = sanitized.date.split('-').map(Number)
    const h = Number(timeParts[0] || 7) - 7
    const m = Number(timeParts[1] || 0)
    dateOfDestination = new Date(Date.UTC(year || 2026, (month || 1) - 1, day || 1, h, m))
  } else {
    dateOfDestination.setDate(dateOfDestination.getDate() + 1)
  }

  try {
    const result = await calculatePartnerOrder({
      departure_city: depCity,
      departure_district: depDistrict,
      departure_address_1: depAddress,
      destination_city: destCity,
      destination_district: destDistrict,
      destination_address_1: destAddress,
      date_of_destination: dateOfDestination.toISOString(),
      id_service: serviceId,
      car: sanitized.car
    })

    return {
      distance: result.distance || 99,
      duration: result.duration || 150,
      price: result.price_guest_after || result.price || (is7Seats ? 850000 : 750000),
      original_price: result.price_guest || result.original_price || (is7Seats ? 850000 : 750000),
      discount_price: result.price_guest_after || result.price || (is7Seats ? 850000 : 750000),
      service_id: serviceId,
      service_name: is7Seats ? 'Bao chuyến 7 chỗ (1 chiều)' : 'Bao chuyến 5 chỗ (1 chiều)',
      car_type: is7Seats ? '7 chỗ' : '5 chỗ',
      previews: result.previews || []
    }
  } catch (error: any) {
    console.warn('[CalculateAPI] Error calculating price, using fallback estimation:', error.message)
    const fallbackPrice = is7Seats ? 850000 : 750000
    return {
      distance: 99,
      duration: 150,
      price: fallbackPrice,
      original_price: fallbackPrice,
      discount_price: fallbackPrice,
      service_id: serviceId,
      service_name: is7Seats ? 'Bao chuyến 7 chỗ (1 chiều)' : 'Bao chuyến 5 chỗ (1 chiều)',
      car_type: is7Seats ? '7 chỗ' : '5 chỗ',
      previews: []
    }
  }
})
