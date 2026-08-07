import { useEffect, useState } from "react";
import { api } from "../api/client";
import { ShareButtons } from "./ShareButtons";
import { CelebrateIcon } from "./icons";
import { useT } from "../i18n";

/**
 * «Момент шеринга» — вирусная петля в самый счастливый момент (только что
 * оформлен заказ / забронировано место за столом): компактная карточка с личной
 * реферальной ссылкой и кнопками поделиться. Тихо не рендерится, если код
 * не загрузился — петля никогда не ломает основной сценарий.
 */
export function InviteMoment({ variant }: { variant: "order" | "gathering" }) {
  const t = useT();
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ code: string }>("/referrals/me").then((r) => setCode(r.code)).catch(() => {});
  }, []);

  if (!code) return null;
  const link = `${window.location.origin}/?ref=${code}`;

  return (
    <div className="mt-5 rounded-3xl bg-white p-5 text-[#e0860c] shadow-sm ring-1 ring-orange-100">
      <div className="flex items-center gap-2 font-bold">
        <CelebrateIcon size={22} className="shrink-0" />
        {variant === "order" ? t.invite.momentOrderTitle : t.invite.momentGatheringTitle}
      </div>
      <p className="mt-1 text-sm text-[#e0860c]/80">{t.invite.momentText}</p>
      <ShareButtons url={link} text={t.invite.shareText} />
    </div>
  );
}
