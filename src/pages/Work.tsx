import { Link } from "react-router-dom";
import {
  ALL_FILTER,
  categories,
  photosByFilter,
  seriesList,
} from "../data/portfolio";
import { useFilter } from "../state/FilterContext";
import { PhotoCard } from "../components/PhotoCard";

export default function Work() {
  // 筛选状态来自路由之上的 FilterContext：进入系列页再返回时保持不变。
  const { filter, setFilter } = useFilter();
  const visible = photosByFilter(filter);

  return (
    <div className="container">
      <header className="work-head">
        <p className="eyebrow">Selected Works</p>
        <h1>作品集</h1>
        <p>
          全部照片按三个系列整理：《凝视》的黑白肖像特写、《无人之境》的高原地貌，
          以及《高原牧歌》里的牧场日常。点击任意照片可在灯箱中查看说明。
        </p>

        <div className="filters" role="group" aria-label="按分类筛选照片">
          <button
            type="button"
            aria-pressed={filter === ALL_FILTER}
            onClick={() => setFilter(ALL_FILTER)}
          >
            全部
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={filter === c.id}
              onClick={() => setFilter(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="series-links">
          <span>系列：</span>
          {seriesList.map((s) => (
            <Link key={s.id} to={`/work/${s.id}`}>
              《{s.title}》
            </Link>
          ))}
        </div>
      </header>

      <div className="masonry" aria-live="polite">
        {visible.map((photo, i) => (
          <PhotoCard key={photo.id} photo={photo} list={visible} index={i} />
        ))}
      </div>
    </div>
  );
}
