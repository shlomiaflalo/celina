import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLang, useT } from "../i18n";

/**
 * Полностью кастомный выбор даты и времени в фирменных цветах Celina
 * (вместо нативного сине-белого календаря браузера).
 * value/onChange используют формат datetime-local: YYYY-MM-DDTHH:mm.
 */

const pad2 = (n: number) => String(n).padStart(2, "0");
const toValue = (d: Date, h: number, m: number) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(h)}:${pad2(m)}`;

function parseValue(v: string): { date: Date | null; h: number; m: number } {
  const mt = v.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!mt) return { date: null, h: 19, m: 0 };
  return { date: new Date(+mt[1], +mt[2] - 1, +mt[3]), h: +mt[4], m: +mt[5] };
}
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const sameDay = (a: Date | null, b: Date | null) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function buildMonth(view: Date): (Date | null)[][] {
  const y = view.getFullYear(), mo = view.getMonth();
  const days = new Date(y, mo + 1, 0).getDate();
  const lead = (new Date(y, mo, 1).getDay() + 6) % 7; // неделя с понедельника
  const cells: (Date | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(y, mo, d));
  while (cells.length % 7) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function DateTimePicker({
  value,
  onChange,
  triggerClass = "",
  placeholder,
  minDate,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  triggerClass?: string;
  placeholder?: string;
  minDate?: Date;
  /** id кнопки-триггера — чтобы <label htmlFor> связывался с полем (доступность) */
  id?: string;
}) {
  const { lang } = useLang();
  const t = useT();
  const locale = lang === "ru" ? "ru-RU" : "en-US";
  const [open, setOpen] = useState(false);

  const parsed = parseValue(value);
  const selected = parsed.date;
  const [view, setView] = useState<Date>(() => parsed.date ?? new Date());
  const [hour, setHour] = useState(parsed.h);
  const [minute, setMinute] = useState(parsed.m);

  // value может смениться ИЗВНЕ, пока компонент уже смонтирован: повар нажимает
  // «Изменить» на другом блюде, а форма (и этот пикер) уже открыта. Без этой
  // синхронизации час/минута остаются от прошлого блюда — показывалось бы, скажем,
  // 19:00 вместо сохранённых 18:00, а следующий клик по дню ещё и записал бы это
  // неверное время обратно в блюдо.
  useEffect(() => {
    const p = parseValue(value);
    setHour(p.h);
    setMinute(p.m);
    if (p.date) setView(new Date(p.date.getFullYear(), p.date.getMonth(), 1));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const weeks = useMemo(() => buildMonth(view), [view]);
  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i))); // 1 Jan 2024 = понедельник
  }, [locale]);
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(view);

  const today = startOfDay(new Date());
  const minDay = minDate ? startOfDay(minDate) : null;

  const display = selected
    ? new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
        .format(new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), hour, minute))
    : "";

  function pickDay(d: Date) {
    onChange(toValue(d, hour, minute));
  }
  function setTime(h: number, m: number) {
    setHour(h); setMinute(m);
    if (selected) onChange(toValue(selected, h, m));
  }

  return (
    <>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-between gap-2 text-left ${triggerClass}`}
      >
        <span className={display ? "text-[#e0860c]" : "text-[#e0860c]/50"}>
          {display || placeholder || t.gatherings.pickDateTime}
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e0860c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.a11y.datePicker}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-[20rem] max-w-[92vw] rounded-2xl border border-orange-100 bg-white p-4 shadow-2xl">
          {/* шапка месяца */}
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={() => setView(addMonths(view, -1))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#e0860c] transition hover:bg-orange-50" aria-label={t.a11y.prevMonth}>‹</button>
            <div className="text-sm font-semibold capitalize text-[#e0860c]">{monthLabel}</div>
            <button type="button" onClick={() => setView(addMonths(view, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#e0860c] transition hover:bg-orange-50" aria-label={t.a11y.nextMonth}>›</button>
          </div>

          {/* дни недели */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-[#e0860c]/60">
            {weekdays.map((w, i) => <div key={i}>{w}</div>)}
          </div>

          {/* сетка дней */}
          <div className="mt-1 grid grid-cols-7 gap-1">
            {weeks.flat().map((d, i) =>
              d ? (
                <button
                  key={i}
                  type="button"
                  disabled={!!minDay && startOfDay(d) < minDay}
                  onClick={() => pickDay(d)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition
                    ${sameDay(d, selected)
                      ? "bg-[#e0860c] font-semibold text-white shadow-sm"
                      : sameDay(d, today)
                      ? "text-[#e0860c] ring-1 ring-[#e0860c]"
                      : "text-[#e0860c] hover:bg-orange-50"}
                    disabled:cursor-not-allowed disabled:text-[#e0860c]/40 disabled:hover:bg-transparent`}
                >
                  {d.getDate()}
                </button>
              ) : <div key={i} />
            )}
          </div>

          {/* время */}
          <div className="mt-3 flex items-center justify-between border-t border-orange-100 pt-3">
            <span className="text-sm font-medium text-[#e0860c]">{t.gatherings.pickTime}</span>
            <div className="flex items-center gap-1 text-sm">
              <select value={hour} aria-label={t.a11y.hours} onChange={(e) => setTime(Number(e.target.value), minute)}
                className="rounded-lg border border-orange-200 bg-orange-50/50 px-2 py-1 font-semibold text-[#e0860c] outline-none focus:border-[#e0860c]">
                {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{pad2(h)}</option>)}
              </select>
              <span className="font-bold text-[#e0860c]" aria-hidden="true">:</span>
              <select value={minute} aria-label={t.a11y.minutes} onChange={(e) => setTime(hour, Number(e.target.value))}
                className="rounded-lg border border-orange-200 bg-orange-50/50 px-2 py-1 font-semibold text-[#e0860c] outline-none focus:border-[#e0860c]">
                {Array.from({ length: 12 }, (_, k) => k * 5).map((m) => <option key={m} value={m}>{pad2(m)}</option>)}
              </select>
            </div>
          </div>

          <button type="button" onClick={() => setOpen(false)}
            className="btn-solid mt-3 w-full rounded-xl py-2 text-sm font-semibold text-white">
            {t.gatherings.pickDone}
          </button>
        </div>
        </div>,
        document.body
      )}
    </>
  );
}
