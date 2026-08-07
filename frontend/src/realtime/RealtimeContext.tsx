import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { api, getToken } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export interface Notif {
  id: string;
  type: string;          // order_new | order_status | call
  title: string;         // машинный токен (например статус заказа)
  body: string;          // имя/параметр
  orderId: string | null;
  read: boolean;
  createdAt: string;
}
interface Incoming { callId: string; from: { id: string; name: string } }
interface ActiveCall {
  callId: string;
  peerId: string;
  peerName: string;
  role: "caller" | "callee";
  state: "calling" | "connecting" | "connected" | "ended";
}

interface RealtimeState {
  notifications: Notif[];
  unread: number;
  markRead: (id?: string) => void;
  refreshNotifs: () => void;
  // звонки
  incoming: Incoming | null;
  call: ActiveCall | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  micOn: boolean;
  camOn: boolean;
  startCall: (cookProfileId: string, peerName: string) => Promise<string | null>;
  acceptCall: () => Promise<void>;
  declineCall: () => void;
  hangup: () => void;
  toggleMic: () => void;
  toggleCam: () => void;
}

const Ctx = createContext<RealtimeState>(null!);
export const useRealtime = () => useContext(Ctx);

const ICE = [{ urls: "stun:stun.l.google.com:19302" }];

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [incoming, setIncoming] = useState<Incoming | null>(null);
  const [call, setCall] = useState<ActiveCall | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localRef = useRef<MediaStream | null>(null);
  const callRef = useRef<ActiveCall | null>(null);
  const pendingIce = useRef<RTCIceCandidateInit[]>([]);
  callRef.current = call;

  function refreshNotifs() {
    api.get<{ items: Notif[]; unread: number }>("/events/notifications")
      .then((r) => { setNotifications(r.items); setUnread(r.unread); })
      .catch(() => {});
  }

  function markRead(id?: string) {
    setNotifications((ns) => ns.map((n) => (!id || n.id === id ? { ...n, read: true } : n)));
    setUnread((u) => (id ? Math.max(0, u - 1) : 0));
    api.post("/events/notifications/read", id ? { id } : {}).catch(() => {});
  }

  // ───────── WebRTC helpers ─────────
  function cleanupMedia() {
    pcRef.current?.getSenders().forEach((s) => s.track?.stop());
    pcRef.current?.close();
    pcRef.current = null;
    localRef.current?.getTracks().forEach((t) => t.stop());
    localRef.current = null;
    pendingIce.current = [];
    setLocalStream(null);
    setRemoteStream(null);
  }

  async function getLocalMedia(): Promise<MediaStream | null> {
    if (localRef.current) return localRef.current;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localRef.current = s; setLocalStream(s); setMicOn(true); setCamOn(true);
      return s;
    } catch {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        localRef.current = s; setLocalStream(s); setCamOn(false);
        return s;
      } catch { return null; }
    }
  }

  function makePc(peerId: string, callId: string) {
    const pc = new RTCPeerConnection({ iceServers: ICE });
    pc.onicecandidate = (e) => {
      if (e.candidate) signal(peerId, callId, { candidate: e.candidate.toJSON() });
    };
    pc.ontrack = (e) => setRemoteStream(e.streams[0]);
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") setCall((c) => (c ? { ...c, state: "connected" } : c));
      if (["failed", "disconnected", "closed"].includes(pc.connectionState)) endCall(false);
    };
    pcRef.current = pc;
    return pc;
  }

  function signal(peerId: string, callId: string, data: unknown) {
    api.post("/events/call/signal", { callId, toUserId: peerId, signal: data }).catch(() => {});
  }

  async function flushIce() {
    const pc = pcRef.current; if (!pc) return;
    for (const c of pendingIce.current) { try { await pc.addIceCandidate(c); } catch {} }
    pendingIce.current = [];
  }

  // ───────── публичные действия ─────────
  async function startCall(cookProfileId: string, peerName: string): Promise<string | null> {
    try {
      const r = await api.post<{ callId: string; toUserId: string; toName: string }>("/events/call/start", { cookProfileId });
      const ac: ActiveCall = { callId: r.callId, peerId: r.toUserId, peerName: peerName || r.toName, role: "caller", state: "calling" };
      setCall(ac);
      await getLocalMedia();
      return r.callId;
    } catch (e) {
      return null;
    }
  }

  async function acceptCall() {
    if (!incoming) return;
    const inc = incoming;
    setIncoming(null);
    setCall({ callId: inc.callId, peerId: inc.from.id, peerName: inc.from.name, role: "callee", state: "connecting" });
    makePc(inc.from.id, inc.callId);
    const s = await getLocalMedia();
    s?.getTracks().forEach((t) => pcRef.current?.addTrack(t, s));
    await api.post("/events/call/accept", { callId: inc.callId, toUserId: inc.from.id }).catch(() => {});
  }

  function declineCall() {
    if (!incoming) return;
    api.post("/events/call/decline", { callId: incoming.callId, toUserId: incoming.from.id }).catch(() => {});
    setIncoming(null);
  }

  function endCall(sendHangup: boolean) {
    const c = callRef.current;
    if (sendHangup && c) api.post("/events/call/hangup", { callId: c.callId, toUserId: c.peerId }).catch(() => {});
    cleanupMedia();
    setCall(null);
  }
  function hangup() { endCall(true); }

  function toggleMic() {
    const tr = localRef.current?.getAudioTracks()[0];
    if (tr) { tr.enabled = !tr.enabled; setMicOn(tr.enabled); }
  }
  function toggleCam() {
    const tr = localRef.current?.getVideoTracks()[0];
    if (tr) { tr.enabled = !tr.enabled; setCamOn(tr.enabled); }
  }

  // ───────── SSE-подключение ─────────
  useEffect(() => {
    if (!user) { setNotifications([]); setUnread(0); return; }
    const token = getToken();
    if (!token) return;
    refreshNotifs();

    const es = new EventSource(`/api/events?token=${encodeURIComponent(token)}`);

    es.addEventListener("notification", (e) => {
      const n: Notif = JSON.parse((e as MessageEvent).data);
      setNotifications((ns) => [n, ...ns].slice(0, 50));
      setUnread((u) => u + 1);
    });

    es.addEventListener("call:incoming", (e) => {
      const data = JSON.parse((e as MessageEvent).data) as Incoming;
      // не перебиваем активный звонок
      if (!callRef.current) setIncoming(data);
    });

    es.addEventListener("call:accepted", async (e) => {
      const { callId } = JSON.parse((e as MessageEvent).data);
      const c = callRef.current;
      if (!c || c.callId !== callId || c.role !== "caller") return;
      setCall({ ...c, state: "connecting" });
      const pc = makePc(c.peerId, c.callId);
      const s = await getLocalMedia();
      s?.getTracks().forEach((t) => pc.addTrack(t, s));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      signal(c.peerId, c.callId, { sdp: offer });
    });

    es.addEventListener("call:signal", async (e) => {
      const { callId, signal: sig } = JSON.parse((e as MessageEvent).data);
      const c = callRef.current;
      if (!c || c.callId !== callId) return;
      const pc = pcRef.current; if (!pc) return;
      if (sig.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(sig.sdp));
        await flushIce();
        if (sig.sdp.type === "offer") {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          signal(c.peerId, c.callId, { sdp: answer });
        }
      } else if (sig.candidate) {
        if (pc.remoteDescription) { try { await pc.addIceCandidate(sig.candidate); } catch {} }
        else pendingIce.current.push(sig.candidate);
      }
    });

    const onEnd = () => { cleanupMedia(); setCall(null); };
    es.addEventListener("call:declined", onEnd);
    es.addEventListener("call:hangup", onEnd);

    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <Ctx.Provider value={{
      notifications, unread, markRead, refreshNotifs,
      incoming, call, localStream, remoteStream, micOn, camOn,
      startCall, acceptCall, declineCall, hangup, toggleMic, toggleCam,
    }}>
      {children}
    </Ctx.Provider>
  );
}
