// 单一内容数据源：所有页面（首页 / 作品集 / 系列详情 / 灯箱）都从这里取数据。
// 该 JSON 原样来自 mock-data/photos.json，禁止在此重复硬编码任何照片、标题或文案。
import raw from "./photos.json";

export interface Category {
  id: string;
  label: string;
}

export interface Series {
  id: string;
  title: string;
  category: string;
  summary: string;
  photoIds: string[];
}

export interface Photo {
  id: string;
  category: string;
  seriesId: string;
  file: string;
  title: string;
  altText: string;
  caption: string;
  width: number;
  height: number;
  order: number;
}

export const categories: Category[] = raw.categories as Category[];
export const seriesList: Series[] = raw.series as Series[];
export const photos: Photo[] = raw.photos as Photo[];

const photoMap = new Map(photos.map((p) => [p.id, p]));
const seriesMap = new Map(seriesList.map((s) => [s.id, s]));
const categoryMap = new Map(categories.map((c) => [c.id, c]));

export const ALL_FILTER = "all";
export type FilterId = string; // ALL_FILTER 或某个 category id

export function getPhoto(id: string): Photo {
  const p = photoMap.get(id);
  if (!p) throw new Error(`未知照片 id: ${id}`);
  return p;
}

export function getSeries(id: string): Series | undefined {
  return seriesMap.get(id);
}

export function categoryLabel(id: string): string {
  return categoryMap.get(id)?.label ?? id;
}

const byOrder = (a: Photo, b: Photo) => a.order - b.order;

/** 某个系列的完整照片集合（同一份数据模型，系列详情页直接复用）。 */
export function photosOfSeries(seriesId: string): Photo[] {
  return seriesList
    .find((s) => s.id === seriesId)!
    .photoIds.map(getPhoto)
    .sort(byOrder);
}

/** 按分类筛选照片；"all" 返回全部。保持 photos.json 的数组顺序（同组内即 order 顺序）。 */
export function photosByFilter(filter: FilterId): Photo[] {
  return filter === ALL_FILTER ? [...photos] : photos.filter((p) => p.category === filter);
}

/** 静态资源 URL：file 字段相对站点根目录（文件在 public/photos 下）。 */
export function photoUrl(file: string): string {
  const base = import.meta.env.BASE_URL;
  return `${base}${file}`;
}
