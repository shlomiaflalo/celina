/**
 * IndexNow: сообщить Яндексу (протокол поддерживают и Bing/Seznam) список
 * URL после деплоя — ускоряет перекраул без ожидания планового обхода.
 *
 * Ключ публичен по протоколу: файл /<key>.txt на домене подтверждает
 * владение. Секретом он не является.
 *
 * Запуск ПОСЛЕ деплоя (URL берутся из живого sitemap-индекса):
 *   node scripts/indexnow-ping.mjs
 */
const HOST = "celinaeda.ru";
const KEY = process.env.INDEXNOW_KEY; // ключ живёт вне публичного репозитория

const idx = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const children = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const urls = [];
for (const c of children) {
  const xml = await (await fetch(c)).text();
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.push(m[1]);
}
console.log(`sitemap: ${urls.length} URL из ${children.length} карт`);

const res = await fetch("https://yandex.com/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log(`indexnow: HTTP ${res.status} ${res.statusText}`);
if (res.status >= 400) process.exit(1);
