import { Article } from '../../../models/Article'
import { requireAdminAuth } from '../../../utils/auth'
import { slugify } from '../../../utils/slug'

export default defineEventHandler(async (event) => {
  const auth = requireAdminAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Thiếu ID bài viết',
    })
  }

  const existingArticle = await Article.findById(id)
  if (!existingArticle) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Không tìm thấy bài viết để cập nhật',
    })
  }

  const title = (body.title || existingArticle.title).trim()
  let slug = (body.slug || existingArticle.slug).trim()
  slug = slugify(slug || title)

  if (slug !== existingArticle.slug) {
    let finalSlug = slug
    let counter = 1
    while (await Article.findOne({ slug: finalSlug, _id: { $ne: id } })) {
      finalSlug = `${slug}-${counter}`
      counter++
    }
    slug = finalSlug
  }

  const category = body.category === 'policy' ? 'policy' : 'blog'
  const status = body.status !== undefined ? Boolean(body.status) : existingArticle.status
  const readingTime = Math.max(1, Math.ceil((body.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length / 200)) || 3

  existingArticle.title = title
  existingArticle.slug = slug
  existingArticle.excerpt = (body.excerpt !== undefined ? body.excerpt : existingArticle.excerpt).trim()
  existingArticle.content = body.content !== undefined ? body.content : existingArticle.content
  existingArticle.thumbnail = (body.thumbnail !== undefined ? body.thumbnail : existingArticle.thumbnail).trim()
  existingArticle.category = category
  existingArticle.status = status
  existingArticle.reading_time = body.reading_time || readingTime
  if (body.author_name) existingArticle.author_name = body.author_name.trim()

  // SEO
  if (body.meta_title !== undefined) existingArticle.meta_title = body.meta_title.trim()
  if (body.meta_description !== undefined) existingArticle.meta_description = body.meta_description.trim()
  if (body.meta_keywords !== undefined) {
    existingArticle.meta_keywords = Array.isArray(body.meta_keywords)
      ? body.meta_keywords
      : (body.meta_keywords || '').split(',').map((k: string) => k.trim()).filter(Boolean)
  }
  if (body.focus_keyword !== undefined) existingArticle.focus_keyword = body.focus_keyword.trim()
  if (body.canonical_url !== undefined) existingArticle.canonical_url = body.canonical_url.trim()
  if (body.og_image !== undefined) existingArticle.og_image = (body.og_image || body.thumbnail || '').trim()
  if (body.noindex !== undefined) existingArticle.noindex = Boolean(body.noindex)
  if (body.published_at) existingArticle.published_at = new Date(body.published_at)

  await existingArticle.save()

  return {
    success: true,
    message: 'Cập nhật bài viết thành công',
    data: {
      id: existingArticle._id.toString(),
      ...existingArticle.toObject(),
    },
  }
})
