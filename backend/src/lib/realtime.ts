import type { Response } from "express";

/**
 * Лёгкая шина событий в реальном времени поверх SSE.
 * На каждого пользователя может быть несколько подключений (вкладки/устройства).
 */
type Client = { userId: string; res: Response };
const clients = new Set<Client>();

export function addClient(userId: string, res: Response): () => void {
  const c: Client = { userId, res };
  clients.add(c);
  return () => clients.delete(c);
}

/** Отправить событие конкретному пользователю (во все его подключения). */
export function pushToUser(userId: string, event: string, data: unknown) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const c of clients) {
    if (c.userId === userId) {
      try { c.res.write(payload); } catch { /* соединение закрыто — игнор */ }
    }
  }
}

/** Онлайн ли пользователь прямо сейчас (есть активное SSE-подключение). */
export function isOnline(userId: string): boolean {
  for (const c of clients) if (c.userId === userId) return true;
  return false;
}
