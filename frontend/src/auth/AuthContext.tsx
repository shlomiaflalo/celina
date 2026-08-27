import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, getToken, setToken } from "../api/client";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string, logoutSessionId?: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
}

export interface RegisterData {
  phone: string;
  name: string;
  password: string;
  role: "BUYER" | "COOK";
  kitchenName?: string;
  city?: string;
  address?: string;
  lat?: number;
  lng?: number;
  policyAccepted?: boolean;
  ref?: string; // реферальный код пригласившего (из ссылки ?ref=)
}

const AuthCtx = createContext<AuthState>(null!);
export const useAuth = () => useContext(AuthCtx);

// Кэш профиля (stale-while-revalidate): при повторном открытии сайта страница
// рендерится МГНОВЕННО из кэша, а /auth/me лишь освежает данные в фоне.
// Без этого на медленной сети вход = 1–2 секунды оранжевого экрана со спиннером
// (гварды в App.tsx ждут loading). Кэш читается только при наличии токена и
// чистится при выходе; отозванную сессию всё равно ловит 401 первого же запроса.
const USER_CACHE_KEY = "celina_user_cache";
function readUserCache(): User | null {
  try {
    // SSG-пререндер (Node): браузерного хранилища нет — рендерим как гостя
    if (typeof window === "undefined" || typeof localStorage === "undefined") return null;
    if (!getToken()) return null;
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch { return null; }
}
function writeUserCache(u: User | null) {
  try {
    if (u) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_CACHE_KEY);
  } catch { /* приватный режим */ }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => readUserCache());
  // ждём сеть только если токен есть, а кэша нет (самый первый вход с устройства)
  const [loading, setLoading] = useState(
    () => typeof window !== "undefined" && !!getToken() && !readUserCache()
  );

  // единая точка: состояние + кэш всегда согласованы
  function setUser(u: User | null) {
    setUserState(u);
    writeUserCache(u);
  }

  useEffect(() => {
    const startToken = getToken();
    if (!startToken) {
      setLoading(false);
      return;
    }
    api
      .get<{ user: User }>("/auth/me")
      .then((r) => setUser(r.user))
      .catch((e: Error & { status?: number }) => {
        // токен чистим только при НАСТОЯЩЕМ 401 и только если это ВСЁ ЕЩЁ тот
        // же токен: медленный 401 старого токена не должен стирать свежий,
        // полученный при входе за это время
        if (e?.status === 401 && getToken() === startToken) { setToken(null); setUser(null); }
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(phone: string, password: string, logoutSessionId?: string) {
    const r = await api.post<{ token: string; user: User }>("/auth/login", {
      phone,
      password,
      // при лимите устройств пользователь выбирает, какое отключить, и входит
      ...(logoutSessionId ? { logoutSessionId } : {}),
    });
    setToken(r.token);
    setUser(r.user);
    return r.user;
  }

  async function register(data: RegisterData) {
    const r = await api.post<{ token: string; user: User }>("/auth/register", data);
    setToken(r.token);
    setUser(r.user);
    return r.user;
  }

  function logout() {
    // отзываем серверную сессию текущего устройства (best-effort, до очистки токена)
    api.post("/auth/logout").catch(() => {});
    setToken(null);
    setUser(null);
  }

  async function refresh() {
    if (!getToken()) return;
    const r = await api.get<{ user: User }>("/auth/me");
    setUser(r.user);
  }

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}
