import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { ALL_FILTER, type FilterId } from "../data/portfolio";

/**
 * 作品集筛选状态挂在路由之上的全局 Provider 中，
 * 因此从 /work 进入 /work/:seriesId 再返回时，筛选条件不会随 /work 组件卸载而丢失。
 */
interface FilterContextValue {
  filter: FilterId;
  setFilter: (f: FilterId) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<FilterId>(ALL_FILTER);
  const value = useMemo(() => ({ filter, setFilter }), [filter]);
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilter(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilter 必须在 FilterProvider 内使用");
  return ctx;
}
