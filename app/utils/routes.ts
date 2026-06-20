import routerFrom from '~~/data/routerFrom.json'
import routerTo from '~~/data/routerTo.json'
// Cấu trúc Interface cho một Route kết quả
export interface CustomRoute {
  name: string;
  slug: string;
}

export const getFromRoute = (slug: string) =>
  routerFrom.find(item => item.slug === slug)

export const getToRoute = (slug: string) =>{
  if(!slug) return null
  let data = routerTo.find(item => item.slug === slug)
  if(data) return data
  data = routerFrom.find(item => item.slug === slug)
  return data
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