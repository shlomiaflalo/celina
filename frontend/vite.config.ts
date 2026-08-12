/// <reference types="vite-react-ssg" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { BLOG_POSTS } from "./src/data/blogPosts"; // чистые данные (без зависимостей) → безопасно для конфига
import { CITY_CATALOG, CITY_CATALOG_SLUGS } from "./src/lib/cityCatalog"; // приоритетные города — рендерим всегда, даже без поваров
import cityImages from "./src/lib/cityImages.json";

// домен для sitemap/canonical — ОБЯЗАТЕЛЬНО задаётся VITE_SITE_URL при сборке.
// Фолбэк — .example (нельзя занять), чтобы не отдать SEO чужому домену по ошибке.
const SITE_URL = process.env.VITE_SITE_URL || "https://celina.example";
if (!process.env.VITE_SITE_URL) {
  console.warn("\n⚠️  VITE_SITE_URL не задан — canonical/OG/sitemap используют плейсхолдер https://celina.example.\n    Перед продакшн-сборкой: VITE_SITE_URL=https://ваш-домен npm run build\n");
}

interface SeoSnap {
  cities: { name: string; slug: string }[];
  categories: { name: string; slug: string }[];
  cooks: { id: string; city: string; dishes: { slug: string; category: string }[] }[];
}

// читаем снимок SEO-данных (его генерит бекенд: npm run seo:export)
function loadSeo(): SeoSnap {
  try {
    return JSON.parse(readFileSync(resolve(process.cwd(), "src/data/seo-data.json"), "utf8"));
  } catch {
    return { cities: [], categories: [], cooks: [] };
  }
}

// статические публичные маршруты + ТОЛЬКО непустые комбинации город/категория
// (пустые комбинации = «тонкие» дорвей-страницы, которые Яндекс штрафует — их не пререндерим)
function publicRoutes(): string[] {
  const seo = loadSeo();
  const staticRoutes = ["/", "/about", "/manifest", "/contact", "/privacy", "/story", "/blog", "/gatherings", "/dostavka", "/vypit-vmeste", "/vstrechi", "/obedy", "/vypechka", "/eda-na-nedelyu", "/pravilnoe-pitanie", "/eda-na-prazdnik", "/zagotovki"];
  const blogRoutes = BLOG_POSTS.map((p) => `/blog/${p.slug}`);
  const citySlugByName = new Map(seo.cities.map((c) => [c.name, c.slug]));
  const catSlugByName = new Map(seo.categories.map((c) => [c.name, c.slug]));

  const cityHasCooks = new Set<string>();
  const validCombos = new Set<string>(); // "citySlug/catSlug"
  for (const cook of seo.cooks) {
    const cs = citySlugByName.get(cook.city);
    if (!cs) continue;
    cityHasCooks.add(cs);
    for (const d of cook.dishes) {
      const cat = catSlugByName.get(d.category);
      if (cat) validCombos.add(`${cs}/${cat}`);
    }
  }
  // города: приоритетный список ВСЕГДА + любые города из каталога с поварами (без дублей)
  const cityRoutes = [...new Set([...CITY_CATALOG_SLUGS, ...cityHasCooks])].map((cs) => `/eda/${cs}`);
  const catCityRoutes = [...validCombos].map((combo) => `/eda/${combo}`);
  // страницы поваров и блюд: пререндерятся из снимка (реальный HTML + schema)
  const cookRoutes = seo.cooks.map((c) => `/cooks/${c.id}`);
  const dishRoutes = seo.cooks.flatMap((c) => c.dishes.map((d) => `/blyudo/${d.slug}`));
  return [...staticRoutes, ...blogRoutes, ...cityRoutes, ...catCityRoutes, ...cookRoutes, ...dishRoutes];
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { dedupe: ["react", "react-dom"] },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
      "/uploads": "http://localhost:4000",
    },
  },
  ssgOptions: {
    script: "async",
    formatting: "minify",
    includedRoutes() {
      return publicRoutes();
    },
    // после генерации страниц пишем полный sitemap.xml из реально отрендеренных URL
    onFinished() {
      const urls = publicRoutes();
      const lastmod = new Date().toISOString().slice(0, 10); // дата сборки — сигнал свежести для Яндекса
      const escUrl = (s: string) => s.replace(/&/g, "&amp;");
      // денежные лендинги (доставка/застолья) и город — высокий приоритет
      const MONEY = new Set(["/dostavka", "/vypit-vmeste", "/gatherings", "/vstrechi", "/obedy", "/vypechka", "/eda-na-nedelyu", "/pravilnoe-pitanie", "/eda-na-prazdnik", "/zagotovki"]);
      const priority = (u: string) =>
        u === "/" ? "1.0"
        : MONEY.has(u) ? "0.9"
        : u.startsWith("/cooks/") ? "0.8"
        : u.startsWith("/eda/") ? "0.8"
        : u.startsWith("/blog/") ? "0.6"
        : u.startsWith("/blyudo/") ? "0.6"
        : "0.5";
      const fresh = (u: string) => (u.startsWith("/cooks/") || u.startsWith("/eda/") || u.startsWith("/blyudo/") ? "daily" : "weekly");
      // картинка для маршрута — для image-sitemap (еда ищется по фото; важный канал CTR)
      const citySlugToImg = new Map(CITY_CATALOG.map((c) => [c.slug, (cityImages as Record<string, string>)[c.name]]));
      const blogSlugToImg = new Map(BLOG_POSTS.map((p) => [p.slug, p.cover]));
      const imageFor = (u: string): string | null => {
        if (u.startsWith("/blog/")) return blogSlugToImg.get(u.slice(6)) ?? null;
        if (u.startsWith("/eda/") && !u.slice(5).includes("/")) return citySlugToImg.get(u.slice(5)) ?? "/images/og-default.jpg";
        if (u === "/" || ["/gatherings", "/dostavka", "/vypit-vmeste", "/vstrechi", "/obedy", "/vypechka", "/eda-na-nedelyu", "/pravilnoe-pitanie", "/eda-na-prazdnik", "/zagotovki", "/about", "/story", "/manifest"].includes(u)) return "/images/og-default.jpg";
        return null;
      };
      const body = urls
        .map((u) => {
          const img = imageFor(u);
          const imgXml = img ? `\n    <image:image><image:loc>${escUrl(SITE_URL + img)}</image:loc></image:image>` : "";
          return `  <url>\n    <loc>${escUrl(SITE_URL + (u === "/" ? "" : u))}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${fresh(u)}</changefreq>\n    <priority>${priority(u)}</priority>${imgXml}\n  </url>`;
        })
        .join("\n");
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>\n`;
      writeFileSync(resolve(process.cwd(), "dist/sitemap.xml"), xml, "utf8");
      console.log(`[sitemap] ${urls.length} URL (lastmod ${lastmod}) → dist/sitemap.xml`);

      // защита от «неправильного домена» в проде: пустой/чужой домен = слив SEO
      if (process.env.VITE_SITE_URL) {
        const host = new URL(SITE_URL).host;
        for (const f of ["dist/sitemap.xml", "dist/robots.txt"]) {
          const txt = readFileSync(resolve(process.cwd(), f), "utf8");
          if (/celina\.example|celina\.ru(?![a-z])/.test(txt) && !txt.includes(host + "/sitemap")) {
            throw new Error(`[seo] ${f} содержит неверный домен (ожидался ${host}). Прервано, чтобы не сливать SEO на чужой домен.`);
          }
        }
      }

      // robots.txt: строку Sitemap приводим к реальному домену сборки (в public/
      // она статична и могла указывать на другой домен)
      try {
        const robotsPath = resolve(process.cwd(), "dist/robots.txt");
        const robots = readFileSync(robotsPath, "utf8").replace(/^Sitemap:.*$/m, `Sitemap: ${SITE_URL}/sitemap.xml`);
        writeFileSync(robotsPath, robots, "utf8");
        console.log(`[robots] Sitemap → ${SITE_URL}/sitemap.xml`);
      } catch { /* robots.txt отсутствует — пропускаем */ }

      // Яндекс.Турбо: RSS-фид статей блога (быстрые турбо-страницы в мобильной выдаче
      // Яндекса). Подключается в Вебмастере: Турбо-страницы → RSS → /turbo.xml
      try {
        const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const items = [...BLOG_POSTS]
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          .map((p) => {
            const cover = `${SITE_URL}${p.cover}`;
            const blocks = p.ru.body
              .map((b) => `${b.h ? `<h2>${esc(b.h)}</h2>` : ""}${b.p.map((t) => `<p>${esc(t)}</p>`).join("")}`)
              .join("");
            const content = `<header><h1>${esc(p.ru.title)}</h1><figure><img src="${cover}"/></figure></header>${blocks}<p><a href="${SITE_URL}">Celina — домашняя еда от соседей</a></p>`;
            return `    <item turbo="true">\n      <link>${SITE_URL}/blog/${p.slug}</link>\n      <turbo:content><![CDATA[${content}]]></turbo:content>\n      <pubDate>${new Date(p.date).toUTCString()}</pubDate>\n    </item>`;
          })
          .join("\n");
        const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss xmlns:yandex="http://news.yandex.ru" xmlns:media="http://search.yahoo.com/mrss/" xmlns:turbo="http://turbo.yandex.ru" version="2.0">\n  <channel>\n    <title>Celina — блог о домашней еде</title>\n    <link>${SITE_URL}/blog</link>\n    <description>Гайды и статьи о домашней еде, соседях-поварах и застольях</description>\n    <language>ru</language>\n${items}\n  </channel>\n</rss>\n`;
        writeFileSync(resolve(process.cwd(), "dist/turbo.xml"), rss, "utf8");
        console.log(`[turbo] ${BLOG_POSTS.length} статей → dist/turbo.xml`);
      } catch (e) { console.warn("[turbo] пропущено:", e); }
    },
  },
});
