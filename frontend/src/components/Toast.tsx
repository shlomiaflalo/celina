import { useEffect, useState } from "react";
import { Button } from "./ui";
import { useT } from "../i18n";

/**
 * Наше фирменное всплывающее сообщение вместо системного alert() (синего на Mac).
 * Центрированная карточка с кнопкой ОК, авто-закрытие через ~5 секунд.
 * Использование: toast("текст") из любого места.
 */
let listeners: ((m: string) => void)[] = [];
export function toast(message: string) {
  listeners.forEach((l) => l(message));
}

export function ToastHost() {
  const t = useT();
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const l = (m: string) => setMsg(m);
    listeners.push(l);
    return () => { listeners = listeners.filter((x) => x !== l); };
  }, []);

  useEffect(() => {
    if (!msg) return;
    const id = window.setTimeout(() => setMsg(null), 5000);
    return () => window.clearTimeout(id);
  }, [msg]);

  if (!msg) return null;
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onClick={() => setMsg(null)}
    >
      <div className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <p className="mb-5 text-base font-semibold text-[#e0860c]">{msg}</p>
        <Button full onClick={() => setMsg(null)}>{t.common.ok}</Button>
      </div>
    </div>
  );
}
