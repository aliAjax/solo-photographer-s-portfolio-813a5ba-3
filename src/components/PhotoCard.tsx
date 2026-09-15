import { useLightbox } from "../state/LightboxContext";
import { categoryLabel, type Photo } from "../data/portfolio";
import { PhotoImage } from "./PhotoImage";

/**
 * /work 网格中的照片卡片：整张图是一个 .photo-button，
 * 点击在「当前筛选结果」范围内打开共享灯箱。
 */
export function PhotoCard({
  photo,
  list,
  index,
}: {
  photo: Photo;
  list: Photo[];
  index: number;
}) {
  const { open } = useLightbox();

  return (
    <div className="photo-card">
      <button
        type="button"
        className="photo-button"
        onClick={() => open(list, photo.id)}
        aria-label={`查看照片：${photo.title}`}
      >
        <PhotoImage photo={photo} eager={index < 4} />
        <span className="photo-button__veil" aria-hidden="true" />
        <span className="photo-meta">
          <strong>{photo.title}</strong>
          <span>{categoryLabel(photo.category)}</span>
        </span>
      </button>
    </div>
  );
}
