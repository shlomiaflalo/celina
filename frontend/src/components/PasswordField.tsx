import { useState } from "react";
import { useT } from "../i18n";

/**
 * Поле пароля с «умными» помощниками, как у Google:
 *  • «Предложить надёжный пароль» — генерирует крипто-стойкий пароль и подставляет;
 *  • «Показать/скрыть» — переключает видимость;
 *  • «Копировать» — ТОЛЬКО когда пароль показан (в скрытом виде копировать нельзя,
 *    чтобы не утёк вслепую). Используется и при регистрации, и при сбросе пароля.
 */

// крипто-стойкий пароль: 16 символов, гарантированно с заглавной/строчной/цифрой/символом
function generatePassword(len = 16): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // без I/O — не путать с 1/0
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%&*?-_+=";
  const all = upper + lower + digits + symbols;
  const rnd = (n: number) => {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] % n;
  };
  // по одному из каждой группы — гарантия «сложности»
  const chars = [upper[rnd(upper.length)], lower[rnd(lower.length)], digits[rnd(digits.length)], symbols[rnd(symbols.length)]];
  for (let i = chars.length; i < len; i++) chars.push(all[rnd(all.length)]);
  // перемешиваем (Fisher–Yates на крипто-случайности), чтобы обязательные символы не стояли в начале
  for (let i = chars.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

const EyeOn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a15.8 15.8 0 0 1-2.53 3.35M6.6 6.6A15.7 15.7 0 0 0 2 12s3.5 7 10 7a9.1 9.1 0 0 0 4-.87" /><path d="M3 3l18 18" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
);
const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
);

export function PasswordField({
  value,
  onChange,
  placeholder,
  autoComplete = "new-password",
  className,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
  className: string;
  disabled?: boolean;
}) {
  const t = useT();
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    // копировать можно ТОЛЬКО в режиме показа — иначе пользователь скопирует вслепую
    if (!shown || !value) return;
    // «Скопировано» обязано означать, что пароль ДЕЙСТВИТЕЛЬНО в буфере:
    // сгенерированный пароль нигде больше не хранится, и ложный успех = пароль
    // потерян. Во встроенных браузерах clipboard часто недоступен — там фолбэк.
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        if (!ok) throw new Error("copy failed");
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // молчим только в логах — пользователю не показываем ложный успех
      setCopied(false);
    }
  }

  function suggest() {
    const pw = generatePassword();
    onChange(pw);
    setShown(true); // показываем сразу — чтобы пользователь увидел и мог скопировать
  }

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <input
          className={`${className} pr-20 disabled:opacity-50`}
          type={shown ? "text" : "password"}
          placeholder={placeholder}
          // placeholder исчезает при вводе, поэтому дублируем его как доступное
          // имя поля — иначе скринридер читает просто «поле ввода»
          aria-label={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          required
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
          {/* Копировать — виден и активен только когда пароль ПОКАЗАН и не пуст */}
          {shown && value && !disabled && (
            <button
              type="button"
              onClick={copy}
              aria-label={t.auth.copyPassword}
              title={t.auth.copyPassword}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#e0860c] transition hover:bg-orange-50"
            >
              {copied ? <span className="text-xs font-bold">✓</span> : <CopyIcon />}
            </button>
          )}
          {/* Показать/скрыть */}
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            disabled={disabled}
            aria-label={shown ? t.auth.hidePassword : t.auth.showPassword}
            title={shown ? t.auth.hidePassword : t.auth.showPassword}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#e0860c] transition hover:bg-orange-50 disabled:opacity-40"
          >
            {shown ? <EyeOff /> : <EyeOn />}
          </button>
        </div>
      </div>
      {/* Предложить надёжный пароль (как у Google) */}
      <button
        type="button"
        onClick={suggest}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e0860c] transition hover:underline disabled:opacity-40"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" /></svg>
        {t.auth.suggestPassword}
      </button>
    </div>
  );
}
