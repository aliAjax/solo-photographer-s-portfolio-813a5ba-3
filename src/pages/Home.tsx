import { Link } from "react-router-dom";
import {
  photosOfSeries,
  seriesList,
  categoryLabel,
} from "../data/portfolio";
import { PhotoImage } from "../components/PhotoImage";
import { useLightbox } from "../state/LightboxContext";

export default function Home() {
  const { open } = useLightbox();
  const hero = photosOfSeries("wilderness")[0]; // 野花坡 —— 高原地貌，作为首页主视觉

  return (
    <>
      <section className="hero">
        <div className="hero__bg" aria-hidden="true">
          <PhotoImage photo={hero} eager />
        </div>
        <div className="hero__veil" aria-hidden="true" />
        <div className="hero__inner">
          <p className="eyebrow">Independent Photographer</p>
          <h1 className="hero__title">镜头前的坦露，与高原上的光</h1>
          <p className="hero__lead">
            我拍摄两类题材：黑白人像特写，以及高原地区的自然风光与牧场生活记录。
            这里汇集三个长期系列——《凝视》《无人之境》与《高原牧歌》。
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>精选系列</h2>
          </div>

          <div className="featured-row">
            {seriesList.map((series) => {
              const list = photosOfSeries(series.id);
              const cover = list[0];
              return (
                <div className="series-card" key={series.id}>
                  <button
                    type="button"
                    className="series-card__media"
                    onClick={() => open(list, cover.id)}
                    aria-label={`打开《${series.title}》灯箱预览`}
                  >
                    <PhotoImage photo={cover} />
                    <span className="series-card__veil" aria-hidden="true" />
                    <span className="series-card__body">
                      <span className="series-card__title">{series.title}</span>
                      <span className="series-card__cat">
                        {categoryLabel(series.category)}
                      </span>
                    </span>
                  </button>
                  <div style={{ padding: "14px 4px 4px" }}>
                    <p style={{ margin: "0 0 10px", color: "var(--ink-soft)", fontSize: "0.92rem" }}>
                      {series.summary}
                    </p>
                    <Link to={`/work/${series.id}`} className="series-card__open">
                      进入系列 →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
