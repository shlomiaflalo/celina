import { useState } from "react";
import { PlateIcon, VideoIcon } from "./icons";
import { useT } from "../i18n";

/**
 * Галерея медиа блюда: до 4 фото + необязательное видео.
 * Главное фото крупно, снизу — миниатюры и кнопка видео.
 */
export function DishGallery({
  photos,
  videoUrl,
  title,
  className = "",
}: {
  photos: string[];
  videoUrl?: string | null;
  title: string;
  className?: string;
}) {
  const t = useT();
  const imgs = photos.filter(Boolean);
  const [active, setActive] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const hasMedia = imgs.length > 0 || !!videoUrl;
  if (!hasMedia) {
    return (
      <div className={`flex h-44 w-full items-center justify-center rounded-2xl bg-orange-50 ${className}`}>
        <PlateIcon size={44} className="opacity-50" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-orange-50 sm:h-52">
        {imgs[active] ? (
          <img src={imgs[active]} alt={title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PlateIcon size={44} className="opacity-50" />
          </div>
        )}

        {videoUrl && (
          <button
            type="button"
            onClick={() => setShowVideo(true)}
            aria-label={t.a11y.playVideo}
            className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/75"
          >
            <VideoIcon size={16} /> ▶
          </button>
        )}
      </div>

      {/* миниатюры */}
      {imgs.length > 1 && (
        <div className="mt-2 flex gap-2">
          {imgs.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={t.a11y.photo(i + 1)}
              aria-current={i === active}
              className={`h-12 w-12 overflow-hidden rounded-lg border-2 transition ${
                i === active ? "border-[#e0860c]" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* модальное окно видео */}
      {showVideo && videoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowVideo(false)}
        >
          <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <video src={videoUrl} controls autoPlay className="w-full rounded-2xl" />
            <button
              onClick={() => setShowVideo(false)}
              aria-label={t.a11y.close}
              className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-bold text-[#e0860c] shadow-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
