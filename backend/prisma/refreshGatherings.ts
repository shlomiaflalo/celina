import { prisma } from "../src/prisma.js";

/**
 * Сдвигает ПРОШЕДШИЕ застолья в будущее, ничего не удаляя.
 *
 * Зачем: у демо-застолий из seed.ts абсолютные даты, поэтому через пару недель
 * после сеанса сидирования вся страница «Застолья» становится пустой —
 * ключевая витрина продукта выглядит мёртвой. Полный `npm run seed`
 * это чинит, но он удаляет пользователей, заказы и отзывы.
 *
 * Скрипт добавляет ко ВСЕМ прошедшим застольям одно и то же целое число дней,
 * поэтому час начала, день недели и относительные промежутки между застольями
 * сохраняются — расписание выглядит ровно так же, как сразу после сидирования.
 *
 *   npm run demo:refresh
 */
const DAY = 24 * 60 * 60 * 1000;
/** На сколько дней вперёд отодвигаем самое раннее прошедшее застолье. */
const LEAD_DAYS = 2;

async function main() {
  const now = new Date();
  const past = await prisma.gathering.findMany({
    where: { startsAt: { lt: now } },
    orderBy: { startsAt: "asc" },
    select: { id: true, startsAt: true },
  });

  if (!past.length) {
    console.log("✓ Все застолья уже в будущем — сдвигать нечего.");
    return;
  }

  // целое число дней, чтобы не сползали час начала и день недели
  const target = new Date(now.getTime() + LEAD_DAYS * DAY);
  const shiftDays = Math.ceil((target.getTime() - past[0].startsAt.getTime()) / DAY);

  for (const g of past) {
    await prisma.gathering.update({
      where: { id: g.id },
      data: { startsAt: new Date(g.startsAt.getTime() + shiftDays * DAY) },
    });
  }

  console.log(`✓ Сдвинуто застолий: ${past.length} (на ${shiftDays} дн. вперёд).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
