// Тонкий клиент REST API. Токен хранится в localStorage.

const TOKEN_KEY = "celina_token";

// текущий язык интерфейса (для перевода серверных ошибок на бэке)
function currentLang(): string {
  try {
    return localStorage.getItem("celina_lang") === "en" ? "en" : "ru";
  } catch {
    return "ru";
  }
}
function fallbackError(status: number): string {
  return currentLang() === "en" ? `Error ${status}` : `Ошибка ${status}`;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json", "X-Lang": currentLang() };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    // токен протух / нет доступа → чистим сессию и уводим на вход (без голой ошибки).
    // Исключение: сам /auth/logout — после «выйти везде» он ожидаемо ловит 401
    // (сессия уже отозвана), и жёсткий window-редирект тут не нужен.
    if (res.status === 401 && token && !path.startsWith("/auth/logout")) {
      setToken(null);
      if (!location.pathname.startsWith("/login")) location.assign("/login");
    }
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.error || fallbackError(res.status)) as Error & {
      status?: number; retryAfterSec?: number; deviceLimit?: boolean; sessions?: unknown[]; maxDevices?: number;
    };
    err.status = res.status; // код нужен вызывающим, чтобы отличать 401 от сетевых сбоев
    // 429 с таймером (напр. лимит запросов кода сброса) — отдаём вызывающему для обратного отсчёта
    if (typeof data.retryAfterSec === "number") err.retryAfterSec = data.retryAfterSec;
    // 409 лимит устройств — отдаём список сессий, чтобы дать выбрать, что отключить
    if (data.deviceLimit) { err.deviceLimit = true; err.sessions = data.sessions; err.maxDevices = data.maxDevices; }
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

type UploadResult = { url: string; mime?: string; kind?: "image" | "video" | "doc" };

async function uploadTo(path: string, file: File): Promise<UploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  const headers: Record<string, string> = { "X-Lang": currentLang() };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { method: "POST", headers, body: fd });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || fallbackError(res.status));
  }
  return res.json();
}

const uploadFile = (file: File) => uploadTo("/api/uploads", file);
// документы верификации — в приватное хранилище (см. бэкенд uploads.routes)
const uploadKyc = (file: File) => uploadTo("/api/uploads/kyc", file);

/** Приватные KYC-ссылки требуют токен в query (для <img>/<video>, которые не
 *  умеют слать заголовок Authorization). Обычные /uploads-ссылки — без изменений. */
function kycUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (!url.startsWith("/api/uploads/kyc/")) return url;
  const token = getToken();
  return token ? `${url}?token=${encodeURIComponent(token)}` : url;
}

export const api = {
  get: <T>(p: string) => request<T>("GET", p),
  post: <T>(p: string, b?: unknown) => request<T>("POST", p, b),
  put: <T>(p: string, b?: unknown) => request<T>("PUT", p, b),
  patch: <T>(p: string, b?: unknown) => request<T>("PATCH", p, b),
  del: <T>(p: string) => request<T>("DELETE", p),
  upload: uploadFile,
  uploadKyc,
  kycUrl,
};
