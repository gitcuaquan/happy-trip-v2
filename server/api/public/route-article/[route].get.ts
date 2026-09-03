import { Article } from '../../../models/Article'

export default defineEventHandler(async (event) => {
  const routeParam = getRouterParam(event, 'route')

  if (!routeParam) {
    return { data: null }
  }

  const cleanRoute = routeParam.trim().toLowerCase()

  // Tìm bài viết được gắn route_slug hoặc có slug trùng với route
  const article = await Article.findOneAndUpdate(
    {
      $or: [
        { route_slug: cleanRoute },
        { slug: cleanRoute }
      ],
      status: true,
    },
    { $inc: { views: 1 } },
    { returnDocument: 'after' }
  ).lean()

  if (!article) {
    return { data: null }
  }

  return {
    data: {
      id: (article as any)._id.toString(),
      ...article,
      name: (article as any).title,
    },
  }
})
