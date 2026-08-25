import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { toast } from "../../components/Toast";
import { playBell } from "../../lib/fx";
import type { Gathering } from "../../types";
import { Button } from "../../components/ui";
import { DateTimePicker } from "../../components/DateTimePicker";
import { RU_CITIES } from "../../lib/ruCities";
import { useAuth } from "../../auth/AuthContext";
import { useT, useTr } from "../../i18n";

export function GatheringCreate() {
  const t = useT();
  const tr = useTr();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    city: user?.city ?? "",
    address: user?.address ?? "",
    startsAt: "",
    maxSeats: 6,
    pricePerGuest: 0,
    coverUrl: "",
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const input =
    "w-full rounded-xl border border-[var(--hairline)] bg-orange-50/40 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-200";
  const label = "mb-1 block text-sm font-medium text-[#e0860c]";

  async function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const r = await api.upload(file);
      setForm((f) => ({ ...f, coverUrl: r.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.coverUrl) { setError(t.gatherings.photoRequired); return; }
    if (!form.startsAt) { setError(t.gatherings.fDate); return; }
    setBusy(true);
    try {
      const r = await api.post<{ gathering: Gathering }>("/gatherings", {
        title: form.title,
        description: form.description || undefined,
        coverUrl: form.coverUrl,
        city: form.city || undefined,
        address: form.address || undefined,
        startsAt: new Date(form.startsAt).toISOString(),
        maxSeats: Number(form.maxSeats),
        pricePerGuest: Number(form.pricePerGuest),
      });
      // явная индикация успеха: звон + сообщение, затем страница нового застолья
      playBell();
      navigate(`/gatherings/${r.gathering.id}`);
      setTimeout(() => toast(t.gatherings.created), 400);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-5 mt-3 text-center text-2xl font-bold text-white drop-shadow sm:text-3xl">
        {t.gatherings.formTitle}
      </h1>

      <form onSubmit={submit} className="space-y-4 rounded-3xl glass-card p-6">
        {/* обязательное фото места или хозяина */}
        <div>
          <label htmlFor="gathering-cover" className={label}>{t.gatherings.fPhoto} *</label>
          <label className="group relative flex h-44 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/40 transition hover:border-orange-300">
            {form.coverUrl ? (
              <img src={form.coverUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              // пустая зона больше не молчит: словами говорим, что сюда класть
              <span className="px-4 text-center text-sm font-medium text-[#e0860c]">
                {uploading ? t.gatherings.uploading : t.gatherings.fPhotoHint}
              </span>
            )}
            <input id="gathering-cover" type="file" accept="image/*" className="sr-only" onChange={onCover} disabled={uploading} />
            {form.coverUrl && !uploading && (
              <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/25" />
            )}
          </label>
        </div>
        <div>
          <label htmlFor="gathering-title" className={label}>{t.gatherings.fTitle}</label>
          <input id="gathering-title" className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength={3} maxLength={120} />
        </div>
        <div>
          <label htmlFor="gathering-desc" className={label}>{t.gatherings.fDesc}</label>
          <textarea id="gathering-desc" className={`${input} min-h-24`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={2000} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="gathering-city" className={label}>{t.gatherings.fCity}</label>
            <select id="gathering-city" className={input} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required>
              <option value="" disabled>{t.auth.city}</option>
              {/* value — канонический русский город, подпись переводим */}
              {RU_CITIES.map((c) => <option key={c} value={c}>{tr(c)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="gathering-date" className={label}>{t.gatherings.fDate}</label>
            <DateTimePicker
              id="gathering-date"
              value={form.startsAt}
              onChange={(v) => setForm({ ...form, startsAt: v })}
              triggerClass={input}
              minDate={new Date()}
            />
          </div>
        </div>
        <div>
          <label htmlFor="gathering-address" className={label}>{t.gatherings.fAddress}</label>
          <input id="gathering-address" className={input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} maxLength={300} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="gathering-seats" className={label}>{t.gatherings.fSeats}</label>
            <input id="gathering-seats" className={input} type="number" min={2} max={50} value={form.maxSeats} onChange={(e) => setForm({ ...form, maxSeats: Number(e.target.value) })} />
          </div>
          <div>
            <label htmlFor="gathering-price" className={label}>{t.gatherings.fPrice}</label>
            <input id="gathering-price" className={input} type="number" min={0} max={100000} value={form.pricePerGuest} onChange={(e) => setForm({ ...form, pricePerGuest: Number(e.target.value) })} />
          </div>
        </div>

        {error && <p className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-[#e0860c]">{error}</p>}

        <Button type="submit" full disabled={busy || uploading}>{busy ? "…" : t.gatherings.submit}</Button>
      </form>
    </div>
  );
}
