/** Звук колокольчика при оформлении заказа (Web Audio, без файлов). */
export function playBell() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const tones = [880, 1318.5, 1760]; // ля + ми + ля (приятный звон)
    tones.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      const start = now + i * 0.04;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.28 / (i + 1), start + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 1.4);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(start);
      o.stop(start + 1.5);
    });
    setTimeout(() => ctx.close(), 1700);
  } catch {
    /* звук недоступен — не критично */
  }
}
