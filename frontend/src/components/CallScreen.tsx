import { useEffect, useRef } from "react";
import { useRealtime } from "../realtime/RealtimeContext";
import { CookIcon } from "./icons";
import { useT } from "../i18n";

// простые иконки для панели звонка (белые/тёмные по currentColor — не эмодзи)
const MicSvg = ({ off = false }: { off?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    {off && <path d="M4 4l16 16" />}
  </svg>
);
const VidSvg = ({ off = false }: { off?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="13" height="12" rx="2" /><path d="M15 10l6-3v10l-6-3" />
    {off && <path d="M3 3l18 18" />}
  </svg>
);

/** Полноэкранный видеозвонок (WebRTC). Рендерится глобально, когда есть активный звонок. */
export function CallScreen() {
  const { call, localStream, remoteStream, micOn, camOn, toggleMic, toggleCam, hangup } = useRealtime();
  const t = useT();
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  useEffect(() => { if (localRef.current) localRef.current.srcObject = localStream; }, [localStream, call]);
  useEffect(() => { if (remoteRef.current) remoteRef.current.srcObject = remoteStream; }, [remoteStream, call]);

  if (!call) return null;
  const status =
    call.state === "calling" ? t.video.calling
    : call.state === "connected" ? t.video.inCall
    : t.video.connecting;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-stone-900">
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {remoteStream ? (
          <video ref={remoteRef} autoPlay playsInline className="h-full w-full object-cover" />
        ) : (
          <div className="text-center text-white">
            <div className="glow mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-white"><CookIcon size={56} /></div>
            <div className="text-xl font-semibold">{call.peerName}</div>
            <div className="mt-1 text-sm text-white/60">{status}…</div>
          </div>
        )}

        {/* свой кадр (картинка-в-картинке) */}
        <div className="absolute bottom-4 right-4 h-44 w-32 overflow-hidden rounded-2xl border border-white/20 bg-black shadow-xl sm:h-52 sm:w-40">
          <video ref={localRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
          {!camOn && <div className="absolute inset-0 flex items-center justify-center bg-stone-800 text-xs text-white/60">{t.video.you}</div>}
          <span className="absolute bottom-1 left-2 text-xs text-white/80">{t.video.you}</span>
        </div>

        <div className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-sm font-medium text-white">
          {call.peerName} · {status}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 pb-8 pt-4">
        <CallBtn active={micOn} onClick={toggleMic} label={t.video.mic}><MicSvg off={!micOn} /></CallBtn>
        <button
          onClick={hangup}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:brightness-110 active:scale-95"
          // подпись была захардкожена по-английски — теперь по языку интерфейса
          aria-label={t.video.end}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M3 10c5-4 13-4 18 0l-2 3-4-1v-2c-2-1-4-1-6 0v2l-4 1z" fill="currentColor" transform="rotate(135 12 12)" /></svg>
        </button>
        <CallBtn active={camOn} onClick={toggleCam} label={t.video.camera}><VidSvg off={!camOn} /></CallBtn>
      </div>
    </div>
  );
}

function CallBtn({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      // кнопки только с иконкой: без aria-label скринридер читал просто «кнопка»
      aria-label={label}
      aria-pressed={active}
      className={`flex h-14 w-14 items-center justify-center rounded-full text-xl transition active:scale-95 ${active ? "bg-white/15 text-white hover:bg-white/25" : "bg-white"}`}
    >
      {children}
    </button>
  );
}
