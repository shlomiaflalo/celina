import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { toast } from "../../components/Toast";
import type { CookProfile, Dish, Order } from "../../types";
import { ReviewForm } from "../../components/ReviewForm";
import { Spinner, Stars, Badge, Button, ErrorState, ConfirmModal, EmptyState } from "../../components/ui";
import { PinIcon, DeliveryIcon, BasketIcon, DrinkIcon, VideoIcon, ClockIcon, AlertIcon } from "../../components/icons";
import { SteamFx } from "../../components/SteamFx";
import { DishGallery } from "../../components/DishGallery";
import { VerifiedBadge } from "../../components/VerifiedBadge";
import { playBell } from "../../lib/fx";
import { useCart } from "../../cart/CartContext";
import { useRealtime } from "../../realtime/RealtimeContext";
import { useFavorites } from "../../lib/favorites";
import { cityImage } from "../../lib/cityImage";
import { sameCity } from "../../lib/address";
import { DeleteButton } from "../../components/DeleteButton";
import { useAuth } from "../../auth/AuthContext";
import { useT, useTr, useLang, plRu } from "../../i18n";
import { Seo, SITE_URL, clampMeta } from "../../components/Seo";
import { ShareButtons } from "../../components/ShareButtons";
import { seoCookToProfile, citySlugOf, cityPrepOf } from "../../lib/seoData";
import type { ReactNode } from "react";

export function CookProfilePage() {
  const t = useT();
  const tr = useTr();
  const { lang } = useLang();
  const { id } = useParams();
  const navigate = useNavigate();
  // начальное состояние — из статического снимка (даёт реальный HTML при пререндере
  // и мгновенный первый кадр на клиенте); затем обновляем живым запросом к API.
  const [cook, setCook] = useState<CookProfile | null>(() => (id ? seoCookToProfile(id) : null));
  const [failed, setFailed] = useState(false);
  const [notFound, setNotFound] = useState(false); // кухни не существует (404)
  const [guests, setGuests] = useState(2);
  const [booking, setBooking] = useState(false);
  const bookingRef = useRef(false);
  const [booked, setBooked] = useState(false);
  // подтверждение перед бронью: случайное касание на телефоне не должно
  // мгновенно создавать заказ и уводить на страницу заказов
  const [confirmDine, setConfirmDine] = useState(false);
  const { add, lines, cookProfileIds, maxCooks } = useCart();
  // текст всплывающей подсказки, когда блюдо добавить нельзя (null — всё в порядке)
  const [cartLimit, setCartLimit] = useState<string | null>(null);
  // этот повар недоступен для добавления, если в корзине уже 2 ДРУГИХ повара
  const cookBlocked = !!cook && !cookProfileIds.includes(cook.id) && cookProfileIds.length >= maxCooks;
  function tryAdd(dish: Dish) {
    if (!user) return navigate("/login");
    const res = add(dish);
    if (res === "ok") return;
    setCartLimit(
      res === "no-portions"
        ? t.cart.allPortionsInCart.replace("{x}", String(dish.portions))
        : t.cart.maxCooksWarn
    );
    window.setTimeout(() => setCartLimit(null), 4000);
  }
  const { startCall } = useRealtime();
  const { isFav, toggle } = useFavorites();
  const { user } = useAuth();
  const isOwner = !!cook && user?.cookProfile?.id === cook.id;
  // заказ возможен только в своём городе: доставка не выходит за пределы города
  const cityMismatch = !!user && !!user.city && !!cook?.city && !sameCity(user.city, cook.city);

  // доставленный, ещё не оценённый заказ у ЭТОГО повара → даём оставить отзыв прямо на странице кухни
  const [reviewableOrderId, setReviewableOrderId] = useState<string | null>(null);
  // id отзыва, ожидающего подтверждения удаления (через НАШ ConfirmModal)
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  function loadReviewable() {
    if (!user || isOwner || !cook) { setReviewableOrderId(null); return; }
    api.get<{ orders: Order[] }>("/orders")
      .then((r) => {
        const o = r.orders.find((x) => x.cookProfileId === cook.id && x.status === "DELIVERED" && !x.review);
        setReviewableOrderId(o?.id ?? null);
      })
      .catch(() => {});
  }
  useEffect(loadReviewable, [user?.id, isOwner, cook?.id]);

  // шаг 1: клик по «Присоединиться» → просим подтвердить (гости + сумма),
  // и только после подтверждения создаём заказ (bookDinner)
  function askDinner() {
    if (!cook || bookingRef.current || booked) return;
    if (!user) { navigate("/login"); return; }
    if (!user.isVerified) { navigate("/verify"); return; }
    setConfirmDine(true);
  }

  async function bookDinner() {
    // синхронная защита от двойного клика (state обновляется асинхронно и пропускает быстрые клики)
    if (!cook || bookingRef.current || booked) return;
    if (!user) { navigate("/login"); return; }
    if (!user.isVerified) { navigate("/verify"); return; }
    bookingRef.current = true;
    setBooking(true);
    try {
      const r = await api.post<{ order: { id: string } }>("/orders/dinein", {
        cookProfileId: cook.id,
        guests,
      });
      playBell();
      setBooked(true);
      setTimeout(() => navigate(`/orders/${r.order.id}`), 1150);
    } catch (e) {
      toast(e instanceof Error ? e.message : t.common.error);
      bookingRef.current = false;
      setBooking(false);
    }
  }

  function loadCook() {
    setFailed(false);
    api.get<{ cook: CookProfile }>(`/cooks/${id}`)
      .then((r) => setCook(r.cook))
      .catch((e: Error & { status?: number }) => {
        // 404 = кухни не существует (старая/демо-ссылка из поисковика) — честно
        // говорим об этом, а не показываем «проверьте соединение». Прочие ошибки —
        // настоящие сетевые сбои, для них остаётся ErrorState с повтором.
        if (e?.status === 404) { setCook(null); setNotFound(true); }
        else setFailed(true);
      });
  }
  useEffect(loadCook, [id]);

  async function removeReview(reviewId: string) {
    // подтверждаем НАШИМ модальным окном (а не системным confirm() — синим на Mac)
    try {
      await api.del(`/reviews/${reviewId}`);
      loadCook();
    } catch (e) {
      toast(e instanceof Error ? e.message : t.common.error);
    }
  }

  const byCategory = useMemo(() => {
    const map = new Map<string, Dish[]>();
    cook?.dishes?.forEach((d) => {
      const arr = map.get(d.category) ?? [];
      arr.push(d);
      map.set(d.category, arr);
    });
    return [...map.entries()];
  }, [cook]);

  if (notFound)
    return (
      <EmptyState
        icon={<span className="text-white"><BasketIcon size={44} /></span>}
        title={t.cookProfile.notFoundTitle}
        actionLabel={t.common.backToFeed}
        onAction={() => navigate("/")}
      />
    );
  if (failed) return <ErrorState onRetry={loadCook} />;
  if (!cook) return <Spinner />;

  const qtyOf = (dish: Dish) => lines.find((l) => l.dish.id === dish.id)?.qty ?? 0;

  // структурированные данные для поисковиков: ресторан + меню + отзывы + хлебные крошки
  const cookUrl = `${SITE_URL}/cooks/${cook.id}`;
  const seoTitle = `${cook.kitchenName} — домашняя еда${cook.city ? ` в ${cityPrepOf(cook.city)}` : ""} | Celina`;
  // насыщенное и в пределах 158 символов: короткое авторское bio дополняем продающим текстом
  const cookFallback = `Закажите домашнюю еду у повара ${cook.kitchenName}${cook.city ? ` в городе ${cook.city}` : ""} на Celina. ${cook.dishes?.length ?? 0} ${plRu(cook.dishes?.length ?? 0, ["блюдо, приготовленное", "блюда, приготовленных", "блюд, приготовленных"])} дома по семейным рецептам. Доставка и самовывоз.`;
  const cookBio = cook.bio?.trim() || "";
  const seoDesc = clampMeta(cookBio.length >= 70 ? cookBio : (cookBio ? `${cookBio} — ${cookFallback}` : cookFallback));
  const jsonLd: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: cook.kitchenName,
      url: cookUrl,
      servesCuisine: cook.cuisine,
      address: cook.city ? { "@type": "PostalAddress", addressLocality: cook.city, addressCountry: "RU" } : undefined,
      image: cook.dishes?.find((d) => d.photoUrl)?.photoUrl || undefined,
      aggregateRating: cook.ratingsCount > 0 ? { "@type": "AggregateRating", ratingValue: cook.rating, reviewCount: cook.ratingsCount } : undefined,
      // отдельные отзывы соседей → Review-schema (звёзды и цитаты в выдаче Яндекса/Google)
      review: (cook.reviews ?? [])
        .filter((r) => r.comment && r.comment.trim())
        .slice(0, 10)
        .map((r) => ({
          "@type": "Review",
          reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
          author: { "@type": "Person", name: r.buyer?.name || "Гость" },
          datePublished: r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : undefined,
          reviewBody: r.comment,
        })),
      hasMenu: {
        "@type": "Menu",
        hasMenuSection: byCategory.map(([category, dishes]) => ({
          "@type": "MenuSection",
          name: t.categories[category] || category,
          hasMenuItem: dishes.map((d) => ({
            "@type": "MenuItem",
            name: d.title,
            description: d.description || undefined,
            offers: { "@type": "Offer", price: d.price, priceCurrency: "RUB" },
          })),
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: (() => {
        const items: object[] = [{ "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL }];
        const cs = citySlugOf(cook.city);
        if (cook.city && cs) items.push({ "@type": "ListItem", position: 2, name: `Домашняя еда в ${cityPrepOf(cook.city)}`, item: `${SITE_URL}/eda/${cs}` });
        items.push({ "@type": "ListItem", position: items.length + 1, name: cook.kitchenName, item: cookUrl });
        return items;
      })(),
    },
  ];

  return (
    <div>
      <Seo title={seoTitle} description={seoDesc} path={`/cooks/${cook.id}`} type="profile" image={cook.dishes?.find((d) => d.photoUrl)?.photoUrl ?? undefined} jsonLd={jsonLd} />
      {cartLimit && (
        <div className="fixed inset-x-0 top-16 z-[60] mx-auto w-fit max-w-[92%] rounded-xl bg-[#e0860c] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg">
          {cartLimit}
        </div>
      )}
      <Link to="/" className="text-sm  hover:underline">
        ← {t.nav.feed}
      </Link>

      {/* шапка-обложка */}
      <div className="mt-3 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
        <div className="relative h-32 sm:h-40">
          {/* обложка = фото города; кадрируем по нижней части — видно город/достопримечательности, а не небо */}
          <img src={cityImage(cook.city)} alt={cook.city || ""} className="h-full w-full object-cover" style={{ objectPosition: "center 72%" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
          {!isOwner && (
            <button
              onClick={() => toggle(cook.id)}
              aria-label={t.feed.favorites}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#e0860c] shadow-sm backdrop-blur transition hover:bg-white active:scale-90"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav(cook.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
            </button>
          )}
          <div className="absolute bottom-3 left-5 right-5 flex items-end justify-between">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-white drop-shadow sm:text-3xl">
              {tr(cook.kitchenName)}
              {cook.user?.isVerified && <VerifiedBadge size={22} />}
            </h1>
            <Badge tone={cook.isOnline ? "green" : "neutral"}>
              {cook.isOnline ? t.cookProfile.workingNow : t.cookProfile.closed}
            </Badge>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 text-sm ">
            <Stars rating={cook.rating} />
            <span className="font-medium ">{cook.rating.toFixed(1)}</span>
            <span>· {cook.ratingsCount} {t.cook.reviews(cook.ratingsCount)}</span>
          </div>
          {cook.bio && <p className="mt-2 ">{tr(cook.bio)}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {cook.cuisine.map((c) => (
              <Badge key={c}>{t.cuisines[c] || c}</Badge>
            ))}
            {!isOwner && cook.isOnline && (
              <button
                onClick={async () => {
                  if (!user) return navigate("/login");
                  const id = await startCall(cook.id, tr(cook.kitchenName));
                  if (!id) toast(t.video.offline);
                }}
                className="glass-soft ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
              >
                <VideoIcon size={18} />{" "}
                {user ? t.video.call : `${t.auth.loginToTalk} ${tr(cook.user?.name || cook.kitchenName).split(" ")[0]}`}
              </button>
            )}
          </div>

          {/* инфо о доставке */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <InfoTile icon={<DeliveryIcon size={22} />} label={t.cookProfile.deliveryFrom} value={`${cook.deliveryFee} ${t.common.rub}`} />
            <InfoTile icon={<BasketIcon size={22} />} label={t.cookProfile.minOrder} value={`${cook.minOrder} ${t.common.rub}`} />
            <InfoTile icon={<PinIcon size={22} />} label={t.auth.city} value={cook.city ? t.cities[cook.city] || cook.city : "—"} />
          </div>
        </div>
      </div>

      {/* ── Ужин у повара дома (особая фишка) ── */}
      {cook.dineInEnabled && (
        <div className="mt-5 rounded-3xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <DrinkIcon size={26} />
            {/* имя через разделитель — без склонения (избегаем «Посиделки с Георгий») */}
            <h2 className="text-lg font-bold">
              {t.dineIn.title} · {tr(cook.user?.name || cook.kitchenName).split(" ")[0]}
            </h2>
            <Badge tone="amber">{t.dineIn.special}</Badge>
          </div>
          {cook.dineInDesc && <p className="mt-2 text-sm ">{tr(cook.dineInDesc)}</p>}

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-2xl font-bold ">
                {cook.dineInPrice} {t.common.rub}
                <span className="text-sm font-normal "> / {t.dineIn.perGuest}</span>
              </div>
              <div className="text-xs ">
                {t.dineIn.seatsLeft}: {cook.dineInSeats}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm ">{t.dineIn.guests}:</span>
              <button
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                aria-label={t.a11y.decreaseGuests}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-200 bg-white text-lg leading-none hover:bg-orange-50"
              >
                −
              </button>
              <span className="w-6 text-center font-semibold">{guests}</span>
              <button
                onClick={() => setGuests((g) => Math.min(cook.dineInSeats ?? 1, g + 1))}
                aria-label={t.a11y.increaseGuests}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-200 bg-white text-lg leading-none hover:bg-orange-50"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-orange-200 pt-3">
            <span className="font-semibold">
              {t.cart.total}: {(cook.dineInPrice ?? 0) * guests} {t.common.rub}
            </span>
            {!isOwner && (
              <span className="relative">
                {booked && <SteamFx />}
                <Button onClick={askDinner} disabled={booking || booked || (!!user && (cityMismatch || !cook.isOnline))}>
                  {booked ? `✓ ${t.dineIn.booked}` : !user ? t.auth.loginToOrder : cityMismatch ? t.cart.notInYourCity : t.dineIn.book}
                </Button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* меню по категориям */}
      <h2 className="mb-3 mt-6 text-xl font-semibold">{t.cookProfile.menu}</h2>
      {/* ФЗ-289 «О платформенной экономике» (с 01.10.2026) требует раскрывать
          прямо при предложении товара, что оператор платформы не продавец.
          Держим это над карточками блюд, а не только в Условиях. */}
      <p className="mb-3 flex items-start gap-2 rounded-xl bg-orange-50/70 px-3.5 py-2.5 text-xs leading-relaxed text-[#e0860c]">
        <span className="mt-px shrink-0"><AlertIcon size={14} /></span>
        <span>{t.cookProfile.notSeller}</span>
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {byCategory.flatMap(([category, dishes]) =>
          dishes.map((dish) => (
              <div
                key={dish.id}
                className="overflow-hidden rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"
              >
                <DishGallery
                  photos={dish.photos && dish.photos.length ? dish.photos : dish.photoUrl ? [dish.photoUrl] : []}
                  videoUrl={dish.videoUrl}
                  title={tr(dish.title)}
                />
                <div className="mt-3 flex items-start justify-between gap-3">
                  {/* min-w-0 + break-words: иначе длинное название одним словом
                      растягивает колонку и выдавливает цену с кнопкой за край карточки */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="min-w-0 break-words font-medium">{tr(dish.title)}</h4>
                      <Badge tone="amber">{t.categories[category] || category}</Badge>
                    </div>
                    {dish.description && <p className="mt-0.5 text-sm ">{tr(dish.description)}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs ">
                      <span className="inline-flex items-center gap-1"><ClockIcon size={13} /> {dish.prepTimeMin} {t.cook.prepTime}</span>
                      <span>{dish.portions} {t.cook.portionsLeft(dish.portions)}</span>
                      {dish.tags.map((tag) => (
                        <Badge key={tag} tone="amber">{t.tags[tag] || tag}</Badge>
                      ))}
                    </div>
                    {dish.ingredients && (
                      <p className="mt-1.5 text-xs text-[#e0860c]">
                        <span className="font-medium">{t.cook.ingredients}:</span> {tr(dish.ingredients)}
                      </p>
                    )}
                    {dish.allergens && dish.allergens.length > 0 && (
                      <div className="mt-1 flex flex-wrap items-center gap-1 text-xs">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#e0860c]"><AlertIcon size={14} /> {t.cook.contains}:</span>
                        {dish.allergens.map((a) => (
                          <span key={a} className="rounded bg-orange-100 px-1.5 py-0.5 font-medium text-[#e0860c]">
                            {t.allergens[a] || a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="mb-2 text-lg font-semibold">{dish.price} {t.common.rub}</div>
                    {!isOwner && (
                      <Button
                        onClick={() => tryAdd(dish)}
                        disabled={!!user && (cityMismatch || cookBlocked || !cook.isOnline || dish.portions === 0)}
                      >
                        {!user
                          ? t.auth.loginToOrder
                          : dish.portions === 0
                          ? t.cook.soldOut
                          : cityMismatch
                          ? t.cart.notInYourCity
                          : cookBlocked
                          ? t.cart.finishOrderFirst
                          : `+ ${t.cook.addToCart}${qtyOf(dish) > 0 ? ` · ${qtyOf(dish)}` : ""}`}
                      </Button>
                    )}
                    {isOwner && (
                      <DeleteButton
                        label={t.cook.deleteDish}
                        confirmText={t.cook.deleteDishConfirm}
                        successText={t.cook.dishDeleted}
                        onDelete={async () => { await api.del(`/dishes/${dish.id}`); }}
                        onDone={loadCook}
                      />
                    )}
                  </div>
                </div>
              </div>
          ))
        )}
      </div>

      {/* шеринг кухни — вирусная петля (на оранжевом фоне) */}
      <ShareButtons url={cookUrl} text={t.share.cook(cook.kitchenName)} onAmber />

      {/* отзывы */}
      <h2 className="mb-3 mt-8 text-xl font-semibold">{t.review.sectionTitle}</h2>

      {/* оставить отзыв — только если есть доставленный неоценённый заказ у этого повара */}
      {reviewableOrderId && (
        <div className="mb-4">
          <ReviewForm orderId={reviewableOrderId} onDone={() => { loadCook(); loadReviewable(); }} />
        </div>
      )}

      {!cook.reviews || cook.reviews.length === 0 ? (
        <p className="">{t.review.none}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {cook.reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{tr(r.buyer?.name) || t.common.guest}</span>
                <Stars rating={r.rating} />
              </div>
              {r.comment && <p className="mt-1.5 text-sm ">{tr(r.comment)}</p>}
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs ">{new Date(r.createdAt).toLocaleDateString(lang === "en" ? "en-GB" : "ru-RU")}</p>
                {isOwner && (
                  <button
                    onClick={() => setReviewToDelete(r.id)}
                    className="text-xs font-medium text-[#e0860c] hover:underline"
                  >
                    {t.review.remove}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* удаление своей кухни — только владельцу */}
      {isOwner && (
        <div className="mt-10 flex flex-col items-center gap-2 border-t border-orange-100 pt-6">
          <DeleteButton
            label={t.cook.deleteKitchen}
            confirmText={t.cook.deleteKitchenConfirm}
            successText={t.cook.kitchenDeleted}
            onDelete={async () => { await api.del("/cooks/me"); }}
            onDone={() => navigate("/")}
          />
        </div>
      )}

      {/* подтверждение брони посиделок: показываем гостей и сумму,
          заказ создаётся только после явного «да» */}
      <ConfirmModal
        open={confirmDine}
        title={t.dineIn.confirmBookTitle(guests, (cook?.dineInPrice ?? 0) * guests)}
        confirmLabel={t.dineIn.book}
        onConfirm={() => { setConfirmDine(false); bookDinner(); }}
        onClose={() => setConfirmDine(false)}
      />

      {/* удаление отзыва — НАШИМ модальным окном, а не системным confirm() */}
      <ConfirmModal
        open={!!reviewToDelete}
        title={t.review.removeConfirm}
        confirmLabel={t.review.remove}
        onConfirm={() => { const id = reviewToDelete; setReviewToDelete(null); if (id) removeReview(id); }}
        onClose={() => setReviewToDelete(null)}
      />
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-orange-50/70 px-2 py-3 text-center">
      <div className="flex justify-center">{icon}</div>
      <div className="mt-1 text-[11px] leading-tight">{label}</div>
      <div className="text-[11px] font-semibold leading-tight break-words" title={value}>{value}</div>
    </div>
  );
}
