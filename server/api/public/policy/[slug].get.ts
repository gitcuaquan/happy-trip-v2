import { Article } from '../../../models/Article'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Thiếu slug văn bản chính sách',
    })
  }

  const article = await Article.findOneAndUpdate(
    {
      $or: [{ slug }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }],
      category: 'policy',
      status: true,
    },
    { $inc: { views: 1 } },
    { returnDocument: 'after' }
  ).lean()

  if (!article) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Văn bản chính sách không tồn tại hoặc đã bị ẩn',
    })
  }

  const otherPolicies = await Article.find({
    category: 'policy',
    status: true,
    _id: { $ne: (article as any)._id },
  })
    .sort({ created_at: -1 })
    .limit(5)
    .select('title slug')
    .lean()

  return {
    data: {
      id: (article as any)._id.toString(),
      ...article,
      other_policies: otherPolicies.map((p: any) => ({ id: p._id.toString(), ...p })),
    },
  }
})
