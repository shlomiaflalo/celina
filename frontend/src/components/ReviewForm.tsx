import { useState } from "react";
import { api } from "../api/client";
import { Button } from "./ui";
import { StarIcon } from "./icons";
import { useT } from "../i18n";

export function ReviewForm({ orderId, onDone }: { orderId: string; onDone?: () => void }) {
  const t = useT();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await api.post("/reviews", { orderId, rating, comment: comment || undefined });
      setDone(true);
      onDone?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.error);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-orange-50 p-4 text-[#e0860c]"><StarIcon size={18} /> {t.review.thanks}</div>
    );
  }

  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
      <h3 className="font-semibold">{t.review.title}</h3>
      <div className="mt-2 mb-1 text-sm ">{t.review.yourRating}</div>
      <div className="flex gap-1 text-3xl">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            aria-label={t.a11y.rate(n)}
            aria-pressed={rating === n}
            className={`transition ${(hover || rating) >= n ? "text-[#e0860c]" : "text-[#e0860c] opacity-25"}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t.review.comment}
        aria-label={t.review.comment}
        rows={3}
        className="mt-3 w-full rounded-xl border border-orange-100 px-3 py-2 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
      />
      {error && <p className="mt-2 text-sm text-[#e0860c] font-semibold">{error}</p>}
      <div className="mt-3">
        <Button onClick={submit} disabled={busy}>
          {t.review.submit}
        </Button>
      </div>
    </div>
  );
}
