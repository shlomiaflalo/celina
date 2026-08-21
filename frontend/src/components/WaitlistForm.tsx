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
/**
 * Поле контакта показывается ТОЛЬКО там, где мы этот контакт действительно
 * храним. Сервер не сохраняет ни контакт, ни IP за пределами России, Беларуси
 * и Армении — так форма вообще не попадает под казахстанский закон 94-V и
 * узбекский ЗРУ-547, вместо того чтобы попадать и иметь оправдание.
 *
 * Но поле при этом рендерилось всем и обещало «сообщим о запуске». Житель
 * Ташкента вводил e-mail, видел экран «спасибо» — и его контакт молча
 * выбрасывался. Обещание, которое сервис не может выполнить, здесь хуже
 * отсутствующего поля: это ровно то, чего Селина не делает нигде больше.
 */
export function WaitlistForm({ city, allowsContact = true }: { city: string; allowsContact?: boolean }) {
  const t = useT();
  const [role, setRole] = useState<"EATER" | "COOK">("EATER");
  const [district, setDistrict] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ cityCount: number } | null>(null);
  const [failed, setFailed] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFailed(false);
    try {
      const r = await api.post<{ ok: boolean; cityCount: number }>("/waitlist", {
        city, role,
        district: district.trim() || undefined,
        contact: contact.trim() || undefined,
      });
      setDone({ cityCount: r.cityCount });
    } catch {
      // Раньше здесь показывался экран «спасибо». То есть при упавшем запросе
      // человек уходил уверенным, что записался, а заявки не было. Для
      // страниц, где список ожидания — единственное действие, это худший из
      // возможных исходов: и заявка потеряна, и сказана неправда.
      setFailed(true);
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
        {allowsContact && (
          <input className={field} placeholder={t.waitlist.contactPlaceholder} aria-label={t.waitlist.contactPlaceholder} value={contact} onChange={(e) => setContact(e.target.value)} />
        )}
      </div>

      {failed && (
        <p role="alert" className="mt-3 rounded-xl bg-orange-50 px-3 py-2 text-sm font-semibold text-[#e0860c]">
          {t.waitlist.failed}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-4 w-full rounded-2xl bg-[#e0860c] px-6 py-3 font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-95 disabled:opacity-50"
      >
        {busy ? "…" : t.waitlist.submit}
      </button>
      <p className="mt-2 text-center text-xs text-[#e0860c]/60">{allowsContact ? t.waitlist.privacyNote : t.waitlist.privacyNoteAnon}</p>
    </form>
  );
}
