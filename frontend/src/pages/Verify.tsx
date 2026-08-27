import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { RoundCheck } from "../components/RoundCheck";
import { VideoIcon } from "../components/icons";
import { useT } from "../i18n";

export function Verify() {
  const t = useT();
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [upV, setUpV] = useState(false);
  const [upD, setUpD] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ошибка может родиться у верхнего загрузчика, а рендерится внизу формы —
  // сама прокручиваемся к ней, иначе на телефоне она остаётся за экраном
  useEffect(() => {
    if (error) document.getElementById("kyc-error")?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [error]);
  // ОТДЕЛЬНОЕ согласие на биометрию (ст.11 152-ФЗ) — не смешивается с общей
  // Политикой; видео-селфи + документ обрабатываются только при этой отметке
  const [bioConsent, setBioConsent] = useState(false);

  // шаги безопасности пищи для повара
  const isCook = user?.role === "COOK";
  const [hygiene, setHygiene] = useState(false);
  const [safety, setSafety] = useState(false);
  const [kitchenPhotos, setKitchenPhotos] = useState<string[]>([]);
  const [upK, setUpK] = useState(false);

  const status = user?.verificationStatus ?? "UNVERIFIED";
  const verified = user?.isVerified || status === "VERIFIED";

  // пока на проверке — опрашиваем сервер; одобрение откроет доступ автоматически
  useEffect(() => {
    if (status !== "PENDING") return;
    const iv = setInterval(() => { refresh(); }, 4000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // как только одобрено — авто-переход (доступ открыт)
  useEffect(() => {
    if (!verified) return;
    const id = setTimeout(() => navigate(user?.role === "COOK" ? "/cook" : "/"), 1500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified]);

  async function onKitchenPhoto(file: File | undefined) {
    if (!file) return;
    setUpK(true);
    setError(null);
    try {
      const { url } = await api.upload(file);
      setKitchenPhotos((p) => [...p, url].slice(0, 4));
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.error);
    } finally {
      setUpK(false);
    }
  }

  const cookReady = !isCook || (hygiene && safety && kitchenPhotos.length > 0);
  const canSubmit = !!videoUrl && !!docUrl && cookReady && bioConsent;

  async function upload(file: File | undefined, set: (u: string) => void, busySet: (b: boolean) => void) {
    if (!file) return;
    busySet(true);
    setError(null);
    try {
      // паспорт и селфи-видео — в приватное хранилище (не публичная /uploads)
      const { url } = await api.uploadKyc(file);
      set(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.error);
    } finally {
      busySet(false);
    }
  }

  async function submit() {
    if (!videoUrl || !docUrl) {
      setError(t.verify.needBoth);
      return;
    }
    if (isCook && !cookReady) {
      setError(t.verify.needCook);
      return;
    }
    if (!bioConsent) {
      setError(t.verify.needBioConsent);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.post("/auth/verify", {
        videoUrl,
        docUrl,
        biometricConsent: true,
        ...(isCook ? { hygieneAccepted: hygiene, foodSafetySigned: safety, kitchenPhotos } : {}),
      });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.error);
    } finally {
      setBusy(false);
    }
  }

  if (verified) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 w-fit">
          <VerifiedBadge size={56} />
        </div>
        <h1 className="text-2xl font-bold text-[#e0860c]">{t.verify.verified}</h1>
        <p className="mt-2 text-[#e0860c]">{t.verify.why}</p>
        <div className="mt-6">
          <Button onClick={() => navigate(user?.role === "COOK" ? "/cook" : "/")}>
            {t.nav.feed}
          </Button>
        </div>
      </div>
    );
  }

  // на проверке у основателя — ждём одобрения (доступ откроется сам)
  if (status === "PENDING") {
    return (
      <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-[#e0860c]" />
        <h1 className="text-2xl font-bold text-[#e0860c]">{t.verify.pendingTitle}</h1>
        <p className="mt-2 text-[#e0860c]">{t.verify.pendingText}</p>
        <p className="mt-4 text-xs text-[#e0860c]">{t.verify.pendingPoll}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold">{t.verify.title}</h1>
        <p className="mt-2 text-sm text-[#e0860c]">{t.verify.subtitle}</p>
        <p className="mt-1 text-xs text-[#e0860c]">{t.verify.why}</p>

        {/* правило: документ из России и совпадает с городом */}
        <p className="mt-4 rounded-xl bg-orange-50 px-3.5 py-2.5 text-sm font-bold text-[#e0860c]">
          {t.verify.docRule}
        </p>

        {status === "REJECTED" && (
          <p className="mt-4 rounded-xl bg-orange-50 px-3 py-2 text-sm font-semibold text-[#e0860c]">
            {t.verify.rejected}
          </p>
        )}

        {/* видео */}
        <div className="mt-6 space-y-1.5">
          <div className="text-sm font-semibold">{t.verify.video}</div>
          <div className="text-xs text-[#e0860c]">{t.verify.videoHint}</div>
          {videoUrl ? (
            <div className="flex items-center gap-3">
              <video src={api.kycUrl(videoUrl)} className="h-20 w-32 rounded-lg object-cover" muted controls />
              <span className="text-sm font-medium text-[#e0860c]">✓ {t.verify.videoReady}</span>
            </div>
          ) : (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-orange-300 bg-orange-50 px-4 py-2.5 text-sm font-medium text-[#e0860c] hover:bg-orange-100">
              <VideoIcon size={18} />
              {upV ? t.cook.uploadingVideo : t.verify.uploadVideo}
              <input
                type="file"
                accept="video/*"
                capture="user"
                className="sr-only"
                onChange={(e) => upload(e.target.files?.[0], setVideoUrl, setUpV)}
                disabled={upV}
              />
            </label>
          )}
        </div>

        {/* документ */}
        <div className="mt-5 space-y-1.5">
          <div className="text-sm font-semibold">{t.verify.doc}</div>
          <div className="text-xs text-[#e0860c]">{t.verify.docHint}</div>
          {docUrl ? (
            <div className="flex items-center gap-3">
              {docUrl.endsWith(".pdf") ? (
                <span className="rounded-lg bg-orange-50 px-3 py-2 text-sm">PDF</span>
              ) : (
                <img src={api.kycUrl(docUrl)} alt="" className="h-20 w-32 rounded-lg object-cover" />
              )}
              <span className="text-sm font-medium text-[#e0860c]">✓ {t.verify.docReady}</span>
            </div>
          ) : (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-orange-300 bg-orange-50 px-4 py-2.5 text-sm font-medium text-[#e0860c] hover:bg-orange-100">
              {upD ? t.cook.uploading : t.verify.uploadDoc}
              <input
                type="file"
                accept="image/*,application/pdf"
                className="sr-only"
                onChange={(e) => upload(e.target.files?.[0], setDocUrl, setUpD)}
                disabled={upD}
              />
            </label>
          )}
        </div>

        {/* ── Безопасность пищи (только для поваров) ── */}
        {isCook && (
          <div className="mt-7 rounded-2xl border-2 border-orange-200 bg-orange-50/50 p-4">
            <h2 className="text-sm font-bold text-[#e0860c]">{t.verify.cookSection}</h2>
            <p className="mt-1 text-xs text-[#e0860c]">{t.verify.cookIntro}</p>

            {/* 1. санитарные нормы */}
            <div className="mt-4">
              <RoundCheck checked={hygiene} onChange={setHygiene}>
                <span className="font-semibold">{t.verify.hygiene}.</span> {t.verify.hygieneText}
              </RoundCheck>
            </div>

            {/* 2. фото кухни */}
            <div className="mt-4">
              <div className="text-sm font-semibold">{t.verify.kitchen}</div>
              <div className="text-xs text-[#e0860c]">{t.verify.kitchenHint}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {kitchenPhotos.map((url) => (
                  <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-[color:var(--hairline)]">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setKitchenPhotos((p) => p.filter((x) => x !== url))} aria-label={t.a11y.removePhoto} className="absolute right-0 top-0 p-1.5"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white">×</span></button>
                  </div>
                ))}
                {kitchenPhotos.length < 4 && (
                  <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-orange-300 bg-white text-center text-[10px] font-medium text-[#e0860c] hover:bg-orange-100">
                    {upK ? "…" : "+ " + t.verify.addKitchenPhoto}
                    <input type="file" accept="image/*" className="sr-only" onChange={(e) => onKitchenPhoto(e.target.files?.[0])} disabled={upK} />
                  </label>
                )}
              </div>
            </div>

            {/* 3. заявление о безопасности */}
            <div className="mt-4">
              <RoundCheck checked={safety} onChange={setSafety}>
                <span className="font-semibold">{t.verify.safety}.</span> {t.verify.safetyText}
              </RoundCheck>
            </div>
          </div>
        )}

        {/* ОТДЕЛЬНОЕ согласие на обработку биометрии (ст.11 152-ФЗ) */}
        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-orange-200 bg-orange-50/40 p-3.5">
          <input
            type="checkbox"
            checked={bioConsent}
            onChange={(e) => setBioConsent(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[#e0860c]"
          />
          <span className="text-sm leading-snug text-[#e0860c]">{t.verify.bioConsent}</span>
        </label>

        {error && (
          <p id="kyc-error" role="alert" className="mt-4 rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-[#e0860c]">{error}</p>
        )}

        <div className="mt-6">
          {/* НЕ дизейблим по canSubmit: внутри submit() уже написана точная
              диагностика (needBoth/needCook/needBioConsent) — мёртвая кнопка
              прятала её, и повар не понимал, чего не хватает */}
          <Button full onClick={submit} disabled={busy}>
            {busy ? t.verify.submitting : t.verify.submit}
          </Button>
        </div>
      </div>
    </div>
  );
}
