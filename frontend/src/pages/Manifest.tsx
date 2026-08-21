import { Link } from "react-router-dom";
import { Seo, SITE_URL, breadcrumbJsonLd } from "../components/Seo";
import { ShareButtons } from "../components/ShareButtons";
import { useLang } from "../i18n";

/**
 * /manifest — публичный манифест бренда. Душа Селины одним текстом: почему
 * человек, который готовил, важнее скорости. Сделан, чтобы им ХОТЕЛИ делиться
 * и чтобы о нём писала пресса. Пререндерится, в sitemap, со схемой.
 */
export function Manifest() {
  const { lang } = useLang();
  const en = lang === "en";

  const jsonLd = [
    breadcrumbJsonLd([
      { name: en ? "Home" : "Главная", path: "/" },
      { name: en ? "Manifesto" : "Манифест", path: "/manifest" },
    ]),
  ];

  const ru = {
    title: "Манифест Селины — соседи кормят соседей",
    desc: "Мы верим, что еду должен готовить человек, а не конвейер. Манифест Селины: возвращаем в города вкус, имя и лицо.",
    kicker: "Манифест",
    h1: "Соседи кормят соседей",
    lines: [
      "Мы научились получать всё за пятнадцать минут. И где-то по дороге потеряли то, ради чего вообще садятся за стол.",
      "Бургер приезжает быстрее, чем закипает чайник. Но тарелку настоящей домашней еды — той, что кто-то приготовил своими руками, — не найти ни в одном приложении страны.",
      "Не потому, что нет поваров. В каждом дворе живёт человек, чью еду знает весь подъезд. Просто между ним и соседями никогда не было моста.",
      "Селина — этот мост.",
      "Мы не строим ещё одну доставку. Мы возвращаем еде то, что у неё отняли: имя, лицо и историю. За каждым блюдом — человек, а не бренд. К нему можно прийти снова, сказать спасибо, позвать за стол.",
      "Мы верим, что огромную страну можно сделать теплее — по одной тарелке борща за раз. Что сосед, которого ты знаешь по имени, — это богатство, которого нам всем не хватает. Что доверие нельзя доставить курьером, но можно вырастить за общим столом.",
      "Наша валюта — не скорость. Доверие.",
      "Если вы это чувствуете — вы уже с нами.",
    ],
    signoff: "Соседи кормят соседей. В этом вся идея.",
    ctaCook: "Стать поваром",
    ctaFeed: "Найти повара рядом",
    shareLabel: "Поделитесь манифестом",
    shareText: "Соседи кормят соседей. Манифест Селины —",
    relatedTitle: "Дальше",
    related: [
      { to: "/vstrechi", label: "Встречи за общим столом" },
      { to: "/dostavka", label: "Как работает доставка" },
      { to: "/about", label: "О Селине" },
    ],
  };
  const enC = {
    title: "The Celina Manifesto — Neighbors Feeding Neighbors",
    desc: "We believe food should be made by a person, not a conveyor belt. The Celina manifesto: bringing taste, a name and a face back to our cities.",
    kicker: "Manifesto",
    h1: "Neighbors feeding neighbors",
    lines: [
      "We learned to get everything in fifteen minutes. And somewhere along the way we lost the very thing we sit down at a table for.",
      "A burger arrives before the kettle boils. But a plate of real home-cooked food — made by someone's own hands — can't be found in any app in the country.",
      "Not because there are no cooks. In every courtyard lives someone whose food the whole building knows. There was simply never a bridge between them and their neighbors.",
      "Celina is that bridge.",
      "We're not building another delivery app. We're giving food back what was taken from it: a name, a face, a story. Behind every dish is a person, not a brand — someone you can return to, thank, invite to your table.",
      "We believe a huge country can be made warmer — one bowl of borscht at a time. That a neighbor you know by name is a wealth we're all missing. That trust can't be delivered by courier, but it can grow around a shared table.",
      "Our currency isn't speed. It's trust.",
      "If you feel this — you're already one of us.",
    ],
    signoff: "Neighbors feeding neighbors. That's the whole idea.",
    ctaCook: "Become a cook",
    ctaFeed: "Find a cook nearby",
    shareLabel: "Share the manifesto",
    shareText: "Neighbors feeding neighbors. The Celina manifesto —",
    relatedTitle: "Next",
    related: [
      { to: "/vstrechi", label: "Meetups at a shared table" },
      { to: "/dostavka", label: "How delivery works" },
      { to: "/about", label: "About Celina" },
    ],
  };
  const c = en ? enC : ru;

  return (
    <div className="mx-auto max-w-2xl text-white">
      <Seo title={ru.title} titleEn={enC.title} description={ru.desc} descriptionEn={enC.desc} path="/manifest" jsonLd={jsonLd} />

      <p className="text-sm font-semibold uppercase tracking-widest text-white/70">{c.kicker}</p>
      <h1 className="mt-2 text-3xl font-black leading-tight drop-shadow sm:text-5xl">{c.h1}</h1>

      <div className="mt-7 space-y-5">
        {c.lines.map((line, i) => (
          <p
            key={i}
            className={
              line === c.lines[3] || line.startsWith("Наша валюта") || line.startsWith("Our currency")
                ? "text-xl font-bold leading-relaxed text-white drop-shadow sm:text-2xl"
                : "text-lg leading-relaxed text-white/95"
            }
          >
            {line}
          </p>
        ))}
      </div>

      <p className="mt-8 border-t border-white/20 pt-6 text-center text-xl font-bold text-white drop-shadow">{c.signoff}</p>

      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-semibold text-[#e0860c] shadow-sm transition hover:bg-orange-50 active:scale-95">
          {c.ctaFeed} →
        </Link>
        <Link to="/login?mode=register&role=cook" className="inline-flex items-center gap-2 rounded-xl border border-white/60 px-5 py-2.5 font-semibold text-white transition hover:bg-white/10 active:scale-95">
          {c.ctaCook} →
        </Link>
      </div>

      <div className="mx-auto mt-8 max-w-sm rounded-3xl bg-white/10 p-5">
        <div className="mb-1 text-center text-sm font-medium text-white/90">{c.shareLabel}</div>
        <ShareButtons url={SITE_URL + "/manifest"} text={c.shareText} onAmber />
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-bold text-white/90">{c.relatedTitle}</h2>
        <div className="flex flex-wrap gap-2">
          {c.related.map((r) => (
            <Link key={r.to} to={r.to} className="rounded-full bg-white/90 px-3.5 py-1.5 text-sm font-medium text-[#e0860c] transition hover:bg-white">
              {r.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
