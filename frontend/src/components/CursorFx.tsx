import { useEffect, useRef } from "react";

/** Оранжевый круглый курсор, плавно следующий за мышью (только desktop). */
export function CursorFx() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current!;
    document.documentElement.classList.add("custom-cursor");

    let x = window.innerWidth / 2, y = window.innerHeight / 2, tx = x, ty = y, raf = 0;

    const move = (e: PointerEvent) => {
      tx = e.clientX; ty = e.clientY;
      el.style.opacity = "1";
      const t = e.target as HTMLElement;
      const hot = !!t.closest("button, a, [role='button'], input, label, select, textarea");
      el.classList.toggle("hot", hot);
    };
    const down = () => el.classList.add("down");
    const up = () => el.classList.remove("down");
    const leave = () => { el.style.opacity = "0"; };

    const loop = () => {
      x += (tx - x) * 0.28;
      y += (ty - y) * 0.28;
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    loop();

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("mouseleave", leave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("mouseleave", leave);
      document.documentElement.classList.remove("custom-cursor");
    };
  }, []);

  return <div ref={ref} className="cursor-dot" />;
}
