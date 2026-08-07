import { Link } from "react-router-dom";
import { Head } from "vite-react-ssg";
import { useT } from "../i18n";

/**
 * Креативная 404 / нет доступа: разбитая чаша из логотипа Celina.
 * Две половинки чаши расходятся, над ними поднимается пар, рядом — крошки.
 */
export function NotFound() {
  const t = useT();
  return (
    <div className="flex min-h-[68vh] flex-col items-center justify-center px-6 py-16 text-center text-white">
      {/* несуществующие URL не должны индексироваться как дубли главной (soft-404) */}
      <Head>
        <title>{`404 — ${t.notFound.title} | Celina`}</title>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <style>{`
        @keyframes nf-tipL { 0%,100%{transform:rotate(-7deg) translate(-3px,1px)} 50%{transform:rotate(-9deg) translate(-5px,3px)} }
        @keyframes nf-tipR { 0%,100%{transform:rotate(7deg) translate(3px,1px)} 50%{transform:rotate(9deg) translate(5px,3px)} }
        @keyframes nf-steam { 0%{opacity:0; transform:translateY(7px) scaleY(.85)} 45%{opacity:.85} 100%{opacity:0; transform:translateY(-12px) scaleY(1.1)} }
        @keyframes nf-crumb { 0%,100%{transform:translateY(0)} 50%{transform:translateY(3px)} }
        .nf-L{transform-origin:133px 176px; animation:nf-tipL 4.5s ease-in-out infinite}
        .nf-R{transform-origin:133px 176px; animation:nf-tipR 4.5s ease-in-out infinite}
        .nf-steam path{animation:nf-steam 2.8s ease-in-out infinite}
        .nf-steam path:nth-child(2){animation-delay:.6s}
        .nf-steam path:nth-child(3){animation-delay:1.2s}
        .nf-crumb{animation:nf-crumb 3.2s ease-in-out infinite}
        @media (prefers-reduced-motion: reduce){ .nf-L,.nf-R,.nf-steam path,.nf-crumb{animation:none} }
      `}</style>

      <svg viewBox="0 0 266 210" width="300" className="mb-2 drop-shadow-[0_10px_24px_rgba(120,72,8,0.35)]" role="img" aria-label="404">
        {/* пар над чашей (как в логотипе) */}
        <g className="nf-steam" fill="none" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" opacity="0.9">
          <path d="M116 56 C108 47 124 41 116 30" />
          <path d="M137 58 C129 48 145 42 137 28" />
          <path d="M158 56 C150 47 166 41 158 30" />
        </g>

        {/* тень */}
        <ellipse cx="133" cy="196" rx="78" ry="10" fill="rgba(0,0,0,0.16)" />

        {/* левая половина разбитой чаши + ножка */}
        <g className="nf-L" fill="#ffffff">
          <path d="M24 96 L108 96 L101 113 L110 131 L102 149 L109 168 C95 179 70 175 52 162 C35 148 26 123 24 96 Z" />
          <path d="M83 165 L105 165 L102 187 Q102 190 97 190 L89 190 Q84 190 85 187 Z" />
          {/* блик, как в логотипе */}
          <path d="M44 104 C48 124 58 142 76 156" stroke="rgba(255,244,223,0.5)" strokeWidth="6" strokeLinecap="round" fill="none" />
        </g>

        {/* правая половина разбитой чаши + ножка */}
        <g className="nf-R" fill="#ffffff">
          <path d="M242 96 L158 96 L165 113 L156 131 L164 149 L157 168 C171 179 196 175 214 162 C231 148 240 123 242 96 Z" />
          <path d="M161 165 L183 165 L180 187 Q180 190 175 190 L167 190 Q162 190 163 187 Z" />
        </g>

        {/* крошки в месте разлома */}
        <g className="nf-crumb" fill="#ffffff">
          <circle cx="133" cy="150" r="3.4" opacity="0.95" />
          <circle cx="122" cy="176" r="2.6" opacity="0.85" />
          <circle cx="145" cy="172" r="2.2" opacity="0.8" />
          <circle cx="133" cy="120" r="2" opacity="0.7" />
        </g>
      </svg>

      <h1 className="text-6xl font-extrabold tracking-tight drop-shadow sm:text-7xl">404</h1>
      <h2 className="mt-3 text-2xl font-bold drop-shadow">{t.notFound.title}</h2>
      <p className="mt-2 max-w-md text-white/90">{t.notFound.text}</p>
      <Link to="/" className="btn-glass mt-7 rounded-full px-8 py-3 text-base font-semibold">
        {t.notFound.home}
      </Link>
    </div>
  );
}
