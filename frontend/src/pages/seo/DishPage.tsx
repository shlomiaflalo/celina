import { useParams, Link } from "react-router-dom";
import { Seo, SITE_URL, clampMeta } from "../../components/Seo";
import { cityImage } from "../../lib/cityImage";
import { getDishBySlug, cap, cityPrepOf } from "../../lib/seoData";
import { useT, useTr } from "../../i18n";
import { ShareButtons } from "../../components/ShareButtons";
import { NotFound } from "../NotFound";

/** Страница блюда: /blyudo/:dishSlug — реальный контент + Product/Offer schema. */
export function DishPage() {
  const { dishSlug = "" } = useParams();
  const t = useT();
  const tr = useTr();
  const found = getDishBySlug(dishSlug);
  if (!found) return <NotFound />;
  const { dish, cook } = found;
  // язык интерфейса: имена/город/описание переводим, категорию — по словарю
  const dishTitle = tr(dish.title);
  const kitchenName = tr(cook.kitchenName);
  const cityName = tr(cook.city);
  const categoryLabel = t.categories[dish.category] || t.cuisines[dish.category] || dish.category;

  const img = dish.photoUrl || cityImage(cook.city);
  const dishUrl = `${SITE_URL}/blyudo/${dish.slug}`;
  const title = `${cap(dish.title)} — заказать домашнее блюдо${cook.city ? ` в ${cityPrepOf(cook.city)}` : ""} — Селина`;
  // насыщенное описание для выдачи. Короткое авторское (напр. «Вкусно») дополняем
  // продающим текстом, а не отдаём в мету огрызок в 10 символов.
  const richFallback = `Закажите ${dish.title} от домашнего повара ${cook.kitchenName}${cook.city ? ` в городе ${cook.city}` : ""} на Celina — ${dish.price} ₽. Приготовлено дома по семейному рецепту. Доставка и самовывоз. Соседи кормят соседей.`;
  const raw = dish.description?.trim() || "";
  const description = clampMeta(raw.length >= 70 ? raw : (raw ? `${raw} — ${richFallback}` : richFallback));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: dish.title,
      description: description,
      image: img,
      category: dish.category,
      url: dishUrl,
      brand: { "@type": "Brand", name: cook.kitchenName },
      offers: {
        "@type": "Offer",
        price: dish.price,
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/cooks/${cook.id}`,
        seller: { "@type": "Organization", name: cook.kitchenName },
      },
      ...(cook.ratingsCount > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: cook.rating, reviewCount: cook.ratingsCount } } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: cook.kitchenName, item: `${SITE_URL}/cooks/${cook.id}` },
        { "@type": "ListItem", position: 3, name: dish.title, item: dishUrl },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <Seo title={title} description={description} path={`/blyudo/${dish.slug}`} type="article" image={img} jsonLd={jsonLd} />

      <Link to={`/cooks/${cook.id}`} className="text-sm font-medium text-white/90 hover:underline">← {kitchenName}</Link>

      <div className="mt-3 overflow-hidden rounded-3xl shadow-lg ring-1 ring-white/30">
        <div className="relative h-56 sm:h-72">
          <img src={img} alt={`${dishTitle} — ${kitchenName}`} className="h-full w-full object-cover" />
        </div>
      </div>

      {/* контент на оранжевом фоне — белый текст (как на остальном сайте) */}
      <div className="mt-5 text-white drop-shadow-sm">
        <h1 className="text-2xl font-bold sm:text-3xl">{cap(dishTitle)}</h1>
        <p className="mt-1 text-sm text-white/80">
          {categoryLabel}
          {cityName ? ` · ${cityName}` : ""}
        </p>
        {dish.description && <p className="mt-3 leading-relaxed text-white/90">{tr(dish.description)}</p>}

        <div className="mt-5 flex items-center justify-between border-t border-white/30 pt-4">
          <div className="text-2xl font-bold">{dish.price} ₽</div>
          <Link
            to={`/cooks/${cook.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-semibold text-[#e0860c] shadow-sm transition hover:bg-orange-50 active:scale-95"
          >
            {t.dishPage.orderFromCook} →
          </Link>
        </div>

        {/* раскрытие по ФЗ-289: оператор платформы не является продавцом (в карточке товара) */}
        <p className="mt-3 text-xs leading-relaxed text-white/80">{t.cookProfile.notSeller}</p>

        <ShareButtons url={dishUrl} text={t.share.dish(dishTitle)} onAmber />
      </div>

      <p className="mt-6 leading-relaxed text-white/95 drop-shadow-sm">
        {t.dishPage.about(dishTitle, kitchenName, cityName)}
      </p>
    </div>
  );
}
