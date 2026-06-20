
import froms from '~~/data/routerFrom.json'
import tos from '~~/data/routerTo.json'
import type { SitemapUrlInput } from '#sitemap/types'

export default defineSitemapEventHandler((): SitemapUrlInput[] => {
  const urls: SitemapUrlInput[] = []

  for (const from of froms) {
    for (const to of tos) {
      urls.push({
        loc: `/xe-rieng-${from.slug}-di-${to.slug}`,
        priority: 0.8,
        changefreq: 'yearly',
      })
      urls.push({
        loc: `/xe-rieng-${to.slug}-di-${from.slug}`,
        priority: 0.8,
        changefreq: 'yearly',
      })
    }
  }

  return urls
})