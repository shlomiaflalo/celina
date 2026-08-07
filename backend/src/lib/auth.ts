import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Role } from "./enums.js";

const DEFAULT_SECRET = "celina-dev-secret";
// публично известные значения из репозитория — с ними токен может подделать кто угодно
const KNOWN_WEAK_SECRETS = new Set([DEFAULT_SECRET, "замените-на-длинный-случайный-секрет"]);
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_SECRET;

// В production запрещаем дефолтный/слабый/скопированный из .env.example секрет.
if (
  process.env.NODE_ENV === "production" &&
  (!process.env.JWT_SECRET || KNOWN_WEAK_SECRETS.has(JWT_SECRET) || JWT_SECRET.length < 16)
) {
  throw new Error(
    "JWT_SECRET must be a strong, unique value in production (>=16 chars, not the default/example). Generate one: openssl rand -base64 48"
  );
}

export interface TokenPayload {
  userId: string;
  role: Role;
  /** id сессии (устройства) — для отзыва входа с других устройств.
   *  Старые токены без sid остаются валидными (проверка сессии пропускается). */
  sid?: string;
  /** момент выдачи (unix-секунды) — проставляется jwt.sign автоматически;
   *  нужен, чтобы отзывать старые sid-less токены через sessionsRevokedAt */
  iat?: number;
}

// 12 раундов bcrypt — сильнее против перебора (старые хеши с cost=10 остаются валидными).
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
