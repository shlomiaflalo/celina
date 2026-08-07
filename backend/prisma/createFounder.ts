import bcrypt from "bcryptjs";
import { prisma } from "../src/prisma.js";

/**
 * Создаёт/обновляет ТОЛЬКО аккаунт основателя — без демо-данных.
 * Для продакшена: панель /founder и одобрение верификаций доступны только этому
 * аккаунту (по его телефону), вход защищён паролем + 2FA-кодом на e-mail.
 *
 * Значения берутся из переменных окружения (заданы — используются они):
 *   FOUNDER_PHONE, FOUNDER_EMAIL, FOUNDER_NAME, FOUNDER_PASSWORD
 * Запуск:  npm run create-founder
 */
async function main() {
  const phone = process.env.FOUNDER_PHONE;
  const email = process.env.FOUNDER_EMAIL;
  const name = process.env.FOUNDER_NAME || "Founder";
  const password = process.env.FOUNDER_PASSWORD;

  // Никаких дефолтов для самой привилегированной учётки: скрипт обязан упасть,
  // а не создать основателя с предсказуемым паролем.
  if (!phone || !email || !password) {
    console.error(
      "Не заданы обязательные переменные окружения.\n" +
        "Пример:\n" +
        "  FOUNDER_PHONE=+70000000000 FOUNDER_EMAIL=you@example.com \\\n" +
        "  FOUNDER_PASSWORD='<надёжный пароль>' npm run create-founder"
    );
    process.exit(1);
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    await prisma.user.update({
      where: { phone },
      data: { email, name, isFounder: true, passwordHash },
    });
    console.log(`✓ Основатель обновлён: ${phone} (${email})`);
  } else {
    await prisma.user.create({
      data: {
        phone, email, name, passwordHash,
        role: "BUYER", isFounder: true, city: "Москва",
        isVerified: true, verificationStatus: "VERIFIED", verifiedAt: new Date(), policyAcceptedAt: new Date(),
      },
    });
    console.log(`✓ Основатель создан: ${phone} (${email})`);
  }
  if (!process.env.FOUNDER_PASSWORD) {
    console.log("⚠ Пароль по умолчанию. Задайте FOUNDER_PASSWORD и перезапустите для своего пароля.");
  }
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
