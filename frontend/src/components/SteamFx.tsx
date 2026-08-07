/** Разовый пар, поднимающийся от кнопки после оформления заказа. */
export function SteamFx() {
  return (
    <div className="pointer-events-none absolute -top-7 left-1/2 z-20 -translate-x-1/2">
      <svg width="64" height="46" viewBox="0 0 64 46" style={{ overflow: "visible" }}>
        <g stroke="#e0860c" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.75">
          <path className="steam-wisp" style={{ animationDelay: "0s" }} d="M20 46c-6-6 6-10 0-18" />
          <path className="steam-wisp" style={{ animationDelay: "0.15s" }} d="M32 46c-6-6 6-10 0-20" />
          <path className="steam-wisp" style={{ animationDelay: "0.3s" }} d="M44 46c-6-6 6-10 0-18" />
        </g>
      </svg>
    </div>
  );
}
