import { useState } from "react";
import { api } from "../api/client";
import { Button } from "../components/ui";
import { useT, useLang } from "../i18n";
import { Seo } from "../components/Seo";
import { metricaGoal } from "../components/Metrica";

const EMAIL = "celinarussia.support@gmail.com";

/** Страница Связаться с нами — форма отправляет письмо НА СЕРВЕРЕ (без mailto). */
export function Contact() {
  const t = useT();
  const { lang } = useLang();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const input =
    "w-full rounded-xl border border-[color:var(--hairline)] bg-orange-50/40 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-200";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // письмо уходит на сервере — почтовый клиент не открывается, текст не теряется
      await api.post("/contact", form);
      setSent(true);
      metricaGoal("contact_sent"); // KPI: обращение отправлено
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setBusy(false);
    }
  }

  const valid = form.name.trim() && /\S+@\S+\.\S+/.test(form.email) && form.message.trim();

  return (
    <div className="mx-auto max-w-lg">
      <Seo
        title={lang === "en" ? "Contact Celina — reach the team" : "Контакты Celina — связаться с командой"}
        description={lang === "en" ? "Contact the Celina team: questions about homemade food, cook and buyer support, partnerships." : "Свяжитесь с командой Celina: вопросы о домашней еде, поддержка поваров и покупателей, сотрудничество."}
        path="/contact"
      />
      <h1 className="t-h1 mb-2 text-center text-white drop-shadow">
        {t.contact.title}
      </h1>
      <p className="mx-auto mb-6 max-w-md text-center text-white/90">{t.contact.intro}</p>

      <div className="rounded-3xl border border-[color:var(--hairline)] bg-white/80 p-7 shadow-xl shadow-orange-500/10 backdrop-blur">
        {sent ? (
          <div className="py-10 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-3xl text-[#e0860c]">
              ✓
            </div>
            <div className="text-lg font-bold text-[#e0860c]">{t.contact.sent}</div>
            <p className="mt-2 text-sm text-[#e0860c]/85">{t.contact.sentBody}</p>
            <p className="mt-3 text-xs text-[#e0860c]/70">
              {t.contact.sentHint}{" "}
              <a href={`mailto:${EMAIL}`} className="font-semibold underline decoration-orange-300 underline-offset-2">
                {EMAIL}
              </a>
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input
              className={input}
              placeholder={t.contact.formName}
              aria-label={t.contact.formName}
              value={form.name}
              onChange={set("name")}
              autoComplete="name"
              required
            />
            <input
              className={input}
              type="email"
              inputMode="email"
              placeholder={t.contact.formEmail}
              aria-label={t.contact.formEmail}
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
              required
            />
            <textarea
              className={`${input} min-h-[130px] resize-y`}
              placeholder={t.contact.formMessage}
              aria-label={t.contact.formMessage}
              value={form.message}
              onChange={set("message")}
              required
            />
            {error && <p className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-[#e0860c]">{error}</p>}
            <Button type="submit" full disabled={!valid || busy}>
              {busy ? t.contact.sending : t.contact.send}
            </Button>
          </form>
        )}
      </div>

      {/* быстрая связь в WhatsApp — белый значок в круге цвета логотипа (без подписи) */}
      <a
        href={`https://wa.me/972545594088?text=${encodeURIComponent(lang === "en" ? "Hello! I'm writing from Celina 🍲 I have a question — I'd appreciate your help." : "Здравствуйте! Я пишу из Celina 🍲 Подскажите, пожалуйста — у меня есть вопрос, буду благодарен за помощь.")}`}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#e0860c] shadow-[0_8px_22px_rgba(176,104,8,0.4)] ring-2 ring-white/80 transition hover:brightness-110 active:scale-95"
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
        </svg>
      </a>
    </div>
  );
}
