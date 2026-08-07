import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import type { CookProfile } from "../../types";
import { Badge, ErrorState, EmptyState } from "../../components/ui";
import { PlateIcon, PinIcon, DeliveryIcon, BasketIcon, DrinkIcon, StarIcon } from "../../components/icons";
import { BowlMark } from "../../components/Logo";
import { parseQuery, matchScore, suggestSearch, canonicalCity } from "../../lib/aiSearch";
import { useFavorites } from "../../lib/favorites";
import { cityImage } from "../../lib/cityImage";
import { haversineM } from "../../lib/cityCoords";
import { useAuth } from "../../auth/AuthContext";
import { VerifiedBadge } from "../../components/VerifiedBadge";
import { useT, useTr } from "../../i18n";

/** Человекочитаемое расстояние: «1.2 км» / «350 м» — БЕЗ знака «~» (решение основателя). */
function fmtDist(m: number, kmLabel: string, mLabel: string): string {
  if (m >= 1000) {
    const km = m / 1000;
    // до 100 км — один знак после запятой, дальше — целое
    return `${km >= 100 ? Math.round(km) : Number(km.toFixed(1))} ${kmLabel}`;
  }
  return `${Math.round(m / 10) * 10} ${mLabel}`;
}

export function Feed() {
  const t = useT();
  const tr = useTr();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cooks, setCooks] = useState<CookProfile[] | null>(null);
  const [failed, setFailed] = useState(false);
  // живое местоположение (если пользователь нажал рядом со мной); иначе берём координаты профиля
  const [liveLoc, setLiveLoc] = useState<{ lat: number; lng: number } | null>(null);
  // ?q= из URL — питает SearchAction (строка поиска Google/Яндекса ведёт сюда)
  const [q, setQ] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("q") ?? "";
  });
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [drinkOnly, setDrinkOnly] = useState(false);
  const [favOnly, setFavOnly] = useState(false);
  const { favs, isFav, toggle: toggleFav } = useFavorites();
  const [focused, setFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function loadCooks() {
    setFailed(false);
    api.get<{ cooks: CookProfile[] }>("/cooks").then((r) => setCooks(r.cooks)).catch(() => setFailed(true));
  }
  useEffect(loadCooks, []);

  const cuisines = useMemo(() => {
    const set = new Set<string>();
    cooks?.forEach((c) => c.cuisine.forEach((cu) => set.add(cu)));
    return [...set];
  }, [cooks]);

  const suggestions = useMemo(() => suggestSearch(q, cooks ?? []), [q, cooks]);
  const showSuggest = focused && q.trim().length > 0 && suggestions.length > 0;
  // при нескольких результатах затемняем фон, чтобы все подсказки были видны;
  // при одной/нулевой подсказке — обычный вид страницы
  const dimActive = showSuggest && suggestions.length > 1;

  function closeSuggest() {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setFocused(false);
  }

  function pick(cookId: string) {
    setFocused(false);
    if (blurTimer.current) clearTimeout(blurTimer.current);
    navigate(`/cooks/${cookId}`);
  }
  function onKey(e: React.KeyboardEvent) {
    if (!showSuggest) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(suggestions.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter" && activeIdx >= 0) { e.preventDefault(); pick(suggestions[activeIdx].cookId); }
    else if (e.key === "Escape") { setFocused(false); }
  }

  // моё местоположение: живое (GPS) приоритетнее, иначе из профиля
  const myLoc = useMemo<{ lat: number; lng: number } | null>(() => {
    if (liveLoc) return liveLoc;
    if (user?.lat != null && user?.lng != null) return { lat: user.lat, lng: user.lng };
    return null;
  }, [liveLoc, user]);

  // реальное расстояние до повара (гаверсинус) — только если известны обе точки;
  // иначе null (не показываем выдуманное число: все расстояния должны быть настоящими)
  const distM = useMemo(() => (c: CookProfile): number | null => {
    if (myLoc && c.lat != null && c.lng != null) return haversineM(myLoc, { lat: c.lat, lng: c.lng });
    return null;
  }, [myLoc]);

  const parsed = useMemo(() => parseQuery(q), [q]);
  // фильтрация + ранжирование по релевантности (мемоизировано)
  const filtered = useMemo(() => {
    const scored: { c: CookProfile; score: number }[] = [];
    for (const c of cooks ?? []) {
      if (parsed.minRating && c.rating < parsed.minRating) continue;
      if (parsed.openNow && !c.isOnline) continue;
      if (parsed.city && canonicalCity(c.city) !== parsed.city) continue;
      // фильтр по радиусу применяем только когда известно реальное местоположение
      if (parsed.maxDistanceM && myLoc) { const dm = distM(c); if (dm == null || dm > parsed.maxDistanceM) continue; }
      if (cuisine && !c.cuisine.includes(cuisine)) continue;
      if (drinkOnly && !c.dineInEnabled) continue;
      if (favOnly && !favs.includes(c.id)) continue;
      // балл релевантности: лучшее совпадение среди всех полей (имя/город/кухня/блюда)
      let score = 1;
      if (parsed.keyword) {
        const fields = [
          c.kitchenName,
          c.user?.name ?? "",
          c.city ?? "",
          c.cuisine.join(" "),
          c.bio ?? "",
          ...(c.dishes ?? []).map((d) => `${d.title} ${d.category} ${d.price}`),
        ];
        score = Math.max(...fields.map((f) => matchScore(parsed.keyword, f)));
        if (score <= 0) continue; // ничего не совпало с запросом
      }
      scored.push({ c, score });
    }
    // самые релевантные — первыми; при равенстве учитываем рейтинг (и радиус, если задан)
    scored.sort((a, b) =>
      parsed.maxDistanceM && myLoc
        ? (distM(a.c) ?? Infinity) - (distM(b.c) ?? Infinity)
        : (b.score - a.score) || (b.c.rating - a.c.rating)
    );
    return scored.map((s) => s.c);
  }, [cooks, parsed, cuisine, drinkOnly, favOnly, favs, distM, myLoc]);
  const aiActive = q.trim().length > 0;

  if (failed) return <ErrorState onRetry={loadCooks} />;
  // ВАЖНО: НЕ блокируем всю страницу спиннером, пока грузится /api/cooks —
  // иначе после входа несколько секунд виден пустой оранжевый экран. Каркас
  // (герой, поиск, чипы) рендерим сразу, а загрузку показываем только в области
  // карточек (skeleton). cooks===null → идёт загрузка.

  return (
    <div>
      {/* затемнение фона на время поиска (несколько результатов) — клик закрывает */}
      {dimActive && (
        <div
          className="fixed inset-0 z-30 bg-black/80 transition-opacity duration-200"
          // и мышь, и касание: на телефоне onMouseDown может не сработать —
          // затемнение «зависало» и блокировало кнопки под ним
          onMouseDown={closeSuggest}
          onTouchStart={closeSuggest}
          onClick={closeSuggest}
          aria-hidden
        />
      )}

      {/* герой-баннер: Красная площадь (Москва) с радугой.
          во время поиска снимаем overflow-hidden и z-20 (фон уходит под затемнение,
          а строка поиска с подсказками поднимается над ним) */}
      <div className={`relative mb-6 rounded-3xl ${dimActive ? "" : "z-20 overflow-hidden"}`}>
        {/* webp с jpg-фолбэком — LCP-элемент, чем легче тем лучше */}
        <picture>
          <source srcSet="/images/red-square.webp" type="image/webp" />
          <img
            src="/images/red-square.jpg"
            alt=""
            {...{ fetchpriority: "high" }}
            decoding="async"
            className="absolute inset-0 h-full w-full rounded-3xl object-cover"
            style={{ objectPosition: "center 42%" }}
          />
        </picture>
        {/* фирменный оранжевый оттенок 30% — фото остаётся хорошо видно */}
        <div className="absolute inset-0 rounded-3xl" style={{ background: "rgba(224,134,12,0.30)" }} />
        {/* лёгкое затемнение слева — чтобы белый заголовок читался */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
          {/* визуальный заголовок героя; семантический H1 главной — в HomeSeoSection
              (два H1 на странице размывают релевантность для Яндекса) */}
          <div className="max-w-md text-3xl font-bold text-white drop-shadow sm:text-4xl">
            {t.feed.title}
          </div>
          <p className="mt-1 text-white/85">{t.tagline}</p>
          <div className="mt-5 max-w-xl">
            <div className={`relative ${dimActive ? "z-40" : "z-30"}`}>
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setActiveIdx(-1); }}
                onFocus={() => setFocused(true)}
                onBlur={() => { blurTimer.current = setTimeout(() => setFocused(false), 150); }}
                onKeyDown={onKey}
                placeholder={t.feed.aiPlaceholder}
                aria-label={t.feed.aiPlaceholder}
                className="w-full truncate rounded-2xl border-0 bg-white/95 py-3.5 pl-4 pr-28 text-sm shadow-lg outline-none ring-orange-300 focus:ring-2"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-[#e0860c] px-2.5 py-1 text-xs font-semibold text-white">
                {t.feed.aiBadge}
              </span>

              {/* автодополнение */}
              {showSuggest && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[65vh] overflow-y-auto overflow-x-hidden rounded-2xl border border-orange-100 bg-white shadow-2xl">
                  {suggestions.map((sg, i) => (
                    <button
                      key={sg.kind + sg.cookId + (sg.dishTitle ?? "")}
                      onMouseDown={(e) => { e.preventDefault(); pick(sg.cookId); }}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition ${i === activeIdx ? "bg-orange-50" : "hover:bg-orange-50/60"}`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                        {sg.kind === "dish" ? <PlateIcon size={18} /> : <BowlMark size={20} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[#e0860c]">
                          {sg.kind === "dish" ? tr(sg.dishTitle) : tr(sg.kitchenName)}
                        </span>
                        <span className="block truncate text-xs text-[#e0860c]">
                          {sg.kind === "dish"
                            ? tr(sg.kitchenName)
                            : (sg.cuisine ? t.cuisines[sg.cuisine] || sg.cuisine : t.cookProfile.menu)}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-medium text-[#e0860c]">
                        {sg.kind === "dish"
                          ? (sg.category ? t.categories[sg.category] || sg.category : t.cook.menu)
                          : t.cookProfile.menu}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {aiActive && (parsed.minRating > 0 || parsed.maxDistanceM || parsed.city || parsed.openNow || parsed.keyword) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {parsed.minRating > 0 && <Crit><StarIcon size={12} className="inline -mt-0.5" /> {parsed.minRating}+</Crit>}
                {parsed.city && <Crit><PinIcon size={12} /> {parsed.city.charAt(0).toUpperCase() + parsed.city.slice(1)}</Crit>}
                {parsed.maxDistanceM && (
                  <Crit>≤ {parsed.maxDistanceM >= 1000 ? `${(parsed.maxDistanceM / 1000).toFixed(parsed.maxDistanceM % 1000 ? 1 : 0)} ${t.feed.km}` : `${parsed.maxDistanceM} ${t.feed.meters}`}</Crit>
                )}
                {parsed.openNow && <Crit>{t.feed.openNow}</Crit>}
                {parsed.keyword && <Crit>{parsed.keyword}</Crit>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* фильтр по кухне + посиделки */}
      <div className="mb-5 flex flex-wrap gap-2">
        <Chip active={cuisine === null && !drinkOnly && !favOnly} onClick={() => { setCuisine(null); setDrinkOnly(false); setFavOnly(false); }}>
          {t.common.all}
        </Chip>
        <Chip active={favOnly} onClick={() => { setFavOnly((v) => !v); setCuisine(null); setDrinkOnly(false); }}>
          <span className="inline-flex items-center gap-1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill={favOnly ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
            {t.feed.favorites}
          </span>
        </Chip>
        <Chip active={drinkOnly} onClick={() => { setDrinkOnly((v) => !v); setCuisine(null); setFavOnly(false); }}>
          <span className="inline-flex items-center gap-1.5"><DrinkIcon size={16} /> {t.dineIn.filter}</span>
        </Chip>
        {cuisines.map((c) => (
          <Chip key={c} active={cuisine === c} onClick={() => { setCuisine(c); setDrinkOnly(false); setFavOnly(false); }}>
            {t.cuisines[c] || c}
          </Chip>
        ))}
      </div>

      {cooks === null ? (
        // идёт загрузка списка — лёгкий скелет карточек (страница уже видна)
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="overflow-hidden rounded-3xl bg-white/80 ring-1 ring-orange-100">
              <div className="h-44 animate-pulse bg-orange-100/70" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-orange-100/70" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-orange-100/60" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        cooks.length === 0 ? (
          // на площадке пока НЕТ ни одного повара (запуск): честное приглашение
          // без иконки (разбитая тарелка читалась бы как «ошибка», а тут всё в
          // порядке — просто рано). Чистый тёплый текст + призыв.
          <EmptyState
            title={t.feed.noCooksYet}
            actionLabel={user ? undefined : t.feed.becomeCook}
            onAction={user ? undefined : () => navigate("/login")}
          />
        ) : (
          <p className="">{t.feed.empty}</p>
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((cook) => (
            <Link
              key={cook.id}
              to={`/cooks/${cook.id}`}
              className="group block overflow-hidden rounded-3xl bg-white shadow-[0_6px_24px_rgba(176,104,8,0.10)] ring-1 ring-orange-100 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(176,104,8,0.20)]"
            >
              {/* герой-фото кухни */}
              <div className="relative h-44 overflow-hidden bg-orange-50">
                {/* в карточке всегда есть фото: блюдо, иначе — фото города кухни */}
                <img
                  src={cook.dishes?.[0]?.photoUrl || cityImage(cook.city)}
                  alt={t.feed.cardPhotoAlt(tr(cook.kitchenName), tr(cook.city))}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-[600ms] group-hover:scale-110"
                  // фото города кадрируем по нижней части (видно город, а не небо);
                  // фото блюда — по центру, как обычно
                  style={cook.dishes?.[0]?.photoUrl ? undefined : { objectPosition: "center 72%" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-[#e0860c] shadow-sm">
                  <StarIcon size={13} /> {cook.rating.toFixed(1)}
                </span>
                <span className={`absolute left-3 top-12 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${cook.isOnline ? "bg-[#e0860c] text-white" : "bg-white/90 text-[#e0860c]"}`}>
                  {cook.isOnline ? t.feed.online : t.feed.offline}
                </span>

                {/* добавить/убрать из избранного — прямо на карточке, без перехода */}
                <button
                  type="button"
                  aria-label={t.feed.favorites}
                  aria-pressed={isFav(cook.id)}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFav(cook.id); }}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-110 active:scale-95"
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill={isFav(cook.id) ? "#e0860c" : "none"} stroke={isFav(cook.id) ? "#e0860c" : "#78716c"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
                </button>

                <div className="absolute inset-x-4 bottom-3">
                  <div className="flex items-center gap-1.5">
                    <h2 className="truncate text-lg font-bold text-white drop-shadow">{tr(cook.kitchenName)}</h2>
                    {cook.user?.isVerified && <VerifiedBadge size={16} />}
                  </div>
                  {cook.city && (
                    <div className="mt-0.5 flex items-center gap-1 text-xs font-medium text-white/90 drop-shadow">
                      <PinIcon size={12} /> {tr(cook.city)}
                    </div>
                  )}
                </div>
              </div>

              {/* тело */}
              <div className="p-4">
                {cook.bio && <p className="line-clamp-1 text-sm text-[#e0860c]">{tr(cook.bio)}</p>}

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {cook.cuisine.map((c) => (
                    <Badge key={c}>{t.cuisines[c] || c}</Badge>
                  ))}
                  {cook.dineInEnabled && (
                    <Badge tone="amber">
                      <span className="inline-flex items-center gap-1"><DrinkIcon size={13} /> {t.dineIn.filter}</span>
                    </Badge>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#e0860c]">
                  {/* расстояние без точки-разделителя после числа — чище выглядит */}
                  {(() => { const dm = distM(cook); return dm != null ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-[#e0860c]"><PinIcon size={14} /> {fmtDist(dm, t.feed.km, t.feed.meters)}</span>
                  ) : null; })()}
                  <span className="inline-flex items-center gap-1"><DeliveryIcon size={14} /> {cook.deliveryFee} {t.common.rub}</span>
                  <span className="text-[#e0860c]">·</span>
                  <span className="inline-flex items-center gap-1"><BasketIcon size={14} /> {t.feed.minOrder} {cook.minOrder} {t.common.rub}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Crit({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium  shadow-sm">
      {children}
    </span>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active ? "btn-glass ring-2 ring-[#e0860c]/50" : "glass-soft opacity-90"
      }`}
    >
      {children}
    </button>
  );
}
