import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Dish } from "../types";
import { useAuth } from "../auth/AuthContext";

/** Ключ localStorage: корзина переживает перезагрузку страницы (F5, случайное закрытие вкладки).
 *  Хранится вместе с владельцем ({ owner, lines }) — корзина одного аккаунта
 *  никогда не «переезжает» к другому на той же вкладке/устройстве. */
const CART_KEY = "celina_cart";

type StoredCart = { owner: string | null; lines: CartLine[] };

function validLines(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  // лёгкая валидация формы — повреждённые данные просто отбрасываем
  return raw.filter((l) => l && l.dish && typeof l.dish.id === "string" && typeof l.qty === "number" && l.qty > 0);
}

function loadCart(): StoredCart {
  if (typeof window === "undefined") return { owner: null, lines: [] }; // SSG-рендер
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || "null");
    if (Array.isArray(raw)) return { owner: null, lines: validLines(raw) }; // старый формат (без владельца)
    if (raw && typeof raw === "object") {
      return { owner: typeof raw.owner === "string" ? raw.owner : null, lines: validLines(raw.lines) };
    }
    return { owner: null, lines: [] };
  } catch {
    return { owner: null, lines: [] };
  }
}

export interface CartLine {
  dish: Dish;
  qty: number;
}

/** Сколько разных поваров можно держать в корзине одновременно (чтобы не спамить заказами). */
export const MAX_COOKS = 2;

/** Результат добавления в корзину: почему не добавилось — решает вызывающий экран. */
export type AddResult = "ok" | "cook-limit" | "no-portions";

interface CartState {
  cookProfileIds: string[];
  lines: CartLine[];
  /** Добавляет блюдо. Корзина не меняется, если вернулось не "ok". */
  add: (dish: Dish) => AddResult;
  /** Сколько порций этого блюда уже в корзине. */
  qtyOf: (dishId: string) => number;
  remove: (dishId: string) => void;
  clear: () => void;
  itemsTotal: number;
  count: number;
  maxCooks: number;
}

const CartCtx = createContext<CartState>(null!);
export const useCart = () => useContext(CartCtx);

function distinctCooks(lines: CartLine[]): string[] {
  const seen: string[] = [];
  for (const l of lines) if (!seen.includes(l.dish.cookProfileId)) seen.push(l.dish.cookProfileId);
  return seen;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const initial = loadCart();
  const [lines, setLines] = useState<CartLine[]>(initial.lines);
  const owner = useRef<string | null>(initial.owner);
  const { user, loading } = useAuth();

  // каждое изменение — в localStorage (вместе с владельцем), чтобы корзина переживала перезагрузку
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify({ owner: owner.current, lines }));
    } catch {
      /* приватный режим / переполненное хранилище — корзина просто не сохранится */
    }
  }, [lines]);

  // Корзина привязана к владельцу, записанному РЯДОМ с ней в localStorage
  // (а не к ref в памяти — тот сбрасывается при каждой перезагрузке, из-за чего
  // корзина утекала следующему аккаунту после 401-разлогина). Правила:
  //  - гостевая корзина (owner=null) переносится тому, кто вошёл первым;
  //  - чужая корзина (owner≠user.id) очищается;
  //  - выход из аккаунта очищает корзину (общий компьютер).
  useEffect(() => {
    if (loading) return; // профиль ещё грузится — решение принимать рано
    const id = user?.id ?? null;
    if (id === null) {
      if (owner.current !== null) {
        owner.current = null;
        setLines([]);
      }
      return;
    }
    if (owner.current === null) {
      owner.current = id; // гость вошёл — корзина становится его
      setLines((l) => [...l]); // пересохранить с владельцем
    } else if (owner.current !== id) {
      owner.current = id; // другой аккаунт — чужие позиции не показываем
      setLines([]);
    }
  }, [user?.id, loading]);

  function add(dish: Dish): AddResult {
    // решение принимаем по текущему состоянию — чтобы вернуть результат синхронно
    const cooks = distinctCooks(lines);
    const isNewCook = !cooks.includes(dish.cookProfileId);
    if (isNewCook && cooks.length >= MAX_COOKS) return "cook-limit";

    // больше, чем повар наготовил, набрать нельзя: иначе покупатель соберёт
    // корзину и упрётся в отказ сервера (409) только на «Оформить заказ»
    const inCart = lines.find((l) => l.dish.id === dish.id)?.qty ?? 0;
    if (inCart >= dish.portions) return "no-portions";

    setLines((prev) => {
      // потолок проверяем ещё раз ВНУТРИ обновления: несколько нажатий в одном
      // такте React батчит, и `lines` из замыкания успевает устареть
      const existing = prev.find((l) => l.dish.id === dish.id);
      if (existing) {
        if (existing.qty >= dish.portions) return prev;
        return prev.map((l) => (l.dish.id === dish.id ? { ...l, qty: l.qty + 1 } : l));
      }
      if (dish.portions < 1) return prev;
      return [...prev, { dish, qty: 1 }];
    });
    return "ok";
  }

  function remove(dishId: string) {
    setLines((prev) =>
      prev
        .map((l) => (l.dish.id === dishId ? { ...l, qty: l.qty - 1 } : l))
        .filter((l) => l.qty > 0)
    );
  }

  function clear() {
    setLines([]);
  }

  const qtyOf = (dishId: string) => lines.find((l) => l.dish.id === dishId)?.qty ?? 0;

  const itemsTotal = lines.reduce((s, l) => s + l.dish.price * l.qty, 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);

  return (
    <CartCtx.Provider
      value={{ cookProfileIds: distinctCooks(lines), lines, add, qtyOf, remove, clear, itemsTotal, count, maxCooks: MAX_COOKS }}
    >
      {children}
    </CartCtx.Provider>
  );
}
