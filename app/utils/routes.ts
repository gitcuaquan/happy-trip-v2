import routerFrom from '~~/data/routerFrom.json'
import routerTo from '~~/data/routerTo.json'

// Interface chung cho cả routerFrom và routerTo
export interface RouteEntry {
  name: string
  slug: string
  id?: string
  parentId?: string
  data?: string
  canonical?: string
}

// Cấu trúc Interface cho một Route kết quả
export interface CustomRoute {
  name: string;
  slug: string;
}

// Gộp tất cả các entry thành một danh sách chung
const allEntries: RouteEntry[] = [
  ...(routerFrom as RouteEntry[]),
  ...(routerTo as RouteEntry[]),
]

export const getFromRoute = (slug: string): RouteEntry | null => {
  if (!slug) return null
  // Ưu tiên tìm trong routerFrom trước
  const fromEntry = (routerFrom as RouteEntry[]).find(item => item.slug === slug)
  if (fromEntry) return fromEntry
  // Fallback: tìm trong routerTo (cho tuyến chiều về)
  const toEntry = (routerTo as RouteEntry[]).find(item => item.slug === slug)
  return toEntry ?? null
}

export const getToRoute = (slug: string): RouteEntry | null => {
  if (!slug) return null
  // Ưu tiên tìm trong routerTo trước
  const toEntry = (routerTo as RouteEntry[]).find(item => item.slug === slug)
  if (toEntry) return toEntry
  // Fallback: tìm trong routerFrom (cho tuyến chiều về)
  const fromEntry = (routerFrom as RouteEntry[]).find(item => item.slug === slug)
  return fromEntry ?? null
}

export const generateAllRoutes = (): CustomRoute[] => {
  const routes: CustomRoute[] = [];
  routerFrom.forEach(fromItem => {
    routerTo.forEach(toItem => {
      // 1. Chiều đi: từ A đến B
      routes.push({
        name: `Xe riêng ${fromItem.name} đi ${toItem.name}`,
        slug: `xe-rieng-${fromItem.slug}-di-${toItem.slug}`,
      });

      // 2. Chiều về: từ B về A
      routes.push({
        name: `Xe riêng ${toItem.name} đi ${fromItem.name}`,
        slug: `xe-rieng-${toItem.slug}-di-${fromItem.slug}`,
      });
    });
  });
  return routes;
};