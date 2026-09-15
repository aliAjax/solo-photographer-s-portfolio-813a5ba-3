import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { categoryLabel, type Photo } from "../data/portfolio";

/**
 * 全局灯箱：不是独立路由，而是可在首页 / 作品集 / 系列页复用的共享组件。
 *
 * 关键约束：上一张 / 下一张只在「打开灯箱时传入的那组照片」内循环。
 * 调用方负责传入当前可见列表 —— /work 传当前筛选结果、系列页传该系列照片、
 * 首页传精选照片 —— 灯箱自身绝不回退到全部照片。
 */
interface LightboxContextValue {
  open: (photos: Photo[], startId: string) => void;
  close: () => void;
}

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function useLightbox(): LightboxContextValue {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error("useLightbox 必须在 LightboxProvider 内使用");
  return ctx;
}

interface LightboxState {
  photos: Photo[];
  index: number;
}

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LightboxState | null>(null);

  const open = useCallback((list: Photo[], startId: string) => {
    const index = list.findIndex((p) => p.id === startId);
    if (index === -1 || list.length === 0) return;
    setState({ photos: list, index });
  }, []);

  const close = useCallback(() => setState(null), []);

  const step = useCallback((delta: number) => {
    setState((prev) => {
      if (!prev) return prev;
      const n = prev.photos.length;
      // 循环：第一张的上一张是最后一张，最后一张的下一张是第一张
      return { ...prev, index: (prev.index + delta + n) % n };
    });
  }, []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <LightboxContext.Provider value={value}>
      {children}
      {state && (
        <LightboxOverlay
          photos={state.photos}
          index={state.index}
          onStep={step}
          onClose={close}
        />
      )}
    </LightboxContext.Provider>
  );
}

function LightboxOverlay({
  photos,
  index,
  onStep,
  onClose,
}: {
  photos: Photo[];
  index: number;
  onStep: (delta: number) => void;
  onClose: () => void;
}) {
  const current = photos[index];

  // 键盘：Esc 关闭，左右切换；打开期间锁住背景滚动
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onStep(-1);
      if (e.key === "ArrowRight") onStep(1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onStep, onClose]);

  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${current.title} — 照片灯箱`}
      ref={dialogRef}
      tabIndex={-1}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        className="lightbox__close"
        aria-label="关闭灯箱"
        onClick={onClose}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            d="M5 5l14 14M19 5L5 19"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {photos.length > 1 && (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--prev"
          aria-label="上一张"
          onClick={() => onStep(-1)}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <figure className="lightbox__stage">
        <div className="lightbox__frame">
          <img
            key={current.id}
            src={`${import.meta.env.BASE_URL}${current.file}`}
            alt={current.altText}
            width={current.width}
            height={current.height}
            className="lightbox-image"
            draggable={false}
          />
        </div>
        <figcaption className="lightbox-info">
          <span className="eyebrow" data-lightbox-category={current.category}>
            {categoryLabel(current.category)} · {index + 1} / {photos.length}
          </span>
          <h2>{current.title}</h2>
          <p data-lightbox-caption>{current.caption}</p>
        </figcaption>
      </figure>

      {photos.length > 1 && (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--next"
          aria-label="下一张"
          onClick={() => onStep(1)}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
