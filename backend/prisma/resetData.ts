import { prisma } from "../src/prisma.js";

/**
 * Полный сброс данных до чистого состояния: удаляет ВСЕ демо/пользовательские
 * данные (пользователи, повара, блюда, заказы, отзывы, застолья, уведомления),
 * СОХРАНЯЯ только аккаунт(ы) основателя (isFounder = true).
 *
 * Для запуска перед настоящим запуском, чтобы на сайте не было демо-данных:
 *   npm run reset-data
 */
async function main() {
  // дочерние таблицы → родительские (безопасный порядок по внешним ключам)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.gatheringRsvp.deleteMany();
  await prisma.gathering.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.cookProfile.deleteMany();
  // все пользователи, КРОМЕ основателя
  const del = await prisma.user.deleteMany({ where: { isFounder: false } });

  const founders = await prisma.user.count({ where: { isFounder: true } });
  console.log(`✓ Сброс выполнен. Удалено пользователей: ${del.count}. Осталось основателей: ${founders}.`);
  if (founders === 0) {
    console.log("⚠ Нет аккаунта основателя — создайте его: npm run create-founder");
  }
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
