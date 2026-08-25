import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../api/client";
import { toast } from "../../components/Toast";
import type { Gathering } from "../../types";
import { Spinner, Button, ErrorState } from "../../components/ui";
import { DeleteButton } from "../../components/DeleteButton";
import { PinIcon, ClockIcon, CheckIcon, CookIcon, CoinsIcon } from "../../components/icons";
import { cityImage } from "../../lib/cityImage";
import { cityPrepOf } from "../../lib/seoData";
import { useAuth } from "../../auth/AuthContext";
import { useT, useLang, useTr } from "../../i18n";
import { Seo, SITE_URL } from "../../components/Seo";
import { metricaGoal } from "../../components/Metrica";
import { InviteMoment } from "../../components/InviteMoment";

export function GatheringDetail() {
  const t = useT();
  const { lang } = useLang();
  const tr = useTr();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [g, setG] = useState<Gathering | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [guests, setGuests] = useState(1);

  function load() {
    setFailed(false);
    api.get<{ gathering: Gathering }>(`/gatherings/${id}`).then((r) => { setG(r.gathering); setGuests(r.gathering.myGuests || 1); }).catch(() => setFailed(true));
  }
  useEffect(load, [id]);

  if (failed) return <ErrorState onRetry={load} />;
  if (!g) return <Spinner />;

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString(lang === "en" ? "en-GB" : "ru-RU", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

  const maxGuests = Math.min(10, g.seatsLeft + g.myGuests);
  const going = g.myGuests > 0;
  const closed = g.status === "PAST" || g.status === "CANCELLED";
  // «момент шеринга» после брони — в нём уже есть те же кнопки + «копировать
  // ссылку», поэтому обычный блок шеринга ниже в этот момент не дублируем
  const showInvite = !g.isHost && !closed && going;

  async function rsvp() {
    if (!user) return navigate("/login");
    setBusy(true);
    try { const r = await api.post<{ gathering: Gathering }>(`/gatherings/${g!.id}/rsvp`, { guests }); setG(r.gathering); metricaGoal("gathering_rsvp"); }
    catch (e) { toast(e instanceof Error ? e.message : t.common.error); }
    finally { setBusy(false); }
  }
  async function cancelRsvp() {
    setBusy(true);
    try { const r = await api.del<{ gathering: Gathering }>(`/gatherings/${g!.id}/rsvp`); setG(r.gathering); setGuests(1); }
    catch (e) { toast(e instanceof Error ? e.message : t.common.error); }
    finally { setBusy(false); }
  }

  // ссылки для шеринга (Telegram/VK/WhatsApp — главные каналы в РФ)
  const shareUrl = `${SITE_URL}/gatherings/${g.id}`;
  const shareText = `${t.gatherings.inviteText}: ${g.title}`;
  const tg = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
  const vk = `https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: g.title,
    description: g.description || g.title,
    startDate: g.startsAt,
    eventStatus: g.status === "CANCELLED" ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: g.city || "", address: { "@type": "PostalAddress", addressLocality: g.city || "", addressCountry: "RU" } },
    image: g.coverUrl || undefined,
    organizer: g.host ? { "@type": "Person", name: g.host.name } : undefined,
    offers: { "@type": "Offer", price: g.pricePerGuest, priceCurrency: "RUB", availability: g.seatsLeft > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut", url: shareUrl },
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Seo title={`${g.title} — застолье${g.city ? ` в ${cityPrepOf(g.city)}` : ""} — Селина`} description={(g.description || `Соседское застолье ${g.title} на Celina.`).slice(0, 200)} path={`/gatherings/${g.id}`} type="article" image={g.coverUrl || undefined} jsonLd={jsonLd} />

      <Link to="/gatherings" className="text-sm font-medium text-white/90 hover:underline">← {t.gatherings.back}</Link>

      <div className="mt-3 overflow-hidden rounded-3xl border border-[var(--hairline)] bg-white shadow-sm">
        <div className="relative h-48 sm:h-60">
          <img src={g.coverUrl || cityImage(g.city)} alt={g.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
          <h1 className="absolute inset-x-5 bottom-3 text-2xl font-bold text-white drop-shadow sm:text-3xl">{tr(g.title)}</h1>
          {closed && (
            <span className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#e0860c] shadow-sm">
              {g.status === "PAST" ? t.gatherings.past : t.gatherings.cancelled}
            </span>
          )}
        </div>

        <div className="p-5 sm:p-6">
          {g.description && <p className="leading-relaxed text-[#e0860c]">{tr(g.description)}</p>}

          <div className="mt-4 space-y-2 text-sm text-[#e0860c]">
            <div className="flex items-center gap-2"><ClockIcon size={16} /> <span className="font-medium">{t.gatherings.when}:</span> {fmtDate(g.startsAt)}</div>
            <div className="flex items-center gap-2"><PinIcon size={16} /> <span className="font-medium">{t.gatherings.where}:</span> {g.address ? g.address : `${tr(g.city) || "—"} · ${t.gatherings.addressHidden}`}</div>
            <div className="flex items-center gap-2"><CookIcon size={16} /> <span className="font-medium">{t.gatherings.host}:</span> {tr(g.host?.name) || "—"}</div>
            <div className="flex items-center gap-2"><CoinsIcon size={16} /> {g.seatsLeft > 0 ? `${g.seatsLeft} ${t.gatherings.seatsLeft(g.seatsLeft)}` : t.gatherings.full} · {g.pricePerGuest > 0 ? `${g.pricePerGuest} ₽ ${t.gatherings.perGuest}` : t.gatherings.free}</div>
          </div>

          {/* RSVP */}
          {!g.isHost && !closed && (
            <div className="mt-5 border-t border-[var(--hairline)] pt-4">
              {going ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#e0860c]"><CheckIcon size={18} /> {t.gatherings.joined} ({g.myGuests})</span>
                  <button onClick={cancelRsvp} disabled={busy} className="text-sm font-medium text-[#e0860c] hover:underline disabled:opacity-50">{t.gatherings.cancelRsvp}</button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-[#e0860c]">{t.gatherings.howMany}</span>
                  <div className="flex items-center gap-2">
                    <button aria-label={t.gatherings.fewerGuests} onClick={() => setGuests((x) => Math.max(1, x - 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-200 bg-white text-lg leading-none hover:bg-orange-50">−</button>
                    <span className="w-6 text-center font-semibold">{guests}</span>
                    <button aria-label={t.gatherings.moreGuests} onClick={() => setGuests((x) => Math.min(maxGuests, x + 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-200 bg-white text-lg leading-none hover:bg-orange-50">+</button>
                  </div>
                  <Button onClick={rsvp} disabled={busy || g.seatsLeft <= 0}>
                    {user ? t.gatherings.join : t.gatherings.loginToJoin}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* вирусная петля: место забронировано → позвать соседей */}
          {showInvite && <InviteMoment variant="gathering" />}

          {g.isHost && (
            <div className="mt-5 border-t border-[var(--hairline)] pt-4">
              <DeleteButton
                label={t.gatherings.deleteGathering}
                confirmText={t.gatherings.deleteGatheringConfirm}
                successText={t.gatherings.gatheringDeleted}
                onDelete={async () => { await api.del(`/gatherings/${g.id}`); }}
                onDone={() => navigate("/gatherings")}
              />
            </div>
          )}

          {/* шеринг — вирусная петля */}
          {!showInvite && (
            <div className="mt-5 border-t border-[var(--hairline)] pt-4">
              <div className="mb-2 text-sm font-medium text-[#e0860c]">{t.gatherings.share}</div>
              <div className="flex flex-wrap gap-2">
                <a href={tg} target="_blank" rel="noreferrer" className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-[#e0860c] ring-1 ring-[var(--hairline)] transition hover:bg-orange-100">Telegram</a>
                <a href={vk} target="_blank" rel="noreferrer" className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-[#e0860c] ring-1 ring-[var(--hairline)] transition hover:bg-orange-100">{t.share.vk}</a>
                <a href={wa} target="_blank" rel="noreferrer" className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-[#e0860c] ring-1 ring-[var(--hairline)] transition hover:bg-orange-100">WhatsApp</a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* кто идёт */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-white drop-shadow">{t.gatherings.attendees} ({g.seatsTaken})</h2>
        {g.attendees.length === 0 ? (
          <p className="text-sm text-white/90">{t.gatherings.noAttendees}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {g.attendees.map((a, i) => (
              <span key={i} className="rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-[#e0860c] ring-1 ring-[var(--hairline)]">
                {tr(a.name)}{a.guests > 1 ? ` +${a.guests - 1}` : ""}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
