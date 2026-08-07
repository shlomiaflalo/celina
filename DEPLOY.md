# Celina — деплой (бесплатный запуск / пилот)

Архитектура: **один сервер в России** (требование ФЗ-152 — персональные данные
граждан РФ хранятся на территории РФ). На нём:
- **nginx** отдаёт статику фронтенда и проксирует `/api` и `/uploads` на Node;
- **Node-бэкенд** (Express + Prisma) на порту 4000, под управлением **PM2**;
- **SQLite** на диске сервера (для пилота достаточно; для роста — миграция на PostgreSQL).

> Денежные сборы отключены (бесплатный запуск): оплата между поваром и покупателем —
> наличными при получении, сбор за активацию повара ВЫКЛЮЧЕН
> (`frontend/src/config.ts → COOK_ACTIVATION_FEE_ENABLED = false`). Поэтому платёжный
> провайдер и компания/банк для запуска НЕ требуются.

---

## 🚀 Самый простой путь — Docker (в одну команду)
Если на сервере есть Docker, весь стек (фронт+бэк+БД) поднимается одной командой —
не нужны nginx/PM2/Node вручную.

```bash
# на сервере, в каталоге проекта:
cp backend/.env.example backend/.env
nano backend/.env   # ОБЯЗАТЕЛЬНО: JWT_SECRET (`openssl rand -hex 32`), SMTP_* (для кодов 2FA/сброса),
                    # SITE_URL=https://ВАШ-ДОМЕН, TRUST_PROXY=0 (Docker публикует контейнер напрямую)
VITE_SITE_URL=https://ВАШ-ДОМЕН docker compose up -d --build   # тот же домен, что SITE_URL
# создать аккаунт основателя (один раз):
docker compose exec celina npm run create-founder
```
Сайт откроется на `http://IP-сервера` (порт 80). Данные (БД, загрузки) — в Docker-томах,
не теряются при пересборке. Для HTTPS добавьте домен + Caddy/nginx (см. ниже).
Обновление версии: `git pull && docker compose up -d --build`.

> Установить Docker на чистом Ubuntu:
> `curl -fsSL https://get.docker.com | sh`

### HTTPS для Docker-пути (домен + Let's Encrypt)
Контейнер использует host-сеть, поэтому TLS терминирует **nginx на хосте**
(конфиг: `deploy/nginx-docker-proxy.conf`, инструкция в шапке файла).
Коротко: в `/root/celina/.env` задать `CELINA_PORT=4000`, `CELINA_HOST=127.0.0.1`
и `VITE_SITE_URL=https://домен`; в `backend/.env` — `SITE_URL=https://домен`,
`TRUST_PROXY=1`; пересобрать (`docker compose up -d --build`), поставить nginx
по конфигу выше и выпустить сертификат `certbot --nginx`. Node остаётся виден
только с 127.0.0.1 — снаружи только nginx на 80/443.

---

## 0. Что нужно от вас (только вы можете сделать)
1. Купить VPS у российского провайдера — напр. **Timeweb Cloud, Selectel, Yandex Cloud, Reg.ru**
   (Ubuntu 22.04, 2 vCPU / 2–4 ГБ RAM достаточно для пилота).
2. Купить домен и направить A-запись DNS на IP сервера (`VITE_SITE_URL` = этот домен).
3. Выполнить шаги ниже по SSH (или Docker-путь выше).

## Ручной путь (без Docker)

## 1. Подготовка сервера
```bash
sudo apt update && sudo apt install -y nginx git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2
```

## 2. Код и сборка
```bash
sudo mkdir -p /var/www/celina && sudo chown $USER /var/www/celina
# залить проект в /var/www/celina (git clone или scp)

# бэкенд
cd /var/www/celina/backend
npm ci
cp .env.example .env
nano .env   # задать: DATABASE_URL="file:./prod.db", свой JWT_SECRET (`openssl rand -hex 32`), SMTP_*,
            # и FRONTEND_DIST=/var/www/celina/frontend/dist (нужно для OG-превью в соцсетях)
            # ВНИМАНИЕ: не перезаписывайте .env позже — в нём живут секреты
npx prisma generate && npx prisma db push
NODE_ENV=production npm run create-founder   # создать аккаунт основателя (БЕЗ демо-данных). НЕ запускать seed на бою.
npm run build        # → dist/server.js

# фронтенд
cd /var/www/celina/frontend
npm ci
npm run build        # → frontend/dist  (статика + предрендер)
```

## 3. Запуск бэкенда (PM2)
```bash
cd /var/www/celina/backend
# NODE_ENV=production ОБЯЗАТЕЛЕН: без него сервер подписывает JWT дев-секретом
# из репозитория (можно подделать токен) и возвращает коды сброса пароля в API-ответах
# TRUST_PROXY=1 — за nginx: реальный IP берётся из X-Forwarded-For (для rate-limit).
# (в Docker-пути НЕ ставьте — там контейнер публикуется напрямую, TRUST_PROXY=0)
NODE_ENV=production TRUST_PROXY=1 pm2 start dist/server.js --name celina-api --update-env
pm2 save && pm2 startup    # автозапуск после перезагрузки
```

## 4. nginx + HTTPS
```bash
sudo cp /var/www/celina/deploy/nginx.conf /etc/nginx/sites-available/celina
# в файле заменить домен и при необходимости путь root
sudo ln -s /etc/nginx/sites-available/celina /etc/nginx/sites-enabled/celina
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d celina.ru -d www.celina.ru
```

## 5. Проверка
- `https://ваш-домен` открывается, лента грузится;
- регистрация повара НЕ требует оплаты (сразу в кабинет);
- загрузка фото блюда работает (`/uploads/...` доступны);
- заказ оформляется (оплата наличными).

## Обновление версии
```bash
cd /var/www/celina && git pull
cd backend && npm ci && npm run build && pm2 restart celina-api
cd ../frontend && npm ci && npm run build && sudo systemctl reload nginx
```

## На будущее (когда появятся компания и счёт)
- Включить сбор за активацию: `COOK_ACTIVATION_FEE_ENABLED = true` + ключи ЮKassa.
- Резервное копирование по расписанию: БД (`backend/prod.db` или том `celina-data`), загрузки (`uploads/`) и ОСОБЕННО документы верификации (`uploads-private/` / том `celina-kyc` — паспорта, восстановить невозможно); миграция на PostgreSQL при росте.
- НЕ запускать `npm run seed` на проде (демо-данные). Только `npm run create-founder`.
