import { Article } from '../../../models/Article'
import { requireAdminAuth } from '../../../utils/auth'
import { slugify } from '../../../utils/slug'

export default defineEventHandler(async (event) => {
  const auth = requireAdminAuth(event)
  const body = await readBody(event)

  const title = (body.title || '').trim()
  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Vui lòng nhập tiêu đề bài viết',
    })
  }

  let slug = (body.slug || '').trim()
  if (!slug) {
    slug = slugify(title)
  } else {
    slug = slugify(slug)
  }

  let finalSlug = slug
  let counter = 1
  while (await Article.findOne({ slug: finalSlug })) {
    finalSlug = `${slug}-${counter}`
    counter++
  }

  const category = body.category === 'policy' ? 'policy' : 'blog'
  const status = body.status !== undefined ? Boolean(body.status) : true
  const readingTime = Math.max(1, Math.ceil((body.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length / 200)) || 3

  const article = await Article.create({
    title,
    slug: finalSlug,
    excerpt: (body.excerpt || '').trim(),
    content: body.content || '',
    thumbnail: (body.thumbnail || '').trim(),
    category,
    status,
    reading_time: body.reading_time || readingTime,
    author_name: (body.author_name || auth.full_name || 'Happy Trip').trim(),

    // SEO
    meta_title: (body.meta_title || '').trim(),
    meta_description: (body.meta_description || '').trim(),
    meta_keywords: Array.isArray(body.meta_keywords) ? body.meta_keywords : (body.meta_keywords || '').split(',').map((k: string) => k.trim()).filter(Boolean),
    focus_keyword: (body.focus_keyword || '').trim(),
    canonical_url: (body.canonical_url || '').trim(),
    og_image: (body.og_image || body.thumbnail || '').trim(),
    noindex: Boolean(body.noindex),
    published_at: body.published_at ? new Date(body.published_at) : new Date(),
  })

  return {
    success: true,
    message: 'Tạo bài viết thành công',
    data: {
      id: article._id.toString(),
      ...article.toObject(),
    },
  }
})
