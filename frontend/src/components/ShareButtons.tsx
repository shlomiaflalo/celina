import { toast } from "./Toast";
import { useT } from "../i18n";

/**
 * Кнопки шеринга (вирусная петля): Telegram / ВКонтакте / WhatsApp + копировать.
 * Текст заранее заполнен на нужном языке. Цвета — только белый/логотипный (#e0860c).
 * onAmber=true → подпись белая (на оранжевом фоне), иначе логотипная (на белой карточке).
 */
export function ShareButtons({ url, text, onAmber = false }: { url: string; text: string; onAmber?: boolean }) {
  const t = useT();
  const tg = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  const vk = `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
  const copy = () => { navigator.clipboard?.writeText(url); toast(t.share.copied); };
  const btn = "rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#e0860c] shadow-sm ring-1 ring-orange-100 transition hover:bg-orange-50 active:scale-95";
  return (
    <div className={`mt-5 border-t pt-4 ${onAmber ? "border-white/30" : "border-orange-100"}`}>
      <div className={`mb-2 text-sm font-medium ${onAmber ? "text-white" : "text-[#e0860c]"}`}>{t.share.label}</div>
      <div className="flex flex-wrap gap-2">
        <a href={tg} target="_blank" rel="noreferrer" className={btn}>Telegram</a>
        <a href={vk} target="_blank" rel="noreferrer" className={btn}>{t.share.vk}</a>
        <a href={wa} target="_blank" rel="noreferrer" className={btn}>WhatsApp</a>
        <button type="button" onClick={copy} className={btn}>{t.share.copy}</button>
      </div>
    </div>
  );
}
