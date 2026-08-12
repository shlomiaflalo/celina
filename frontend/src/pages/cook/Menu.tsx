import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { toast } from "../../components/Toast";
import { useAuth } from "../../auth/AuthContext";
import type { CookProfile, Dish } from "../../types";
import { Spinner, Badge, Button, ErrorState } from "../../components/ui";
import { DeleteButton } from "../../components/DeleteButton";
import { PlateIcon, VideoIcon, CameraIcon, AlertIcon } from "../../components/icons";
import { useT, useTr } from "../../i18n";
import { toLocalInput } from "../../lib/cookAt";

const CATEGORIES = ["супы", "горячее", "салаты", "выпечка", "десерты"];
// Категории, попадающие под обязательную маркировку «Честный знак» (с 01.03.2026
// — печенье, вафли, зефир, пастила и др.). Плательщику НПД по 422-ФЗ продавать
// маркируемые товары запрещено, поэтому предупреждаем повара при выборе.
const MARKING_CATEGORIES = ["выпечка", "десерты"];
const ALLERGENS = ["глютен", "молоко", "яйца", "орехи", "арахис", "соя", "рыба", "морепродукты", "сельдерей", "горчица", "кунжут"];
// Пределы полей блюда — те же, что в zod-схеме бекенда (dishes.routes.ts):
// длинное название или цена в девять знаков разъезжают карточку в ленте.
const DISH_MAX = { title: 80, description: 500, ingredients: 500, price: 100000, portions: 500 };
const clamp = (n: number, max: number) => Math.min(Math.max(0, n), max);

const empty = {
  title: "",
  description: "",
  price: 0,
  category: "горячее",
  portions: 0,
  prepTimeMin: 30,
  isAvailable: true,
  cookAt: "" as string, // datetime-local; пусто = готовлю по заказу
};

export function Menu() {
  const t = useT();
  const tr = useTr();
  const { user } = useAuth();
  const cookId = user?.cookProfile?.id;
  const [dishes, setDishes] = useState<Dish[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [editing, setEditing] = useState<Partial<Dish> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [saving, setSaving] = useState(false);

  function load() {
    if (!cookId) return;
    setFailed(false);
    api.get<{ cook: CookProfile }>(`/cooks/${cookId}`).then((r) => setDishes(r.cook.dishes ?? [])).catch(() => setFailed(true));
  }
  useEffect(load, [cookId]);

  const photosOf = (d: Partial<Dish> | null): string[] =>
    (d?.photos && d.photos.length ? d.photos : d?.photoUrl ? [d.photoUrl] : []).filter(Boolean) as string[];

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const { url } = await api.upload(file);
      const photos = [...photosOf(editing), url].slice(0, 4);
      setEditing({ ...editing, photos, photoUrl: photos[0] });
    } catch (err) {
      // раньше сбой загрузки был полностью беззвучным — повар не понимал, почему фото не появилось
      toast(err instanceof Error ? err.message : t.common.error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removePhoto(url: string) {
    if (!editing) return;
    const photos = photosOf(editing).filter((p) => p !== url);
    setEditing({ ...editing, photos, photoUrl: photos[0] });
  }

  async function onVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploadingVideo(true);
    try {
      const { url } = await api.upload(file);
      setEditing({ ...editing, videoUrl: url });
    } catch (err) {
      toast(err instanceof Error ? err.message : t.common.error);
    } finally {
      setUploadingVideo(false);
      e.target.value = "";
    }
  }

  // блюдо нельзя опубликовать без фото — чтобы в карточках всегда были фотографии
  const MIN_DISH_PHOTOS = 1;

  async function save() {
    if (!editing || saving) return; // защита от двойного клика
    const photos = photosOf(editing);
    if (photos.length < MIN_DISH_PHOTOS) return; // защита: без фото не сохраняем
    setSaving(true);
    const payload = {
      title: editing.title,
      description: editing.description,
      price: Number(editing.price),
      category: editing.category,
      portions: Number(editing.portions),
      prepTimeMin: Number(editing.prepTimeMin),
      photoUrl: photos[0] ?? null,
      photos,
      videoUrl: editing.videoUrl ?? null,
      ingredients: editing.ingredients ?? null,
      allergens: editing.allergens ?? [],
      isAvailable: editing.isAvailable ?? true,
      // datetime-local отдаёт время БЕЗ зоны — превращаем в ISO как местное
      cookAt: editing.cookAt ? new Date(editing.cookAt).toISOString() : null,
    };
    try {
      if (editing.id) await api.put(`/dishes/${editing.id}`, payload);
      else await api.post("/dishes", payload);
      setEditing(null);
      load();
    } catch (e) {
      // напр. опубликовать блюдо можно только после верификации
      toast(e instanceof Error ? e.message : t.common.error);
    } finally {
      setSaving(false);
    }
  }


  if (failed) return <ErrorState onRetry={load} />;
  if (!dishes) return <Spinner />;

  const input = "w-full rounded-lg border border-orange-200 px-3 py-2 text-sm focus:border-[#f97316] focus:outline-none";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t.cook.menu}</h1>
        <Button onClick={() => setEditing({ ...empty })}>+ {t.cook.addDish}</Button>
      </div>

      {editing && (
        <div className="mb-6 rounded-2xl border border-[#f97316]/30 bg-white p-5 shadow-sm">
          {/* загрузка фото (до 4) + видео */}
          <div className="mb-4">
            <div className="mb-1.5 text-sm font-medium">{t.cook.photosLabel}</div>
            <div className="flex flex-wrap items-center gap-2">
              {photosOf(editing).map((url) => (
                <div key={url} className="relative h-20 w-20 overflow-hidden rounded-xl border border-orange-100">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(url)}
                    aria-label={t.a11y.removePhoto}
                    className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
              {photosOf(editing).length < 4 && (
                <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 text-center text-xs font-medium text-[#e0860c] hover:bg-orange-100">
                  {uploading ? t.cook.uploading : <><PlateIcon size={22} className="opacity-70" /><span className="mt-1">{t.cook.addPhoto}</span></>}
                  <input type="file" accept="image/*" className="hidden" onChange={onPhoto} disabled={uploading} />
                </label>
              )}
            </div>
            <div className="mt-1 text-xs text-[#e0860c]">{t.cook.maxPhotosHint}</div>

            {/* видео */}
            <div className="mt-3 flex items-center gap-3">
              {editing.videoUrl ? (
                <div className="flex items-center gap-2">
                  <video src={editing.videoUrl} className="h-16 w-24 rounded-lg object-cover" muted />
                  <button
                    type="button"
                    onClick={() => setEditing({ ...editing, videoUrl: null })}
                    className="text-sm font-medium text-[#e0860c] hover:underline"
                  >
                    {t.cook.removeVideo}
                  </button>
                </div>
              ) : (
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-medium text-[#e0860c] hover:bg-orange-100">
                  <VideoIcon size={18} />
                  {uploadingVideo ? t.cook.uploadingVideo : t.cook.uploadVideo}
                  <input type="file" accept="video/*" className="hidden" onChange={onVideo} disabled={uploadingVideo} />
                </label>
              )}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {/* aria-label дублирует placeholder: подсказка исчезает при вводе,
                и без неё скринридер не называет поле (вид не меняется) */}
            <input className={input} maxLength={DISH_MAX.title} placeholder={t.cook.title} aria-label={t.cook.title} value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <select className={input} value={editing.category} aria-label={t.cook.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{t.categories[c] || c}</option>
              ))}
            </select>
            <input className={`${input} sm:col-span-2`} maxLength={DISH_MAX.description} placeholder={t.cook.description} aria-label={t.cook.description} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <input className={input} type="number" min="1" max={DISH_MAX.price} placeholder={t.cook.price} aria-label={t.cook.price} value={editing.price || ""} onChange={(e) => setEditing({ ...editing, price: clamp(Number(e.target.value), DISH_MAX.price) })} />
            <input className={input} type="number" min="0" max={DISH_MAX.portions} placeholder={t.cook.portions} aria-label={t.cook.portions} value={editing.portions || ""} onChange={(e) => setEditing({ ...editing, portions: clamp(Number(e.target.value), DISH_MAX.portions) })} />
            <input className={`${input} sm:col-span-2`} maxLength={DISH_MAX.ingredients} placeholder={`${t.cook.ingredients} — ${t.cook.ingredientsHint}`} aria-label={t.cook.ingredients} value={editing.ingredients ?? ""} onChange={(e) => setEditing({ ...editing, ingredients: e.target.value })} />
          </div>

          {/* Когда повар готовит партию. Пусто — готовит по заказу, как раньше. */}
          <div>
            <div className="mb-1.5 text-sm font-medium">{t.cook.cookAtLabel}</div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                className={input + " sm:w-auto"}
                type="datetime-local"
                value={editing.cookAt || ""}
                onChange={(e) => setEditing({ ...editing, cookAt: e.target.value })}
              />
              {editing.cookAt && (
                <button
                  type="button"
                  onClick={() => setEditing({ ...editing, cookAt: "" })}
                  className="rounded-xl border border-orange-200 px-3 py-2 text-sm font-medium text-[#e0860c] transition hover:bg-orange-50"
                >
                  {t.cook.cookAtClear}
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-[#e0860c]/70">{t.cook.cookAtHint}</p>
          </div>

          {/* аллергены */}
          <div className="mt-3">
            <div className="mb-1.5 text-sm font-medium">{t.cook.allergens}</div>
            <div className="flex flex-wrap gap-1.5">
              {ALLERGENS.map((a) => {
                const on = (editing.allergens ?? []).includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => {
                      const cur = editing.allergens ?? [];
                      setEditing({ ...editing, allergens: on ? cur.filter((x) => x !== a) : [...cur, a] });
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      on ? "bg-[#e0860c] text-white" : "border border-orange-100 text-[#e0860c] hover:border-orange-200"
                    }`}
                  >
                    {t.allergens[a] || a}
                  </button>
                );
              })}
            </div>
          </div>

          {/* обязательная маркировка «Честный знак» + запрет для НПД (422-ФЗ):
              предупреждаем, но не блокируем — оценка на стороне повара */}
          {MARKING_CATEGORIES.includes(editing.category ?? "") && (
            <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-2.5 text-[#e0860c]">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <AlertIcon size={16} /> {t.cook.markingWarnTitle}
              </div>
              <p className="mt-1 text-xs leading-relaxed">{t.cook.markingWarn}</p>
            </div>
          )}

          {photosOf(editing).length < MIN_DISH_PHOTOS && (
            <p className="mt-3 flex items-center gap-2 rounded-xl bg-orange-50 px-3.5 py-2.5 text-sm font-medium text-[#e0860c]"><CameraIcon size={18} /> {t.cook.photoRequired}</p>
          )}
          <div className="mt-4 flex gap-2">
            <Button onClick={save} disabled={saving || !editing.title || !((editing.price ?? 0) > 0) || photosOf(editing).length < MIN_DISH_PHOTOS}>{t.cook.save}</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>{t.cook.cancel}</Button>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {dishes.map((d) => (
          <div key={d.id} className="flex flex-col rounded-xl border border-orange-100 bg-white p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-orange-50">
                {d.photoUrl ? (
                  <img src={d.photoUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                ) : (
                  <PlateIcon size={26} className="opacity-60" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="truncate font-medium">{tr(d.title)}</span>
                  <Badge>{t.categories[d.category] || d.category}</Badge>
                  {!d.isAvailable && <Badge tone="red">{t.cook.hidden}</Badge>}
                </div>
                <div className="mt-0.5 whitespace-nowrap text-sm">
                  {d.price} {t.common.rub} · {d.portions} {t.cook.portionsShort}
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="ghost" onClick={() => setEditing({ ...d, cookAt: toLocalInput(d.cookAt) } as any)}>{t.cook.editDish}</Button>
              {/* единый стиль удаления (как у кухни и застолья): белая кнопка
                  с текстом цвета логотипа + подтверждение + сообщение об успехе */}
              <DeleteButton
                label={t.cook.deleteDish}
                confirmText={t.cook.deleteDishConfirm}
                successText={t.cook.dishDeleted}
                onDelete={async () => { await api.del(`/dishes/${d.id}`); }}
                onDone={load}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
