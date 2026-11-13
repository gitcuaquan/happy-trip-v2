import { createPartnerOrder } from '../../utils/partner-api'
import { normalizeCityName, normalizeWardName, sanitizeBookingFields } from '../../utils/address-normalizer'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {}

  const phone = (body.customer_phone || body.phone || '').trim()
  if (!phone) {
    return {
      success: false,
      message: 'Vui lòng cung cấp số điện thoại liên hệ.'
    }
  }

  const fullName = (body.customer_name || body.full_name || 'Khách đặt qua AI Voice').trim()

  // Chuẩn hóa địa chỉ
  const sanitized = sanitizeBookingFields({
    pickupArea: body.pickupArea || body.departure_city,
    pickupWard: body.pickupWard || body.departure_district || body.departure_dictrict,
    pickupDetail: body.pickupDetail || body.departure_address_1,
    dropoffArea: body.dropoffArea || body.destination_city,
    dropoffWard: body.dropoffWard || body.destination_district || body.destination_dictrict,
    dropoffDetail: body.dropoffDetail || body.destination_address_1,
    date: body.date,
    time: body.time,
    car: body.car,
    passengers: body.passengers,
    notes: body.notes
  })

  const depCity = normalizeCityName(sanitized.pickupArea) || 'TP Hồ Chí Minh'
  const depDistrict = normalizeWardName(sanitized.pickupWard) || 'Phường Bàn Cờ'
  const depAddress = sanitized.pickupDetail || 'LH'

  const destCity = normalizeCityName(sanitized.dropoffArea) || 'TP Hồ Chí Minh'
  const destDistrict = normalizeWardName(sanitized.dropoffWard) || 'Phường Vũng Tàu'
  const destAddress = sanitized.dropoffDetail || 'LH'

  // Xác định id_service
  const is7Seats = (sanitized.car && sanitized.car.includes('7')) || body.service_id === '66947cea17482239472b88e8' || body.id_service === '66947cea17482239472b88e8'
  const serviceId = is7Seats ? '66947cea17482239472b88e8' : (body.service_id || body.id_service || '66947d0917482239472b9807')

  // Xác định ngày đón
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

  // Tổng hợp ghi chú
  const noteParts = []
  if (sanitized.passengers) noteParts.push(`Số khách: ${sanitized.passengers}`)
  if (sanitized.notes) noteParts.push(`Ghi chú: ${sanitized.notes}`)
  noteParts.push('Đơn đặt qua trợ lý AI Voice Happy Trip')
  const finalNote = noteParts.join(' | ')

  try {
    const result = await createPartnerOrder({
      departure_city: depCity,
      departure_district: depDistrict,
      departure_address_1: depAddress,
      destination_city: destCity,
      destination_district: destDistrict,
      destination_address_1: destAddress,
      date_of_destination: dateOfDestination.toISOString(),
      id_service: serviceId,
      full_name: fullName,
      phone,
      note: finalNote,
      partner_code: body.partner_code || 'ai_cs',
      price: body.price,
      price_guest: body.price_guest,
      price_guest_after: body.price_guest_after
    })

    return {
      success: result.success,
      order_id: result.order_id,
      short_id: result.short_id,
      message: result.message,
      order: result.data
    }
  } catch (error: any) {
    console.error('[CreateOrderAPI] Error:', error.message)
    return {
      success: false,
      message: error.message || 'Lỗi khi tạo đơn hàng đối tác.'
    }
  }
})
