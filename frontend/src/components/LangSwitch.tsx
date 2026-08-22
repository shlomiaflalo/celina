import { useLang, type Lang } from "../i18n";

export function LangSwitch({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { lang, setLang } = useLang();
  const langs: Lang[] = ["ru", "en"];
  const base = tone === "light" ? "text-white/80" : "";

  return (
    <div className={`flex items-center gap-0 text-sm ${base}`}>
      {langs.map((l, i) => (
        <span key={l} className="flex items-center">
          {/* косая черта наклонена вправо — без увеличенного правого отступа
              она выглядит «прилипшей» к EN */}
          {i > 0 && <span className="ml-1.5 mr-2 opacity-40">/</span>}
          <button
            onClick={() => setLang(l)}
            // -m компенсирует padding: кликабельная зона растёт до ~44px
            // (минимум для пальца), а видимая вёрстка не сдвигается ни на px
            className={`-m-1.5 p-1.5 uppercase transition ${
              lang === l
                ? tone === "light"
                  ? "font-bold text-white"
                  : "font-bold text-[#e0860c]"
                : "hover:opacity-100 opacity-70"
            }`}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
