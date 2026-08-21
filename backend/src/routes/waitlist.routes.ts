import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { isOperatingCity } from "../lib/operatingCities.js";
import { rateLimit } from "../middleware/rateLimit.js";

/**
 * Список ожидания по районам: «Приведите Селину в свой двор».
 * Честное решение холодного старта — копим НАСТОЯЩИЙ спрос до появления
 * поваров. Публичный, без авторизации. Числа показываем только реальные.
 */
export const waitlistRouter = Router();

const joinSchema = z.object({
  city: z.string().min(1).max(120),
  district: z.string().max(160).optional(),
  contact: z.string().max(160).optional(),
  role: z.enum(["EATER", "COOK"]).default("EATER"),
});

// POST /api/waitlist — записаться. Возвращает РЕАЛЬНОЕ число ожидающих в городе.
waitlistRouter.post("/", rateLimit({ windowMs: 60 * 60_000, max: 20 }), async (req, res) => {
  const parsed = joinSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Укажите город" });
  const { city, district, contact, role } = parsed.data;
  // Список ожидания принимает ЛЮБОЙ город, в том числе за пределами России:
  // копить спрос можно где угодно, работать — только там, где есть оферта
  // (см. isOperatingCity). Но за пределами России мы не храним НИЧЕГО, что
  // указывает на человека.
  //
  // IP — персональные данные почти во всех этих юрисдикциях. Пока он писался
  // на каждую заявку, «обезличенная карта спроса» обезличенной не была: житель
  // Алматы, сознательно оставивший поле контакта пустым, всё равно оказывался
  // в базе на российском сервере. Без IP и без контакта форма собирает
  // статистику по районам и не подпадает под казахстанский закон 94-V и
  // узбекский ЗРУ-547 ВООБЩЕ — это лучше, чем подпадать и иметь оправдание.
  const operating = isOperatingCity(city);
  const ip = operating
    ? ((req.headers["x-forwarded-for"] as string | undefined)?.split(",").pop()?.trim() || req.ip || null)
    : null;
  await prisma.waitlist.create({
    data: { city, district: district || null, contact: operating ? contact || null : null, role, ip },
  });
  const cityCount = await prisma.waitlist.count({ where: { city } });
  res.json({ ok: true, cityCount });
});

// GET /api/waitlist/count?city= — реальное число ожидающих в городе (для честной социальной подсказки)
waitlistRouter.get("/count", async (req, res) => {
  const city = String(req.query.city || "").slice(0, 120);
  if (!city) return res.json({ cityCount: 0 });
  const cityCount = await prisma.waitlist.count({ where: { city } });
  res.json({ cityCount });
});
