import { useState } from "react";
import { photoUrl, type Photo } from "../data/portfolio";

/**
 * 按数据里的真实 width/height 用 aspect-ratio 提前撑开容器，
 * 图片未加载完成时占位空间已经是最终尺寸，加载后不会引发布局抖动（CLS）。
 */
export function PhotoImage({
  photo,
  imgClassName,
  eager = false,
}: {
  photo: Photo;
  imgClassName?: string;
  eager?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="ratio-box"
      style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
    >
      <img
        src={photoUrl(photo.file)}
        width={photo.width}
        height={photo.height}
        alt={photo.altText}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`${imgClassName ?? ""} ${loaded ? "is-loaded" : ""}`.trim()}
      />
    </div>
  );
}
