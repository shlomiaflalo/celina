import { unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../prisma.js";

/**
 * Удаление аккаунта по требованию пользователя.
 *
 * Почему это существует. Политика конфиденциальности на живом сайте обещает:
 * «Удалить аккаунт можно в настройках профиля» (LegalContent.tsx). Функции не
 * было — то есть документ обещал то, чего продукт не умеет. Плюс это прямая
 * обязанность: ст. 21 152-ФЗ требует прекратить обработку и уничтожить данные
 * при отзыве согласия, а биометрию (селфи-видео и документ) — тем более.
 *
 * Почему НЕ delete() строки User. У заказа две стороны. Если покупатель
 * исчезает вместе с заказами, повар теряет собственную историю: что он готовил,
 * кому отдал и за что получил деньги. Данные повара — это не данные
 * покупателя, и стирать их по чужому запросу нельзя. Поэтому:
 *
 *   • личность обезличивается — телефон, имя, e-mail, адрес, координаты;
 *   • биометрия уничтожается ФИЗИЧЕСКИ: файлы селфи-видео и документа
 *     удаляются с диска, а не только ссылки из базы;
 *   • заказы и отзывы остаются, но без имени за ними;
 *   • сессии отзываются, вход становится невозможен.
 *
 * Если у аккаунта нет ни одного заказа, отзыва и застолья — сохранять нечего,
 * и строка удаляется целиком.
 */
export async function deleteAccount(userId: string): Promise<{ mode: "erased" | "anonymised" }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, verificationVideoUrl: true, verificationDocUrl: true,
      _count: { select: { orders: true, reviews: true, hostedGatherings: true, gatheringRsvps: true } },
      cookProfile: { select: { id: true } },
    },
  });
  if (!user) throw new Error("not found");

  // Биометрия уходит с диска в любом случае — и при удалении, и при обезличивании.
  for (const url of [user.verificationVideoUrl, user.verificationDocUrl]) {
    if (!url) continue;
    // Ссылка вида /kyc/<file> или /uploads-private/<file>; берём только имя,
    // чтобы «../» из базы не увёл нас в чужой каталог.
    const safe = path.basename(url);
    for (const dir of ["uploads-private", "uploads"]) {
      await unlink(path.resolve(dir, safe)).catch(() => {});
    }
  }

  const c = user._count;
  const hasHistory = c.orders > 0 || c.reviews > 0 || c.hostedGatherings > 0 || c.gatheringRsvps > 0 || !!user.cookProfile;

  if (!hasHistory) {
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.notification.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    return { mode: "erased" };
  }

  // Телефон уникален — освобождаем его, чтобы человек мог зарегистрироваться
  // заново, и одновременно делаем невозможным вход в старый аккаунт.
  const tombstone = `deleted:${userId}`;
  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId } }),
    prisma.notification.deleteMany({ where: { userId } }),
    prisma.user.update({
      where: { id: userId },
      data: {
        phone: tombstone,
        name: "Удалённый аккаунт",
        email: null,
        address: null,
        lat: null,
        lng: null,
        passwordHash: tombstone,
        resetCode: null,
        resetCodeExp: null,
        twoFACode: null,
        twoFAExp: null,
        founderSessionUntil: null,
        sessionsRevokedAt: new Date(),
        verificationVideoUrl: null,
        verificationDocUrl: null,
        verificationStatus: "UNVERIFIED",
        isVerified: false,
        verifiedAt: null,
        biometricConsentAt: null,
        referralCode: null,
      },
    }),
  ]);
  return { mode: "anonymised" };
}
