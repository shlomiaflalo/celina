import { useRealtime } from "../realtime/RealtimeContext";
import { PhoneIcon } from "./icons";
import { useT } from "../i18n";

/** Плашка входящего звонка (рендерится глобально). */
export function IncomingCall() {
  const { incoming, acceptCall, declineCall, call } = useRealtime();
  const t = useT();
  if (!incoming || call) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-[70] mx-auto w-[min(92%,360px)] animate-fade-up rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-orange-100">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 animate-pulse items-center justify-center rounded-full bg-orange-100"><PhoneIcon size={22} /></div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-[#e0860c]">{t.video.incoming}</div>
          <div className="truncate text-lg font-bold text-[#e0860c]">{incoming.from.name}</div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={declineCall} className="flex-1 rounded-full bg-orange-100 py-2.5 text-sm font-semibold text-[#e0860c] transition hover:bg-orange-100">
          {t.video.decline}
        </button>
        <button onClick={acceptCall} className="flex-1 rounded-full bg-[#e0860c] py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
          {t.video.accept}
        </button>
      </div>
    </div>
  );
}
