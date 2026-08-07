# Celina — единый образ: собирает фронтенд и бэкенд, один Node-процесс
# отдаёт статику фронта + /api + /uploads (единый origin → относительный /api работает).
# База: node:20 (Debian) — openssl уже встроен (Prisma работает без apk/apt;
# важно для серверов без доступа к Alpine CDN).

# ---- 1. сборка фронтенда ----
FROM node:20 AS frontend
WORKDIR /fe
COPY frontend/package*.json ./
# package-lock.json генерируется на macOS и содержит только darwin-варианты
# платформенных бинарников (rollup, esbuild, lightningcss, @tailwindcss/oxide).
# И `npm ci`, и `npm install` опираются на этот лок, поэтому в linux-контейнере
# сборка падала с «Cannot find module @rollup/rollup-linux-x64-gnu» (npm/cli#4828).
# Удаляем лок и даём npm разрешить дерево под платформу сборки.
RUN rm -f package-lock.json && npm install --no-audit --no-fund
COPY frontend/ ./
ARG VITE_SITE_URL=https://celina.ru
# опциональная аналитика/подтверждение прав (пусто → не подключается)
ARG VITE_YANDEX_METRICA_ID=
ARG VITE_YANDEX_VERIFICATION=
ARG VITE_GOOGLE_VERIFICATION=
ENV VITE_SITE_URL=$VITE_SITE_URL \
    VITE_YANDEX_METRICA_ID=$VITE_YANDEX_METRICA_ID \
    VITE_YANDEX_VERIFICATION=$VITE_YANDEX_VERIFICATION \
    VITE_GOOGLE_VERIFICATION=$VITE_GOOGLE_VERIFICATION
RUN npm run build

# ---- 2. сборка бэкенда ----
FROM node:20 AS backend
WORKDIR /be
COPY backend/package*.json ./
# та же причина, что и во фронтенд-стадии: лок собран на macOS
RUN rm -f package-lock.json && npm install --no-audit --no-fund
COPY backend/ ./
RUN npx prisma generate && npm run build

# ---- 3. рантайм ----
# node:20 (полный, Debian) уже содержит openssl/libssl3 и ca-certificates —
# никаких apk/apt не требуется (работает на серверах без доступа к пакетным CDN).
FROM node:20
WORKDIR /app
ENV NODE_ENV=production PORT=4000 FRONTEND_DIST=/app/frontend-dist
COPY --from=backend /be/node_modules ./node_modules
COPY --from=backend /be/package*.json ./
COPY --from=backend /be/dist ./dist
COPY --from=backend /be/prisma ./prisma
COPY --from=backend /be/assets ./assets
# исходники + tsconfig нужны для tsx-скриптов обслуживания (create-founder, reset-data)
COPY --from=backend /be/src ./src
COPY --from=backend /be/tsconfig.json ./tsconfig.json
COPY --from=frontend /fe/dist ./frontend-dist
EXPOSE 4000
# при старте: применяем схему к БД (idempotent), затем запускаем сервер
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/server.js"]
