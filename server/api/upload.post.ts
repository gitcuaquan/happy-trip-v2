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

    const uploadDir = join(process.cwd(), 'public', 'uploads')

    await mkdir(uploadDir, {
      recursive: true,
    })

    const ext = file.filename?.split('.').pop() || 'jpg'
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