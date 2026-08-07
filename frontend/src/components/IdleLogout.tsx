import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { toast } from "./Toast";
import { useT } from "../i18n";

/**
 * Авто-выход из аккаунта после 1 часа БЕЗ активности — из соображений
 * безопасности (чужой человек не получит доступ к брошенной сессии).
 * Активность (движение мыши/клавиши/скролл/касания) сбрасывает отсчёт.
 * Отметка времени в localStorage → работает и между вкладками, и при
 * возврате на страницу после долгого простоя. Описано в Политике (§ авто-выход).
 */
const IDLE_MS = 60 * 60 * 1000; // 1 час
const KEY = "celina_last_activity";

export function IdleLogout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const lastWrite = useRef(0);

  useEffect(() => {
    if (!user) return;
    // вход/появление на странице считаем активностью
    try { localStorage.setItem(KEY, String(Date.now())); } catch { /* приватный режим */ }

    const mark = () => {
      const now = Date.now();
      if (now - lastWrite.current > 20_000) { // троттлинг записи
        lastWrite.current = now;
        try { localStorage.setItem(KEY, String(now)); } catch { /* приватный режим */ }
      }
    };
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"] as const;
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }));

    let done = false;
    const check = () => {
      if (done) return;
      let last = 0;
      try { last = Number(localStorage.getItem(KEY) || 0); } catch { /* приватный режим */ }
      if (last && Date.now() - last >= IDLE_MS) {
        done = true;
        logout();
        toast(t.auth.autoLogout);
        // страница входа вне Layout (без ToastHost) — оставляем флаг, чтобы
        // показать причину баннером на самой странице входа
        try { sessionStorage.setItem("celina_signout_reason", "idle"); } catch { /* приватный режим */ }
        navigate("/login");
      }
    };
    const iv = setInterval(check, 30_000);
    const onVis = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      events.forEach((e) => window.removeEventListener(e, mark));
      clearInterval(iv);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return null;
}
