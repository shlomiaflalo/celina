import { prisma } from "../prisma.js";

/** Случайный URL-безопасный код (заглавные буквы/цифры). */
function randomCode(len = 6): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // без похожих 0/O/1/I
  let s = "";
  for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

/** Сгенерировать уникальный реферальный код (с проверкой по БД). */
export async function uniqueReferralCode(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const code = randomCode();
    const exists = await prisma.user.findUnique({ where: { referralCode: code }, select: { id: true } });
    if (!exists) return code;
  }
  return randomCode(8); // крайне маловероятно — берём длиннее
}

/** Гарантировать, что у пользователя есть код (ленивый бэкафилл для старых аккаунтов). */
export async function ensureReferralCode(userId: string): Promise<string> {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { referralCode: true } });
  if (u?.referralCode) return u.referralCode;
  const code = await uniqueReferralCode();
  await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
  return code;
}
