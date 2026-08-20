import bcrypt from 'bcryptjs'
import { Admin } from '../../../models/Admin'
import { requireAdminAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const auth = requireAdminAuth(event)
  const body = await readBody(event)

  const oldPassword = (body.old_password || '').toString()
  const newPassword = (body.new_password || '').toString()

  if (!oldPassword || !newPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Vui lòng nhập mật khẩu cũ và mật khẩu mới',
    })
  }

  if (newPassword.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Mật khẩu mới phải có ít nhất 6 ký tự',
    })
  }

  const admin = await Admin.findById(auth.id)
  if (!admin) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Không tìm thấy tài khoản quản trị',
    })
  }

  const isMatch = await bcrypt.compare(oldPassword, admin.password)
  if (!isMatch) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Mật khẩu cũ không chính xác',
    })
  }

  admin.password = await bcrypt.hash(newPassword, 10)
  await admin.save()

  return {
    success: true,
    message: 'Đổi mật khẩu thành công',
  }
})
