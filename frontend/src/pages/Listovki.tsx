import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Head } from "vite-react-ssg";
import { metricaGoal } from "../components/Metrica";

/**
 * /listovki — листовки для подъезда, главный офлайн-канал соседского сервиса.
 *
 * Зачем. У Селины ноль рекламного бюджета, а продукт гиперлокальный: «сосед
 * готовит — сосед забирает». Канонический канал привлечения для такого
 * сервиса — не баннеры, а объявление на доске у лифта: его читает ровно тот
 * двор, который и есть рынок. Эта страница даёт любому повару (и самому
 * основателю) готовый к печати лист A4 с QR-кодом.
 *
 * Правила страницы:
 * - Постеры ЧЕСТНЫЕ: описывают, как работает сервис, без цифр пользователей
 *   и без обещаний. Ни один не говорит «в вашем доме уже готовят».
 * - Страница русская целиком (печатают в России) и НЕ индексируется:
 *   это инструмент, а не посадочная.
 * - QR тёмный, а не фирменный оранжевый: сканеры требуют контраста, и печать
 *   на дешёвом принтере не должна убить читаемость. Текст постера — только
 *   фирменный оранжевый (правило двух цветов).
 * - UTM-метки в ссылках: utm_source=poster / utm_campaign по типу листовки —
 *   чтобы в Метрике было видно, что подъезды работают.
 */

const BASE = "https://celinaeda.ru";

interface Poster {
  key: string;
  /** куда ведёт QR */
  url: string;
  title: string;
  subtitle: string;
  body: string;
  note: string;
}

const POSTERS: Poster[] = [
  {
    key: "cook",
    url: `${BASE}/login?mode=register&role=cook&utm_source=poster&utm_medium=offline&utm_campaign=podezd-cook`,
    title: "Готовите дома?",
    subtitle: "Соседи купят.",
    body:
      "Селина — сервис домашней еды: вы готовите у себя на кухне, соседи по дому и кварталу забирают. 0% комиссии · оплата наличными при получении · деньги через сервис не проходят.",
    note: "Регистрация повара занимает несколько минут",
  },
  {
    key: "buyer",
    url: `${BASE}/?utm_source=poster&utm_medium=offline&utm_campaign=podezd-buyer`,
    title: "Домашняя еда —",
    subtitle: "из вашего дома",
    body:
      "Борщ, пельмени, сырники и выпечка от соседей-поваров — с доставкой или самовывозом из вашего района. Каждый повар проходит проверку личности.",
    note: "Соседи кормят соседей",
  },
  {
    key: "gathering",
    url: `${BASE}/gatherings?utm_source=poster&utm_medium=offline&utm_campaign=podezd-gathering`,
    title: "Соберите соседей",
    subtitle: "за одним столом",
    body:
      "Посиделки и застолья у соседей: кто-то готовит и открывает дверь — остальные приходят. Найдите застолье рядом или позовите к себе.",
    note: "Знакомиться проще за едой",
  },
];

function PosterSheet({ p, qr, forPrint = false }: { p: Poster; qr: string; forPrint?: boolean }) {
  return (
    <div
      className={`poster-sheet flex flex-col items-center bg-white text-center text-[#e0860c] ${forPrint ? "" : "h-full w-full"}`}
    >
      <img src="/images/logo-ru.png" alt="Селина" className="poster-logo mx-auto" />
      <div className="poster-title font-extrabold leading-[1.02]">
        {p.title}
        <br />
        {p.subtitle}
      </div>
      <p className="poster-body mx-auto leading-snug">{p.body}</p>
      {qr ? <img src={qr} alt="QR-код: наведите камеру" className="poster-qr mx-auto" /> : <div className="poster-qr mx-auto" />}
      <div className="poster-url font-extrabold tracking-wide">celinaeda.ru</div>
      <div className="poster-note">{p.note}</div>
    </div>
  );
}

export function Listovki() {
  const [qrs, setQrs] = useState<Record<string, string>>({});
  const [printKey, setPrintKey] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all(
      POSTERS.map((p) =>
        QRCode.toDataURL(p.url, { width: 640, margin: 1, color: { dark: "#1b1b1b", light: "#ffffff" } }).then(
          (d) => [p.key, d] as const
        )
      )
    ).then((pairs) => { if (alive) setQrs(Object.fromEntries(pairs)); });
    return () => { alive = false; };
  }, []);

  // печать одного постера: рендерим его в print-контейнер и зовём диалог печати
  useEffect(() => {
    if (!printKey) return;
    const t = setTimeout(() => {
      window.print();
      setPrintKey(null);
    }, 60);
    return () => clearTimeout(t);
  }, [printKey]);

  const printing = POSTERS.find((p) => p.key === printKey) ?? null;

  return (
    <div className="mx-auto max-w-3xl">
      <Head>
        <title>Листовки для подъезда — Селина</title>
        {/* инструмент, а не посадочная: в индексе ей делать нечего */}
        <meta name="robots" content="noindex, follow" />
      </Head>

      <div className="print:hidden">
        <h1 className="t-h1">Листовки для подъезда</h1>
        <p className="t-lead mt-2 max-w-2xl">
          Самая короткая дорога к соседям — доска объявлений у лифта. Распечатайте лист A4 и
          повесьте в своём подъезде или дворе (с согласия соседей и управляющей компании).
          QR ведёт на Селину, и в Метрике видно, что пришли именно из подъезда.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {POSTERS.map((p) => (
            <div key={p.key} className="card overflow-hidden p-3">
              <div className="poster-preview mx-auto overflow-hidden rounded-lg border border-[var(--hairline)]">
                <PosterSheet p={p} qr={qrs[p.key] ?? ""} />
              </div>
              <button
                onClick={() => { metricaGoal(`poster_print_${p.key}`); setPrintKey(p.key); }}
                className="btn-solid mt-3 w-full rounded-xl px-4 py-2.5 text-sm font-semibold"
              >
                Распечатать
              </button>
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-2xl text-sm opacity-80">
          Честность прежде всего: листовки описывают, как устроен сервис, и не обещают того,
          чего нет. Если в вашем доме поваров ещё нет — повесьте листовку «Готовите дома?»:
          первый повар подъезда обычно и есть тот, кто её повесил.
        </p>
      </div>

      {/* печатается ТОЛЬКО выбранный постер */}
      {printing && (
        <div className="print-only">
          <PosterSheet p={printing} qr={qrs[printing.key] ?? ""} forPrint />
        </div>
      )}
    </div>
  );
}
