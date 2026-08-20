import bcrypt from 'bcryptjs'
import { Admin } from '../../../models/Admin'
import { generateAdminToken } from '../../../utils/jwt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const username = (body.username || body.phone || '').toString().trim().toLowerCase()
  const password = (body.password || '').toString()

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu',
    })
  }

  const admin = await Admin.findOne({ username })
  if (!admin) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Tài khoản hoặc mật khẩu không chính xác',
    })
  }

  const isMatch = await bcrypt.compare(password, admin.password)
  if (!isMatch) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Tài khoản hoặc mật khẩu không chính xác',
    })
  }

  const token = generateAdminToken({
    id: admin._id.toString(),
    username: admin.username,
    full_name: admin.full_name,
  })

  return {
    accessToken: token,
    tokenType: 'Bearer',
    user: {
      id: admin._id.toString(),
      username: admin.username,
      full_name: admin.full_name,
      phone: admin.username,
    },
  }
})
