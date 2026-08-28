import { useCallback, useEffect, useState } from "react";

/**
 * Избранные повара — хранятся локально (localStorage), без сервера.
 * Синхронизируется между вкладками и компонентами через событие "celina-favs".
 */
const KEY = "celina_favs";

function read(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [ids, setIds] = useState<string[]>(read);

  useEffect(() => {
    const sync = () => setIds(read());
    window.addEventListener("storage", sync);
    window.addEventListener("celina-favs", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("celina-favs", sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const cur = read();
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    // приватный режим Safari бросает на setItem: избранное тогда живёт хотя бы
    // в пределах сессии, а не роняет обработчик клика целиком
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* не сохранится */ }
    setIds(next);
    window.dispatchEvent(new Event("celina-favs"));
  }, []);

  const isFav = useCallback((id: string) => ids.includes(id), [ids]);

  return { favs: ids, isFav, toggle };
}
