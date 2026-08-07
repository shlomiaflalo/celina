import { prisma } from "../prisma.js";
import { pushToUser } from "./realtime.js";

/**
 * Создаёт уведомление в БД (история + непрочитанные) и сразу шлёт его
 * пользователю по SSE. Текст локализуется на клиенте по полю `type`
 * (`title` несёт машинный токен — например статус заказа, `body` — имя/параметр).
 */
export async function notify(
  userId: string,
  n: { type: string; title?: string; body?: string; orderId?: string }
) {
  const row = await prisma.notification.create({
    data: {
      userId,
      type: n.type,
      title: n.title ?? "",
      body: n.body ?? "",
      orderId: n.orderId ?? null,
    },
  });
  pushToUser(userId, "notification", row);
  return row;
}
