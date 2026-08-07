/**
 * IndexNow — мгновенное уведомление поисковиков (в первую очередь Яндекса) о
 * новых/обновлённых URL. Это самый быстрый канал попадания в индекс: вместо
 * ожидания обхода краулером мы сами пингуем страницу при её появлении.
 *
 * Ключ лежит статикой во фронтенде: frontend/public/<KEY>.txt (тот же KEY).
 * SITE_URL и INDEXNOW_KEY берутся из окружения; если не заданы — тихо пропускаем
 * (в деве/без домена ничего не шлём).
 */
const KEY = process.env.INDEXNOW_KEY || "8edae11c797769c3b915396a36f69e51";
const SITE_URL = (process.env.SITE_URL || process.env.VITE_SITE_URL || "").replace(/\/$/, "");

/** Пингует IndexNow (Яндекс) о том, что перечисленные пути обновились. Best-effort. */
export async function pingIndexNow(paths: string[]): Promise<void> {
  if (!SITE_URL || !paths.length) return;
  let host: string;
  try { host = new URL(SITE_URL).host; } catch { return; }
  const urlList = paths.map((p) => `${SITE_URL}${p.startsWith("/") ? p : "/" + p}`);
  const body = { host, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList };
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    await fetch("https://yandex.com/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
  } catch {
    /* сеть недоступна / поисковик недоступен — не критично, sitemap подхватит позже */
  }
}

/**
 * Пинг ВСЕГО sitemap при старте сервера (= при каждом деплое): новые статьи,
 * лендинги и городские страницы попадают в очередь Яндекса за часы, а не ждут
 * планового обхода неделями. Контент меняется только деплоем, поэтому старт
 * контейнера — точный момент «что-то обновилось». Best-effort, с задержкой,
 * чтобы не мешать старту.
 */
export function pingSitemapOnStart(sitemapPath: string): void {
  if (!SITE_URL) return;
  setTimeout(async () => {
    try {
      const { readFileSync } = await import("node:fs");
      const xml = readFileSync(sitemapPath, "utf8");
      const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
        .map((m) => { try { return new URL(m[1]).pathname; } catch { return null; } })
        .filter((p): p is string => !!p);
      if (paths.length) {
        await pingIndexNow(paths);
        console.log(`[indexnow] пропингованы ${paths.length} URL из sitemap`);
      }
    } catch { /* sitemap не найден (дев без сборки) — пропускаем */ }
  }, 30_000);
}
