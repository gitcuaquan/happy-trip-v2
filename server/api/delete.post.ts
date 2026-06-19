import { unlink } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, basename } from 'node:path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    if (!body.fileUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'File URL is required'
      })
    }

    const filename = basename(body.fileUrl)

    const filePath = join(
      process.cwd(),
      'public',
      'uploads',
      filename
    )

    if (!existsSync(filePath)) {
      return {
        success: true
      }
    }

    await unlink(filePath)

    return {
      success: true
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage || 'Delete failed'
    })
  }
})