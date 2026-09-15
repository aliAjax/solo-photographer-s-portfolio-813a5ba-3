import { Fragment } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  categoryLabel,
  getSeries,
  photosOfSeries,
} from "../data/portfolio";
import { useLightbox } from "../state/LightboxContext";
import { PhotoImage } from "../components/PhotoImage";

export default function SeriesDetail() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const series = seriesId ? getSeries(seriesId) : undefined;
  const { open } = useLightbox();

  if (!series) {
    return <Navigate to="/work" replace />;
  }

  // 与 /work 共享同一份数据模型：照片、标题、说明均由 photos.json 中该 seriesId 的集合派生
  const list = photosOfSeries(series.id);
  const heroPhoto = list[0];

  return (
    <>
      <section className="series-hero">
        <div className="hero__bg" aria-hidden="true">
          <PhotoImage photo={heroPhoto} eager />
        </div>
        <div className="hero__veil" aria-hidden="true" />
        <div className="series-hero__inner">
          <p className="eyebrow">{categoryLabel(series.category)} · 系列</p>
          <h1>{series.title}</h1>
        </div>
      </section>

      <div className="container">
        <p className="series-summary">{series.summary}</p>
        <Link to="/work" className="back-link">
          ← 返回作品集
        </Link>
      </div>

      <div className="container">
        <div className="story">
          {list.map((photo, i) => (
            <Fragment key={photo.id}>
              <article>
                <div className="story__media">
                  <button
                    type="button"
                    className="photo-button"
                    onClick={() => open(list, photo.id)}
                    aria-label={`查看照片：${photo.title}`}
                  >
                    <PhotoImage photo={photo} eager={i === 0} />
                    <span className="photo-button__veil" aria-hidden="true" />
                  </button>
                </div>
                <div className="story__text">
                  <h2>{photo.title}</h2>
                  <span className="story__cat">{categoryLabel(photo.category)}</span>
                  <p>{photo.caption}</p>
                </div>
              </article>

              {/* 叙事节奏中段的引用摘要：直接使用该系列 summary（既有文案，不另写内容） */}
              {i === Math.floor(list.length / 2) - 1 && (
                <div className="pull-quote">
                  <blockquote>“{series.summary}”</blockquote>
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
