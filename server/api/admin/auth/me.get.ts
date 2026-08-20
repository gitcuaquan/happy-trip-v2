import { Admin } from '../../../models/Admin'
import { requireAdminAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const auth = requireAdminAuth(event)

  const admin = await Admin.findById(auth.id).select('-password')
  if (!admin) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Không tìm thấy thông tin tài khoản quản trị',
    })
  }

  return {
    id: admin._id.toString(),
    username: admin.username,
    full_name: admin.full_name,
    phone: admin.username,
  }
})
