# Celina — System Architecture

> A platform connecting private home cooks with buyers. Target market: Russia. Interface in Russian.

---

## 1. What the Product Does (in short)

A two-sided marketplace for home-cooked food:

- **Cook (Повар / Cook)** — a private individual who cooks at home, sets up a virtual "kitchen", uploads a menu with dishes, receives orders and manages them.
- **Buyer (Покупатель / Buyer)** — discovers nearby cooks, browses menus, orders dishes, pays, and tracks the order.

The platform is the intermediary: discovery, ordering, payment, rating, and trust.

---

## 2. Technology Stack

| Layer | Technology | Why |
|------|-----------|-----|
| Frontend | React 18 + Vite + TypeScript | Fast, modern, easy to extend |
| Routing | React Router | Separate user areas (buyer / cook) |
| State / data | TanStack Query | Caching and synchronization with the API |
| Styling | Tailwind CSS | Fast to build, consistent |
| Language | i18next (ru primary) | Russian interface, ready for expansion |
| Backend | Node + Express + TypeScript | Simple, flexible, familiar |
| ORM / DB | Prisma + SQLite (dev) → PostgreSQL (prod) | Clean data model, easy migration to Postgres |
| Auth | JWT (phone + password) | Standard; ready for OTP later |
| Validation | Zod | Input safety on the server |

The split: `backend/` and `frontend/` are separate, communicating via REST API.

---

## 3. Roles and Permissions (Roles)

- `BUYER` — buyer.
- `COOK` — cook. Every cook also owns a `CookProfile`.
- A user could in the future be both (same account, two modes). In the first phase we separate by `role`.

---

## 4. Data Model (Domain Model)

```
User (base user)
 ├─ id, phone, name, passwordHash, role, address, city, lat/lng, createdAt
 │
 ├─ CookProfile (1:1, cooks only)
 │   ├─ kitchenName, bio, avatarUrl, coverUrl
 │   ├─ cuisine[], rating, ratingsCount
 │   ├─ isOnline (accepting orders now?)
 │   ├─ deliveryEnabled, pickupEnabled, deliveryFee, minOrder
 │   └─ Dish[] (the menu)
 │
 └─ Order[] (as buyer)

Dish (dish)
 ├─ cookProfileId, title, description, price
 ├─ photoUrl, category (супы/горячее/выпечка/салаты/десерты...)
 ├─ portions (how many portions available), prepTimeMin
 ├─ tags[] (allergens / vegetarian / spicy...)
 └─ isAvailable

Order (order)
 ├─ buyerId, cookProfileId
 ├─ status (PENDING → ACCEPTED → COOKING → READY → DELIVERED / CANCELLED)
 ├─ fulfillment (DELIVERY | PICKUP), scheduledFor
 ├─ total, deliveryFee, address
 ├─ OrderItem[] (dishId, qty, priceAtOrder, titleSnapshot)
 └─ createdAt

Review (rating)
 └─ orderId, buyerId, cookProfileId, rating(1-5), comment, createdAt
```

### Order Lifecycle (Order status)
`PENDING` (the buyer ordered) → `ACCEPTED` (the cook confirmed) → `COOKING` → `READY`
→ `DELIVERED` (completed) · At any stage before READY, `CANCELLED` is possible.

---

## 5. Buyer Pages (Buyer)

1. **Home / discovery (Лента)** — nearby cooks and dishes, search, filtering by category/cuisine.
2. **Cook profile (Профиль повара)** — kitchen description, rating, the full menu.
3. **Dish page (Блюдо)** — photo, description, price, prep time, add to cart.
4. **Cart (Корзина)** — item summary, delivery/pickup selection, scheduling.
5. **Checkout (Оформление заказа)** — address, payment method, confirmation.
6. **Order tracking (Заказ)** — real-time status.
7. **My orders (Мои заказы)** — history + leaving a rating.

## 6. Cook Pages (Cook)

1. **Dashboard (Панель)** — incoming orders, "accepting orders" toggle (online), today's earnings.
2. **Menu management (Меню)** — dish CRUD: add/edit/delete, availability, stock.
3. **Orders (Заказы)** — accept/decline, advancing status (accepted→cooking→ready→delivered).
4. **My kitchen (Моя кухня)** — profile editing, photos, delivery areas, delivery fees.
5. **Earnings (Доходы)** — sales summary, ratings received.

---

## 7. API Structure (REST)

```
POST   /api/auth/register        Registration (role: BUYER|COOK)
POST   /api/auth/login           Login → JWT
GET    /api/auth/me              The logged-in user

GET    /api/cooks                List of cooks (discovery, filtering)
GET    /api/cooks/:id            Cook profile + menu
PUT    /api/cooks/me             Edit cook profile (COOK)
PATCH  /api/cooks/me/status      online/offline (COOK)

GET    /api/dishes               Dish search
POST   /api/dishes               Create dish (COOK)
PUT    /api/dishes/:id           Edit (COOK, owner)
DELETE /api/dishes/:id           Delete (COOK, owner)

POST   /api/orders               Create order (BUYER)
GET    /api/orders               My orders (by role)
GET    /api/orders/:id           Single order
PATCH  /api/orders/:id/status    Advance status (COOK) / cancel

POST   /api/reviews              Rating after an order (BUYER)
```

---

## 8. Folder Structure

```
celina/
├── docs/                ← planning documents
├── backend/
│   ├── prisma/          ← schema + seed
│   └── src/
│       ├── routes/      ← API routes
│       ├── middleware/  ← auth, errors
│       ├── lib/         ← JWT helpers etc.
│       ├── app.ts       ← Express setup
│       └── server.ts    ← entry point
└── frontend/
    └── src/
        ├── pages/
        │   ├── buyer/   ← buyer pages
        │   └── cook/    ← cook pages
        ├── components/
        ├── api/         ← API client
        ├── i18n/        ← translations (ru)
        └── App.tsx
```

---

## 9. Build Phases (Roadmap)

- **Phase 0 — foundation (here):** data model, backend with API, seed with Russian data, frontend skeleton with routing and i18n.
- **Phase 1:** buyer pages — discovery, cook profile, dish, cart, order.
- **Phase 2:** cook pages — dashboard, menu management, orders.
- **Phase 3:** real authentication (OTP), photos, payments.
- **Phase 4:** ratings, notifications, migration to PostgreSQL for production.
