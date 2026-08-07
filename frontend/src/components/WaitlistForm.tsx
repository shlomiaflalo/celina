import { useState } from "react";
import { api } from "../api/client";
import { ShareButtons } from "./ShareButtons";
import { HeartIcon, PlateIcon, CookIcon } from "./icons";
import { useT } from "../i18n";

/**
 * «Приведите Селину в свой двор» — список ожидания по районам.
 * Честно решает холодный старт: копим НАСТОЯЩИЙ спрос до появления поваров.
 * После записи — виральный момент: позовите соседей, чтобы район открылся
 * быстрее. Никаких выдуманных счётчиков — показываем только реальное число.
 */
export function WaitlistForm({ city }: { city: string }) {
  const t = useT();
  const [role, setRole] = useState<"EATER" | "COOK">("EATER");
  const [district, setDistrict] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ cityCount: number } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.post<{ ok: boolean; cityCount: number }>("/waitlist", {
        city, role,
        district: district.trim() || undefined,
        contact: contact.trim() || undefined,
      });
      setDone({ cityCount: r.cityCount });
    } catch {
      setDone({ cityCount: 0 }); // не блокируем UX, если запрос не прошёл
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    const link = `${typeof window !== "undefined" ? window.location.origin : "https://celinaeda.ru"}/eda/`;
    // честная социальная подсказка: настоящее число, а не выдумка
    const many = done.cityCount >= 10;
    return (
      <div className="rounded-3xl bg-white p-6 text-center text-[#e0860c] shadow-sm sm:p-8">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50"><HeartIcon size={30} /></div>
        <h3 className="text-lg font-bold">{t.waitlist.doneTitle}</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-[#e0860c]/85">
          {many
            ? t.waitlist.doneMany.replace("{n}", String(done.cityCount)).replace("{city}", city)
            : t.waitlist.doneFirst.replace("{city}", city)}
        </p>
        <div className="mx-auto mt-4 max-w-sm">
          <ShareButtons url={typeof window !== "undefined" ? window.location.href : link} text={t.waitlist.shareText.replace("{city}", city)} />
        </div>
      </div>
    );
  }

  const field = "w-full rounded-xl border border-orange-100 bg-orange-50/40 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-200";

  return (
    <form onSubmit={submit} className="rounded-3xl bg-white p-6 text-[#e0860c] shadow-sm sm:p-8">
      <h3 className="text-lg font-bold">{t.waitlist.title.replace("{city}", city)}</h3>
      <p className="mt-1 text-sm text-[#e0860c]/85">{t.waitlist.subtitle}</p>

      {/* кто вы: чтобы заказывать или чтобы готовить (это и есть карта спроса) */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {(["EATER", "COOK"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`rounded-2xl border p-3 text-left text-sm font-semibold transition ${
              role === r ? "border-[#e0860c] bg-orange-50" : "border-orange-100 hover:bg-orange-50/50"
            }`}
          >
            <div className="mb-1">{r === "EATER" ? <PlateIcon size={26} /> : <CookIcon size={26} />}</div>
            {r === "EATER" ? t.waitlist.roleEater : t.waitlist.roleCook}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        <input className={field} placeholder={t.waitlist.districtPlaceholder} aria-label={t.waitlist.districtPlaceholder} value={district} onChange={(e) => setDistrict(e.target.value)} />
        <input className={field} placeholder={t.waitlist.contactPlaceholder} aria-label={t.waitlist.contactPlaceholder} value={contact} onChange={(e) => setContact(e.target.value)} />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-4 w-full rounded-2xl bg-[#e0860c] px-6 py-3 font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-95 disabled:opacity-50"
      >
        {busy ? "…" : t.waitlist.submit}
      </button>
      <p className="mt-2 text-center text-xs text-[#e0860c]/60">{t.waitlist.privacyNote}</p>
    </form>
  );
}
