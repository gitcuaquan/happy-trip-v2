import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  try {
    const files = await readMultipartFormData(event)

    const file = files?.find(
      item => (item.name === 'image' || item.name === 'file') && item.data
    ) || files?.[0]

    if (!file?.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Vui lòng chọn tệp hình ảnh để tải lên',
      })
    }

    // Giới hạn dung lượng tối đa 10MB
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.data.length > MAX_SIZE) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Dung lượng ảnh vượt quá giới hạn cho phép (Tối đa 10MB)',
      })
    }

    const ext = (file.filename?.split('.').pop() || 'jpg').toLowerCase()
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif']
    if (!allowedExts.includes(ext)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Định dạng .${ext} không được hỗ trợ. Vui lòng tải ảnh định dạng JPG, PNG, WebP, GIF, SVG hoặc AVIF`,
      })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads')

    await mkdir(uploadDir, {
      recursive: true,
    })

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const filePath = join(uploadDir, fileName)

    await writeFile(filePath, file.data)

    return {
      success: true,
      filename: fileName,
      url: `/uploads/${fileName}`,
      path: `/uploads/${fileName}`,
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Upload thất bại',
    })
  }
})