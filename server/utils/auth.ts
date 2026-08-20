import type { H3Event } from 'h3'
import { verifyAdminToken, type JwtAdminPayload } from './jwt'

export function requireAdminAuth(event: H3Event): JwtAdminPayload {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Vui lòng đăng nhập tài khoản quản trị viên',
    })
  }

  const token = authHeader.substring(7)
  const payload = verifyAdminToken(token)

  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ',
    })
  }

  return payload
}
