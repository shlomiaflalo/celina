import { Link } from "react-router-dom";
import { useLang } from "../i18n";

/**
 * ПРИЛАВОК — витрина-пример над пустой лентой.
 *
 * Задача. Пустая лента выглядит мёртвой: человек — и покупатель, и повар —
 * открывает главную, не видит ни одной тарелки и закрывает вкладку. Никакие
 * аргументы ниже он уже не читает.
 *
 * Решение — прилавок: двенадцать настоящих блюд стык в стык во всю ширину
 * окна. Единственное насыщенное пятно на странице — сама еда.
 *
 * Чего здесь СПЕЦИАЛЬНО нет: выдуманных поваров, имён, рейтингов, отзывов и
 * цен. Нарисовать «Мария, 4.9★, принимает заказы» — быстрый способ получить
 * жалобу от человека, который попробовал заказать, и убить ровно то доверие,
 * которое Селина продаёт.
 *
 * Что удерживает страницу от вранья. Ярлык «ПРИМЕР» поверх каждой тарелки
 * снят — он спорил с едой ради которой сюда и приходят. Остались два
 * маркера, и вот они не снимаются:
 *   1) рейка вплотную над сеткой: «пример, а не предложение»;
 *   2) «ВАША ЦЕНА» на месте каждой цены — двенадцать раз на экране.
 * Пока цены нет ни на одной плитке, а над сеткой стоит прямая оговорка,
 * витрину невозможно принять за живой каталог. Эти два — предел: снимете
 * рейку или «ВАША ЦЕНА» — и сетка начнёт врать.
 *
 * И ценник — не украшение, а единственный элемент первого экрана, который
 * несёт предложение повару. Поэтому это ссылка, а не <span>.
 */

/** Плитки собираются локально: node frontend/scripts/make-tiles.mjs */
const DISHES = [
  { f: "okroshka", ru: "Окрошка", en: "Okroshka" },
  { f: "borscht", ru: "Борщ", en: "Borscht" },
  { f: "pelmeni", ru: "Пельмени", en: "Pelmeni" },
  { f: "pirozhki", ru: "Пирожки", en: "Pirozhki" },
  { f: "syrniki", ru: "Сырники", en: "Syrniki" },
  { f: "medovik", ru: "Медовик", en: "Medovik" },
  { f: "plov", ru: "Плов", en: "Plov" },
  { f: "shchi", ru: "Щи", en: "Shchi" },
  { f: "vareniki", ru: "Вареники", en: "Vareniki" },
  { f: "golubtsy", ru: "Голубцы", en: "Golubtsy" },
  { f: "draniki", ru: "Драники", en: "Draniki" },
  { f: "napoleon", ru: "Наполеон", en: "Napoleon" },
];

export function StorefrontPreview() {
  const { lang } = useLang();
  const c = lang === "en" ? EN : RU;

  return (
    <section className="mt-8 mb-14" aria-label={c.aria}>
      {/* Рейка честности — первый из трёх маркеров. Стоит вплотную к сетке,
          а не над первым экраном: признание в пустоте, поставленное выше
          всего остального, читается как «сайт не работает», а не как
          честность. */}
      <div className="bleed">
        <div className="rail px-4 py-2 text-center">{c.rail}</div>

        <div className="counter-grid">
          {DISHES.map((d, i) => (
            <div key={d.f} className="counter-tile">
              <img
                src={`/images/tiles/${d.f}-360.jpg`}
                srcSet={`/images/tiles/${d.f}-240.jpg 240w, /images/tiles/${d.f}-360.jpg 360w, /images/tiles/${d.f}-540.jpg 540w`}
                sizes="(min-width:1280px) 17vw, (min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
                // alt пустой намеренно: название блюда стоит подписью прямо
                // под фотографией, и с alt скринридер читал бы каждое блюдо
                // дважды на первом же экране
                alt=""
                width={360}
                height={360}
                loading={i < 4 ? "eager" : "lazy"}
                fetchPriority={i < 2 ? "high" : undefined}
                decoding="async"
                className="block aspect-square w-full object-cover"
              />
              <div className="relative p-2.5">
                <Link to="/login" className="pricetag" aria-label={c.tagAria}>
                  {c.yourPrice}
                </Link>
                <div className="truncate font-semibold text-[#e0860c]">{lang === "en" ? d.en : d.ru}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const RU = {
  aria: "Пример витрины повара: блюда без цен, цену ставит повар",
  rail: "Так это выглядит, когда в районе есть повар · пример, а не предложение",
  yourPrice: "Ваша цена",
  tagAria: "Стать поваром и поставить свою цену",
};

const EN = {
  aria: "Example of a cook's storefront: dishes without prices, the cook sets the price",
  rail: "This is how it looks when a cook is nearby · an example, not an offer",
  yourPrice: "Your price",
  tagAria: "Become a cook and set your own price",
};
