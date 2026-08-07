#!/usr/bin/env python3
"""Celina — церемониальная кнопка запуска сайта.

Крошечный сервис на 127.0.0.1 (за nginx). Пока существует файл-флаг
prelaunch.flag, nginx показывает на домене заглушку «скоро открытие».
Нажатие большой оранжевой кнопки удаляет флаг — и сайт мгновенно
открывается для всех. Обратной кнопки нет: запуск — момент праздничный.

Маршруты (SECRET берётся из env LAUNCH_SECRET):
  GET  /zapusk-<SECRET>      — страница с кнопкой
  POST /zapusk-<SECRET>/go   — запуск (удаляет флаг, проверяет сайт)

Env: LAUNCH_SECRET, FLAG (путь к prelaunch.flag), PORT (по умолч. 9099).
"""
import json
import os
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

SECRET = os.environ.get("LAUNCH_SECRET", "")
FLAG = os.environ.get("FLAG", "/var/www/celina-launch/prelaunch.flag")
PORT = int(os.environ.get("PORT", "9099"))
SITE = os.environ.get("SITE", "https://celinaeda.ru")

PAGE = """<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Запуск Селины 🚀</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: radial-gradient(1200px 800px at 50% 20%, #2a1c0e 0%, #17100a 60%, #100b06 100%);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    color: #f5ead9; text-align: center; padding: 24px; overflow: hidden;
  }
  .wrap { max-width: 640px; position: relative; z-index: 2; }
  .logo { font-size: 52px; font-weight: 800; color: #e0860c; margin-bottom: 6px; }
  .tag { font-size: 18px; opacity: .9; margin-bottom: 34px; }
  #btn {
    width: 240px; height: 240px; border-radius: 50%; border: none; cursor: pointer;
    background: radial-gradient(circle at 35% 30%, #ffb347, #e0860c 55%, #a85f04);
    color: #fff; font-size: 26px; font-weight: 800; line-height: 1.25;
    box-shadow: 0 0 0 10px rgba(224,134,12,.15), 0 0 60px rgba(224,134,12,.45), 0 14px 40px rgba(0,0,0,.5);
    animation: pulse 1.8s ease-in-out infinite; transition: transform .15s ease;
    font-family: inherit;
  }
  #btn:hover { transform: scale(1.04); }
  #btn:active { transform: scale(.96); }
  #btn:disabled { animation: none; opacity: .65; cursor: default; }
  @keyframes pulse {
    0%,100% { box-shadow: 0 0 0 10px rgba(224,134,12,.15), 0 0 60px rgba(224,134,12,.45), 0 14px 40px rgba(0,0,0,.5); }
    50% { box-shadow: 0 0 0 22px rgba(224,134,12,.07), 0 0 90px rgba(224,134,12,.65), 0 14px 40px rgba(0,0,0,.5); }
  }
  #result { margin-top: 34px; font-size: 22px; min-height: 96px; }
  #result a {
    color: #ffb347; font-weight: 700; font-size: 26px; text-decoration: none;
    border-bottom: 2px solid #e0860c;
  }
  .big { font-size: 34px; font-weight: 800; color: #ffd08a; margin-bottom: 10px; }
  .confetti {
    position: fixed; top: -40px; z-index: 1; font-size: 28px; pointer-events: none;
    animation: fall linear forwards;
  }
  @keyframes fall {
    to { transform: translateY(110vh) rotate(720deg); }
  }
</style>
</head>
<body>
  <div class="wrap">
    <div class="logo">Селина</div>
    <div class="tag">Домашняя еда от соседей · celinaeda.ru</div>
    <button id="btn">Запустить<br>сайт 🚀</button>
    <div id="result"></div>
  </div>
<script>
const btn = document.getElementById("btn");
const result = document.getElementById("result");
const EMOJI = ["🎉","🧡","🍲","✨","🥟","🎊","🥧","💛"];
function confetti() {
  for (let i = 0; i < 120; i++) {
    const s = document.createElement("span");
    s.className = "confetti";
    s.textContent = EMOJI[Math.floor(Math.random() * EMOJI.length)];
    s.style.left = Math.random() * 100 + "vw";
    s.style.animationDuration = 2.5 + Math.random() * 3 + "s";
    s.style.animationDelay = Math.random() * 1.2 + "s";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 7000);
  }
}
btn.addEventListener("click", async () => {
  btn.disabled = true;
  btn.innerHTML = "Запускаем…";
  try {
    const r = await fetch(location.pathname + "/go", { method: "POST" });
    const d = await r.json();
    if (d.launched) {
      confetti();
      btn.innerHTML = "Сайт<br>в эфире! 🎉";
      result.innerHTML = '<div class="big">Поздравляем! Сайт в эфире! 🥂</div>' +
        '<a href="' + d.site + '" target="_blank">' + d.site.replace("https://","") + "</a>";
    } else {
      btn.disabled = false;
      btn.innerHTML = "Запустить<br>сайт 🚀";
      result.textContent = "Не получилось — попробуйте ещё раз";
    }
  } catch (e) {
    btn.disabled = false;
    btn.innerHTML = "Запустить<br>сайт 🚀";
    result.textContent = "Ошибка сети — попробуйте ещё раз";
  }
});
</script>
</body>
</html>
"""


class Handler(BaseHTTPRequestHandler):
    def _send(self, code: int, body: bytes, ctype: str) -> None:
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802 (stdlib naming)
        if SECRET and self.path == f"/zapusk-{SECRET}":
            self._send(200, PAGE.encode(), "text/html; charset=utf-8")
        else:
            self._send(404, b"Not found", "text/plain")

    def do_POST(self) -> None:  # noqa: N802
        if not (SECRET and self.path == f"/zapusk-{SECRET}/go"):
            self._send(404, b"Not found", "text/plain")
            return
        # идемпотентно: повторное нажатие после запуска — тоже «успех»
        try:
            if os.path.exists(FLAG):
                os.remove(FLAG)
            launched = not os.path.exists(FLAG)
        except OSError:
            launched = False
        site_ok = False
        if launched:
            try:  # сайт жив? (напрямую в Node, мимо nginx)
                with urllib.request.urlopen("http://127.0.0.1:4000/", timeout=5) as r:
                    site_ok = r.status == 200
            except Exception:
                site_ok = False
        body = json.dumps({"launched": launched, "site_ok": site_ok, "site": SITE}).encode()
        self._send(200, body, "application/json")

    def log_message(self, *args: object) -> None:  # тише в journald
        pass


if __name__ == "__main__":
    if not SECRET:
        raise SystemExit("LAUNCH_SECRET is required")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
