import { useEffect, useState } from "react";
import { Seo, SITE_URL } from "../components/Seo";
import { useLang } from "../i18n";
import { BowlMark, Logo } from "../components/Logo";
import { PlateIcon, DrinkIcon, StarIcon, CheckIcon, BagIcon, PartyIcon } from "../components/icons";

/**
 * Вертикальная авто-сторис (9:16) для Instagram: проходит по ключевым сценариям
 * приложения. Запишите экран и добавьте музыку.  Открыть: /story
 */

const SCENES = 7;
const DURATION = 3600; // мс на сцену

export function Story() {
  const { lang } = useLang();
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % SCENES), DURATION);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative mx-auto flex h-viewport max-w-[460px] flex-col overflow-hidden text-white"
      style={{ background: "linear-gradient(160deg,#f4a01f,#e0860c)" }}
    >
      <Seo
        title={lang === "en" ? "How Celina works — the story in 60 seconds" : "Как работает Celina — история в 60 секунд"}
        description={lang === "en" ? "The short story of Celina: neighbor cooks make homemade food, neighbors gather around a shared table." : "Короткая история Celina: как соседи-повара готовят домашнюю еду, а соседи собираются за общим столом."}
        path="/story"
        type="article"
      />
      {/* семантический заголовок страницы (сцены сменяются, и в них h1 нет) */}
      <h1 className="sr-only">{lang === "en" ? "How Celina works — the story in 60 seconds" : "Как работает Селина — история в 60 секунд"}</h1>
      {/* индикаторы сторис */}
      <div className="z-20 flex gap-1.5 px-4 pt-4">
        {Array.from({ length: SCENES }).map((_, k) => (
          <div key={k} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
            <div
              className="h-full rounded-full bg-white"
              style={{
                width: k < i ? "100%" : k === i ? "100%" : "0%",
                transition: k === i ? `width ${DURATION}ms linear` : "none",
              }}
            />
          </div>
        ))}
      </div>

      <div className="relative flex flex-1 items-center justify-center px-7">
        <div key={i} className="w-full">{SCENE[i]()}</div>
      </div>

      <div className="z-20 pb-8 text-center text-sm text-white/80">{SITE_URL.replace(/^https?:\/\//, "")}</div>
    </div>
  );
}

function Scene({ children }: { children: React.ReactNode }) {
  return <div className="animate-pop-in flex w-full flex-col items-center text-center">{children}</div>;
}

function Title({ t }: { t: string }) {
  return <h2 className="mt-6 text-3xl font-extrabold leading-tight drop-shadow">{t}</h2>;
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="glass-card mt-6 w-full rounded-3xl p-5 text-left">{children}</div>;
}

const SCENE: Record<number, () => JSX.Element> = {
  0: () => (
    <Scene>
      <div className="float-bowl"><Logo size={64} tone="light" /></div>
      <Title t="Homemade food from your neighbors" />
      <p className="mt-3 text-white/85">Real food, made with love — right nearby.</p>
    </Scene>
  ),
  1: () => (
    <Scene>
      <PlateIcon size={40} />
      <Title t="Search like a friend" />
      <Card>
        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-[#e0860c]">
          <PlateIcon size={18} />
          <span className="text-sm font-medium">borscht · 4★ · nearby</span>
        </div>
        <div className="mt-3 flex gap-2 text-xs">
          <Pill>★ 4+</Pill><Pill>≤ 500 m</Pill><Pill>borscht</Pill>
        </div>
      </Card>
    </Scene>
  ),
  2: () => (
    <Scene>
      <PlateIcon size={40} />
      <Title t="Cooks add their dishes" />
      <Card>
        <Row icon={<PlateIcon size={20} />} title="Борщ украинский" sub="Soups · 350 ₽" />
        <Row icon={<PlateIcon size={20} />} title="Хинкали" sub="Mains · 450 ₽" />
        <div className="mt-3 rounded-xl bg-white px-3 py-2 text-center text-sm font-semibold text-[#e0860c]">+ Add dish</div>
      </Card>
    </Scene>
  ),
  3: () => (
    <Scene>
      <BagIcon size={40} />
      <Title t="Order in two taps" />
      <Card>
        <Row icon={<PlateIcon size={20} />} title="Борщ украинский ×2" sub="700 ₽" />
        <div className="mt-3 flex items-center justify-between">
          <span className="font-semibold">Total: 900 ₽</span>
          <span className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#e0860c]">Order ✓</span>
        </div>
      </Card>
    </Scene>
  ),
  4: () => (
    <Scene>
      <DrinkIcon size={40} />
      <Title t="Get together with a neighbor" />
      <p className="mt-3 text-white/85">Join a local cook for tea and a good chat at their table — the neighborly way.</p>
    </Scene>
  ),
  5: () => (
    <Scene>
      <PartyIcon size={40} />
      <Title t="Track it to your door" />
      <Card>
        {[
          { I: CheckIcon, t: "Accepted", on: true },
          { I: PlateIcon, t: "Cooking", on: true },
          { I: BagIcon, t: "Ready", on: true },
          { I: PartyIcon, t: "Delivered — enjoy!", on: true },
        ].map((s, k) => (
          <div key={k} className="flex items-center gap-3 py-1.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0860c] text-white"><s.I size={18} /></span>
            <span className="text-sm font-medium text-[#e0860c]">{s.t}</span>
          </div>
        ))}
      </Card>
    </Scene>
  ),
  6: () => (
    <Scene>
      <div className="flex gap-1">{[0, 1, 2, 3, 4].map((k) => <StarIcon key={k} size={34} />)}</div>
      <Title t="Loved it? Leave a review" />
      <Card>
        <div className="flex gap-1">{[0, 1, 2, 3, 4].map((k) => <StarIcon key={k} size={22} />)}</div>
        <p className="mt-2 text-sm text-[#e0860c]">Как у бабушки — пальчики оближешь!</p>
      </Card>
      <div className="mt-6 rounded-2xl bg-white px-6 py-3 text-lg font-bold text-[#e0860c]">Order now · Celina</div>
    </Scene>
  ),
};

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-orange-100 px-2.5 py-1 font-medium text-[#e0860c]">{children}</span>;
}
function Row({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-orange-100 py-2 last:border-0">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">{icon}</span>
      <div>
        <div className="font-medium text-[#e0860c]">{title}</div>
        <div className="text-xs text-[#e0860c]">{sub}</div>
      </div>
    </div>
  );
}
