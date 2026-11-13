export interface UploadResponse {
  success: boolean
  filename: string
  url: string
}

export const uploadService = {
  async upload(file: File): Promise<UploadResponse> {
    const formData = new FormData()

    formData.append('image', file)

    return await $fetch<UploadResponse>('/api/upload', {
      method: 'POST',
      body: formData
    })
  },

  async remove(fileUrl: string): Promise<{ success: boolean }> {
    return await $fetch<{ success: boolean }>('/api/delete', {
      method: 'POST',
      body: {
        fileUrl
      }
    } as any)
  }
}