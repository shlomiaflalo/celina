import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useT } from "../i18n";
import { Seo } from "../components/Seo";
import { ShareButtons } from "../components/ShareButtons";
import { Spinner } from "../components/ui";

/** /invite — реферальная программа: личная ссылка, шеринг, счётчик, лидерборд. */
export function Invite() {
  const t = useT();
  const [me, setMe] = useState<{ code: string; count: number } | null>(null);
  const [leaders, setLeaders] = useState<{ name: string; count: number }[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api.get<{ code: string; count: number }>("/referrals/me").then(setMe).catch(() => setFailed(true));
    api.get<{ leaders: { name: string; count: number }[] }>("/referrals/leaderboard")
      .then((r) => setLeaders(r.leaders)).catch(() => {});
  }, []);

  if (failed)
    return (
      <div className="mx-auto max-w-2xl text-center text-white drop-shadow-sm">
        <p>{t.common.loadError}</p>
        <button onClick={() => window.location.reload()} className="mt-3 rounded-full bg-white px-5 py-2 font-semibold text-[#e0860c] shadow-sm">
          {t.common.retry}
        </button>
      </div>
    );
  if (!me) return <Spinner />;
  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${me.code}`;

  // статус (нематериальная награда): порог приглашений → уровень
  const thresholds = [1, 5, 15];
  const tier = me.count >= 15 ? 3 : me.count >= 5 ? 2 : me.count >= 1 ? 1 : 0;
  const toNext = tier < 3 ? thresholds[tier] - me.count : 0;

  return (
    <div className="mx-auto max-w-2xl text-white drop-shadow-sm">
      <Seo title="Пригласить друзей | Celina" description="Пригласите соседей на Celina — соседи кормят соседей." path="/invite" />
      <h1 className="text-2xl font-bold sm:text-3xl">{t.invite.title}</h1>
      <p className="mt-1 text-white/90">{t.invite.subtitle}</p>

      <div className="mt-5 rounded-3xl bg-white p-5 text-[#e0860c] shadow-sm sm:p-6">
        <div className="text-sm font-medium">{t.invite.yourLink}</div>
        <div className="mt-1 break-all rounded-xl bg-orange-50 px-3.5 py-2.5 text-sm font-semibold ring-1 ring-orange-100">{link}</div>
        <ShareButtons url={link} text={t.invite.shareText} />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-orange-100 pt-4 text-sm font-medium">
          <span>{t.invite.invited}: <span className="text-lg font-bold">{me.count}</span></span>
          <span className="inline-flex items-center rounded-full bg-[#e0860c] px-3.5 py-1.5 font-bold text-white">
            {t.invite.status}: {t.invite.tiers[tier]}
          </span>
        </div>
        <div className="mt-1.5 text-xs">
          {toNext > 0 ? t.invite.toNext(toNext) : t.invite.topStatus}
        </div>
      </div>

      <div className="mt-7">
        <h2 className="mb-3 text-lg font-bold text-white drop-shadow">{t.invite.leaderboard}</h2>
        {leaders.length === 0 ? (
          <p className="text-sm text-white/85">{t.invite.empty}</p>
        ) : (
          <ol className="space-y-2">
            {leaders.map((l, i) => (
              <li key={i} className="flex items-center justify-between rounded-2xl bg-white px-4 py-2.5 text-[#e0860c] shadow-sm">
                <span className="font-medium">{i + 1}. {l.name}</span>
                <span className="font-bold">{l.count}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
