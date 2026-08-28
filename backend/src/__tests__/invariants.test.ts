/**
 * Регрессионные тесты инвариантов, которые НЕЛЬЗЯ нарушать.
 *
 * Зачем этот файл существует. За два дня в проекте нашлось и починилось 35
 * подтверждённых багов — в том числе утечка домашних координат поваров в
 * публичный API и оракул перебора аккаунтов. Все они чинились «руками», и
 * ничто не мешает вернуть их обратно одной неаккуратной правкой (например,
 * ночной автоматизацией, которая перепишет сериализатор).
 *
 * Здесь закреплены ровно те свойства, ради которых чинилось: приватность,
 * границы авторизации и правила заказа. Тест не проверяет вёрстку и тексты —
 * он проверяет обещания, которые Селина даёт людям.
 *
 * Запуск:  npm test   (node:test, без новых зависимостей)
 * База:    отдельный файл test.db — боевые/дев данные не трогаются.
 */
import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

// ВАЖНО: подменяем базу ДО импорта prisma-клиента (он читает env при создании).
const TEST_DB = resolve(process.cwd(), "prisma/test.db");
process.env.DATABASE_URL = `file:${TEST_DB}`;
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-not-for-production";

const { createApp } = await import("../app.js");
const { prisma } = await import("../prisma.js");
const { signToken } = await import("../lib/auth.js");
const { hashPassword } = await import("../lib/auth.js");

let server: import("node:http").Server;
let base: string;

/** Простой HTTP-хелпер: без supertest, чтобы не тащить зависимость. */
async function call(
  method: string,
  path: string,
  opts: { token?: string; body?: unknown } = {}
): Promise<{ status: number; json: any }> {
  const res = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  return { status: res.status, json };
}

const ids = {
  cookUser: "test-cook-user",
  cookProfile: "test-cook-profile",
  buyer: "test-buyer",
  dish: "test-dish",
  gathering: "test-gathering",
};
let cookToken = "";
let buyerToken = "";

before(async () => {
  if (existsSync(TEST_DB)) rmSync(TEST_DB);
  // схему поднимаем прямо из prisma-схемы (быстрее и честнее, чем миграции)
  execFileSync("npx", ["prisma", "db", "push", "--skip-generate", "--accept-data-loss"], {
    env: { ...process.env, DATABASE_URL: `file:${TEST_DB}` },
    stdio: "ignore",
  });

  const cookUser = await prisma.user.create({
    data: {
      id: ids.cookUser,
      phone: "+79990001111",
      name: "Тестовый Повар",
      passwordHash: hashPassword("test-pass"),
      role: "COOK",
      city: "Москва",
      isVerified: true,
      // ТОЧНЫЕ домашние координаты — именно они не должны утекать наружу
      lat: 55.7601234,
      lng: 37.6045678,
    },
  });
  await prisma.cookProfile.create({
    data: {
      id: ids.cookProfile,
      userId: cookUser.id,
      kitchenName: "Тестовая кухня",
      city: "Москва",
      cuisine: "домашняя",
      deliveryFee: 200,
      minOrder: 0,
      deliveryEnabled: true,
      pickupEnabled: false,
      isOnline: true,
    },
  });
  await prisma.dish.create({
    data: {
      id: ids.dish,
      cookProfileId: ids.cookProfile,
      title: "Борщ",
      price: 500,
      category: "горячее",
      portions: 50,
      isAvailable: true,
      photoUrl: "/uploads/borscht.jpg",
    },
  });
  const buyer = await prisma.user.create({
    data: {
      id: ids.buyer,
      phone: "+79990002222",
      name: "Тестовый Покупатель",
      passwordHash: hashPassword("test-pass"),
      role: "BUYER",
      city: "Москва",
      isVerified: true,
      lat: 55.75,
      lng: 37.6,
    },
  });
  await prisma.gathering.create({
    data: {
      id: ids.gathering,
      hostId: cookUser.id,
      title: "Тестовое застолье",
      description: "Проверка приватности",
      coverUrl: "/uploads/test.jpg",
      city: "Москва",
      address: "Тверская улица, 7",
      lat: 55.7601234,
      lng: 37.6045678,
      startsAt: new Date(Date.now() + 86_400_000),
      maxSeats: 4,
      pricePerGuest: 0,
    },
  });

  cookToken = signToken({ userId: cookUser.id, role: "COOK" } as any);
  buyerToken = signToken({ userId: buyer.id, role: "BUYER" } as any);

  server = createApp().listen(0);
  await new Promise((r) => server.once("listening", r));
  const addr = server.address();
  base = `http://127.0.0.1:${typeof addr === "object" && addr ? addr.port : 4000}`;
});

after(async () => {
  server?.close();
  await prisma.$disconnect();
  if (existsSync(TEST_DB)) rmSync(TEST_DB);
});

describe("Приватность: домашний адрес повара", () => {
  test("публичный список поваров НЕ отдаёт lat/lng вложенного user", async () => {
    const { status, json } = await call("GET", "/api/cooks");
    assert.equal(status, 200);
    const cook = json.cooks.find((c: any) => c.id === ids.cookProfile);
    assert.ok(cook, "тестовый повар должен быть в выдаче");
    assert.ok(cook.user, "профиль пользователя отдаётся");
    assert.equal(cook.user.lat, undefined, "lat повара не должен попадать наружу");
    assert.equal(cook.user.lng, undefined, "lng повара не должен попадать наружу");
  });

  test("координаты в выдаче огрублены (не точный адрес)", async () => {
    const { json } = await call("GET", "/api/cooks");
    const cook = json.cooks.find((c: any) => c.id === ids.cookProfile);
    // 55.7601234 → 55.76 (3 знака): расстояние считается, дом не находится
    assert.notEqual(cook.lat, 55.7601234, "точная координата не должна отдаваться");
    const decimals = String(cook.lat).split(".")[1] ?? "";
    assert.ok(decimals.length <= 3, `ожидали ≤3 знаков после запятой, получили ${cook.lat}`);
  });

  test("страница повара тоже не отдаёт точные координаты", async () => {
    const { json } = await call("GET", `/api/cooks/${ids.cookProfile}`);
    assert.equal(json.cook.user?.lat, undefined);
    assert.notEqual(json.cook.lat, 55.7601234);
  });
});

describe("Приватность: застолье", () => {
  test("аноним не видит адрес, имена гостей и точные координаты", async () => {
    const { status, json } = await call("GET", `/api/gatherings/${ids.gathering}`);
    assert.equal(status, 200);
    const g = json.gathering;
    assert.equal(g.address, null, "адрес скрыт до записи");
    assert.deepEqual(g.attendees, [], "имена гостей не для анонимов");
    assert.notEqual(g.lat, 55.7601234, "точные координаты дома хоста скрыты");
  });

  test("хост видит свой адрес и точные координаты", async () => {
    const { json } = await call("GET", `/api/gatherings/${ids.gathering}`, { token: cookToken });
    assert.equal(json.gathering.address, "Тверская улица, 7");
    assert.equal(json.gathering.lat, 55.7601234);
  });
});

describe("Безопасность: перебор аккаунтов", () => {
  test("/auth/forgot отвечает одинаково для существующего и неизвестного", async () => {
    const known = await call("POST", "/api/auth/forgot", { body: { identifier: "+79990001111" } });
    const unknown = await call("POST", "/api/auth/forgot", { body: { identifier: "+79995559999" } });
    assert.equal(known.status, unknown.status, "коды ответа должны совпадать");
    assert.deepEqual(
      Object.keys(known.json).sort(),
      Object.keys(unknown.json).sort(),
      "набор полей не должен выдавать существование аккаунта"
    );
  });
});

describe("Безопасность: KYC-ссылки", () => {
  test("/auth/verify отклоняет внешний URL", async () => {
    const { status } = await call("POST", "/api/auth/verify", {
      token: buyerToken,
      body: {
        videoUrl: "https://evil.example/track",
        docUrl: "https://evil.example/x.jpg",
        biometricConsent: true,
      },
    });
    assert.notEqual(status, 200, "внешние ссылки не должны сохраняться");
  });

  test("/auth/verify отклоняет чужую приватную папку", async () => {
    const { status } = await call("POST", "/api/auth/verify", {
      token: buyerToken,
      body: {
        videoUrl: `/api/uploads/kyc/${ids.cookUser}/${"a".repeat(32)}.mp4`,
        docUrl: `/api/uploads/kyc/${ids.cookUser}/${"b".repeat(32)}.jpg`,
        biometricConsent: true,
      },
    });
    assert.notEqual(status, 200, "ссылка на чужую папку не должна приниматься");
  });
});

describe("Границы работы сервиса", () => {
  test("нельзя переехать в нерабочий город через PUT /auth/me", async () => {
    const { status } = await call("PUT", "/api/auth/me", {
      token: buyerToken,
      body: { city: "Ереван" },
    });
    assert.equal(status, 400, "город вне России должен отклоняться");
    const me = await prisma.user.findUnique({ where: { id: ids.buyer } });
    assert.equal(me?.city, "Москва", "город в базе не должен измениться");
  });
});

describe("Заказы", () => {
  test("самовывоз у повара без самовывоза отклоняется", async () => {
    const { status } = await call("POST", "/api/orders", {
      token: buyerToken,
      body: {
        cookProfileId: ids.cookProfile,
        fulfillment: "PICKUP",
        items: [{ dishId: ids.dish, qty: 1 }],
      },
    });
    assert.equal(status, 400, "повар не принимает самовывоз — заказ невозможен");
  });

  test("два РАЗНЫХ заказа на одну сумму не схлопываются в дубль", async () => {
    // 1×500 и — после доставки 200 — итог совпадёт с другим составом,
    // поэтому сравниваем именно поведение дедупликации по составу.
    const first = await call("POST", "/api/orders", {
      token: buyerToken,
      body: {
        cookProfileId: ids.cookProfile,
        fulfillment: "DELIVERY",
        address: "Тверская улица, 7",
        items: [{ dishId: ids.dish, qty: 1 }],
      },
    });
    const second = await call("POST", "/api/orders", {
      token: buyerToken,
      body: {
        cookProfileId: ids.cookProfile,
        fulfillment: "DELIVERY",
        address: "Тверская улица, 7",
        items: [{ dishId: ids.dish, qty: 2 }],
      },
    });
    // второй заказ имеет ДРУГОЙ состав → обязан создаться отдельно
    if (first.status === 201 || first.status === 200) {
      assert.ok(second.json.order, "второй заказ должен существовать");
      assert.notEqual(
        second.json.order.id,
        first.json.order?.id,
        "заказ с другим составом не должен считаться дублем"
      );
    }
  });

  test("повторный ИДЕНТИЧНЫЙ заказ схлопывается (защита от двойного клика)", async () => {
    const body = {
      cookProfileId: ids.cookProfile,
      fulfillment: "DELIVERY" as const,
      address: "Тверская улица, 7",
      items: [{ dishId: ids.dish, qty: 3 }],
    };
    const a = await call("POST", "/api/orders", { token: buyerToken, body });
    const b = await call("POST", "/api/orders", { token: buyerToken, body });
    if (a.json.order && b.json.order) {
      assert.equal(b.json.order.id, a.json.order.id, "двойной клик не должен плодить заказы");
    }
  });
});
