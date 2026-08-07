import { useParams, Link } from "react-router-dom";
import { Seo, SITE_URL, breadcrumbJsonLd } from "../../components/Seo";
import { useT, useLang } from "../../i18n";
import { getBlogPost, BLOG_POSTS, postL } from "../../data/blogPosts";
import { NotFound } from "../NotFound";
import { getCity, getCategory, cooksInCityByCategory } from "../../lib/seoData";

/**
 * Посадочная `/eda/:city/:cat` отдаёт 404, если в городе нет ни одного повара с
 * блюдом этой категории (см. CategoryCityPage). Ссылки в статьях статичны, поэтому
 * часть из них ведёт в никуда (напр. «супы» — таких блюд пока ни у кого нет).
 * Проверяем ссылку теми же данными, что и сама страница, и прячем мёртвые —
 * так статья никогда не уводит читателя и робота Яндекса на 404.
 */
function linkIsAlive(to: string): boolean {
  const m = /^\/eda\/([^/]+)\/([^/]+)$/.exec(to);
  if (!m) return true; // остальные ссылки (город, /blog, /blyudo) не проверяем
  const [, citySlug, catSlug] = m;
  return Boolean(getCity(citySlug)) && Boolean(getCategory(catSlug)) && cooksInCityByCategory(citySlug, catSlug).length > 0;
}

/** /blog/:slug — статья. Article + Breadcrumb schema, перелинковка на города/ленту. */
export function BlogPost() {
  const { slug = "" } = useParams();
  const t = useT();
  const { lang } = useLang();
  const post = getBlogPost(slug);
  if (!post) return <NotFound />;
  const L = postL(post, lang);

  const url = `${SITE_URL}/blog/${post.slug}`;
  const img = post.cover.startsWith("http") ? post.cover : SITE_URL + post.cover;
  const others = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);
  // из перелинковки убираем ссылки на пустые категории-города (они отдают 404)
  const liveLinks = (post.links ?? []).filter((l) => linkIsAlive(l.to));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: L.title,
      description: L.excerpt,
      image: img,
      datePublished: post.date,
      dateModified: post.date,
      author: { "@type": "Organization", name: "Celina" },
      publisher: { "@type": "Organization", name: "Celina", logo: { "@type": "ImageObject", url: SITE_URL + "/icon-512.png" } },
      mainEntityOfPage: url,
      keywords: post.tags.join(", "),
    },
    breadcrumbJsonLd([
      { name: lang === "en" ? "Home" : "Главная", path: "/" },
      { name: t.blog.title, path: "/blog" },
      { name: L.title, path: `/blog/${post.slug}` },
    ]),
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <Seo title={`${L.title} | Celina`} description={L.excerpt} path={`/blog/${post.slug}`} type="article" image={post.cover} jsonLd={jsonLd} />

      <Link to="/blog" className="text-sm font-medium text-white/90 hover:underline">← {t.blog.title}</Link>

      <div className="mt-3 overflow-hidden rounded-3xl shadow-lg ring-1 ring-white/30">
        <img src={post.cover} alt={L.title} className="h-56 w-full object-cover sm:h-72" />
      </div>

      <article className="mt-5 text-white drop-shadow-sm">
        <h1 className="text-2xl font-bold sm:text-3xl">{L.title}</h1>
        <div className="mt-1 text-sm text-white/80">
          {new Date(post.date).toLocaleDateString(lang === "en" ? "en-US" : "ru-RU", { day: "numeric", month: "long", year: "numeric" })} · {post.readMin} {t.blog.minRead}
        </div>

        {L.body.map((b, i) => (
          <section key={i} className="mt-5">
            {b.h && <h2 className="mb-1.5 text-xl font-bold">{b.h}</h2>}
            {b.p.map((para, j) => (
              <p key={j} className="mt-2 leading-relaxed text-white/90">{para}</p>
            ))}
          </section>
        ))}

        {/* внутренние ссылки статьи — перелинковка на города/категории/блюда (SEO) */}
        {liveLinks.length > 0 && (
          <div className="mt-7 rounded-2xl border border-white/30 p-5">
            <div className="mb-2 font-bold text-white">{lang === "en" ? "See also" : "Читайте также"}</div>
            <ul className="space-y-1.5">
              {liveLinks.map((lnk) => (
                <li key={lnk.to}>
                  <Link to={lnk.to} className="font-medium text-white underline decoration-white/50 underline-offset-2 hover:decoration-white">
                    {lnk.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* перелинковка: ведём в ленту/города */}
        <div className="mt-7 rounded-2xl glass-card p-5">
          <div className="mb-2 font-bold text-[#e0860c]">{t.blog.cta}</div>
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-semibold text-[#e0860c] shadow-sm transition hover:bg-orange-50 active:scale-95">
            {t.blog.ctaButton} →
          </Link>
        </div>
      </article>

      {others.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-white drop-shadow">{t.blog.more}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {others.map((p) => (
              <Link key={p.slug} to={`/blog/${p.slug}`} className="group overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition hover:shadow-lg">
                <div className="h-32 overflow-hidden">
                  <img src={p.cover} alt={postL(p, lang).title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold leading-snug text-[#e0860c]">{postL(p, lang).title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
