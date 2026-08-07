import { Link } from "react-router-dom";
import { Seo, SITE_URL } from "../../components/Seo";
import { useT, useLang } from "../../i18n";
import { BLOG_POSTS, postL } from "../../data/blogPosts";

/** /blog — индекс статей. Реальный контент, пререндер, перелинковка → SEO. */
export function BlogList() {
  const t = useT();
  const { lang } = useLang();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: BLOG_POSTS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/blog/${p.slug}`,
      name: postL(p, lang).title,
    })),
  };
  return (
    <div className="mx-auto max-w-5xl">
      <Seo
        title="Блог Celina — о домашней еде, поварах и застольях"
        titleEn="Celina Blog — homemade food, cooks & gatherings"
        description="Гайды и истории о домашней еде в России: как заказать, безопасность, соседские застолья и рецепты. Соседи кормят соседей."
        path="/blog"
        jsonLd={jsonLd}
      />
      <h1 className="mb-1 text-3xl font-bold text-white drop-shadow sm:text-4xl">{t.blog.title}</h1>
      <p className="mb-6 text-white/90 drop-shadow-sm">{t.blog.subtitle}</p>

      {/* карточки 2-в-ряд (как везде на сайте) */}
      <div className="grid gap-4 sm:grid-cols-2">
        {BLOG_POSTS.map((p) => {
          const L = postL(p, lang);
          return (
          <Link
            key={p.slug}
            to={`/blog/${p.slug}`}
            className="group overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition hover:shadow-lg"
          >
            <div className="h-44 overflow-hidden">
              <img src={p.cover} alt={L.title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
            </div>
            <div className="p-5">
              <div className="mb-1 text-xs font-medium text-[#e0860c]">
                {new Date(p.date).toLocaleDateString(lang === "en" ? "en-US" : "ru-RU", { day: "numeric", month: "long", year: "numeric" })} · {p.readMin} {t.blog.minRead}
              </div>
              <h2 className="text-lg font-bold leading-snug text-[#e0860c]">{L.title}</h2>
              <p className="mt-1.5 line-clamp-2 text-sm text-[#e0860c]">{L.excerpt}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-[#e0860c] group-hover:underline">{t.blog.readMore} →</span>
            </div>
          </Link>
          );
        })}
      </div>
    </div>
  );
}
