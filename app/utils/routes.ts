import routerFrom from '~~/data/routerFrom.json'
import routerTo from '~~/data/routerTo.json'

export const getFromRoute = (slug: string) =>
  routerFrom.find(item => item.slug === slug)

export const getToRoute = (slug: string) =>
  routerTo.find(item => item.slug === slug)