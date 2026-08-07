import { useEffect, useState } from "react";
import { DrinkIcon } from "./icons";
import { useT, useLang } from "../i18n";

// уведомления о посиделках → наша фирменная чашка чая; остальные → наша чаша
const isDrink = (s: string) => /чай|чаепити|посиделк|tea|get-together/i.test(s);

/**
 * Сцена входа: телефонные уведомления Celina всплывают одно за другим,
 * как push-сообщения на экране блокировки.
 */
export function NotifScene() {
  const t = useT();
  const { lang } = useLang();
  // словесный знак логотипа по языку (чаша уже слева): RU → Селина, EN → Celina
  const wordmark = lang === "en" ? "Celina" : "Селина";
  const items = t.notifs.items;
  const [stack, setStack] = useState<number[]>([0]);

  useEffect(() => {
    const id = setInterval(() => {
      setStack((prev) => {
        const next = (prev[0] + 1) % items.length;
        return [next, ...prev].slice(0, 4);
      });
    }, 2400);
    return () => clearInterval(id);
  }, [items.length]);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {stack.map((idx, pos) => (
        <div
          key={`${idx}-${stack.length - pos}`}
          className={`notif-card rounded-2xl bg-white/95 p-4 shadow-xl ${pos === 0 ? "notif-in" : ""}`}
          style={{ opacity: 1 - pos * 0.22, transform: `scale(${1 - pos * 0.03})` }}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
              {isDrink(items[idx]) ? <DrinkIcon size={26} /> : <img src="/images/celina-symbol.svg" alt="" className="h-7 w-7" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="wordmark text-sm" style={{ color: "#e0860c" }}>{wordmark}</span>
                <span className="text-xs text-[#e0860c]/60">{t.notifs.now}</span>
              </div>
              <p className="mt-0.5 text-sm font-medium leading-snug text-[#e0860c]">
                {items[idx]}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
