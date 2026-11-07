import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { VILLAINS, ITEMS, getSpriteCanvas } from "./sprites";
import { sfx, setMuted } from "./sound";

// ---------------- Configuración del tablero ----------------
const COLS = 16;
const ROWS = 16;
const CELL = 36; // tamaño de cada casilla (px lógicos)
const SIZE = COLS * CELL;
const PX = 3; // tamaño de cada "pixel" del sprite (12x13 -> 36x39)
const START_STEP = 230; // ms por movimiento al inicio (más alto = más lento)
const MIN_STEP = 110; // velocidad máxima (más alto = tope más lento)
const SPEED_UP = 2; // ms que acelera por cada villano atrapado
const BURSTS = [
  "¡SABROSO!", 
  "¡ACUERDO NACIONAL!", 
  "¡DECRETO!", 
  "¡DEMOCRATÍCESE!", 
  "¡CAMBIO!", 
  "¡CONSTITUYENTE!", 
  "¡GOLPE BLANDO!",
  "¡JUSTICIA SOCIAL!"
];
const BEST_KEY = "ligaNeonBest";

const DIRS = {
  ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
};

const rand = (n) => Math.floor(Math.random() * n);

function newGame() {
  const y = Math.floor(ROWS / 2);
  return {
    snake: [{ x: 5, y }, { x: 4, y }, { x: 3, y }],
    prev: null,
    segs: [{ kind: "orb" }, { kind: "orb" }], // cola inicial: estela de energía
    dir: { x: 1, y: 0 },
    queue: [],
    step: START_STEP,
    acc: 0,
    time: 0,
    facing: 1,
    target: null,
    items: [],
    particles: [],
    texts: [],
    shake: 0,
    flash: 0,
    starUntil: 0,
    captured: 0,
    points: 0,
    combo: 1,
    lastCatchT: -99999,
    alive: true,
    reason: "",
  };
}

function occupied(g, x, y) {
  return (
    g.snake.some((s) => s.x === x && s.y === y) ||
    g.items.some((i) => i.x === x && i.y === y) ||
    (g.target && g.target.x === x && g.target.y === y)
  );
}

function freeCell(g) {
  const head = g.snake[0];
  for (let tries = 0; tries < 500; tries++) {
    const x = rand(COLS);
    const y = rand(ROWS);
    const nearHead = Math.abs(x - head.x) + Math.abs(y - head.y) < 3;
    if (!occupied(g, x, y) && !nearHead) return { x, y };
  }
  return { x: 0, y: 0 };
}

function placeTarget(g) {
  g.target = null;
  const c = freeCell(g);
  g.target = { ...c, v: rand(VILLAINS.length), born: g.time };
}

function burst(g, cx, cy, color, n = 18) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 0.08 + Math.random() * 0.22;
    g.particles.push({
      x: cx, y: cy,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      life: 0, max: 450 + Math.random() * 400,
      color: Math.random() < 0.35 ? "#ffffff" : color,
      size: 2 + rand(4),
    });
  }
}

function popText(g, cx, cy, text, color = "#ffe14a", big = true) {
  g.texts.push({ x: cx, y: cy, text, color, life: 0, max: 900, big });
}

const center = (c) => c * CELL + CELL / 2;

export default function HeroSnake({ hero, onExit }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(newGame());
  const phaseRef = useRef("ready");
  const [phase, setPhaseState] = useState("ready"); // ready | playing | paused | over
  const [hud, setHud] = useState({ captured: 0, points: 0, combo: 1, star: false });
  const [last, setLast] = useState(null);
  const [reason, setReason] = useState("");
  const [best, setBest] = useState(() => {
    try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; }
  });
  const [muted, setMutedState] = useState(false);
  const bestRef = useRef(best);

  const setPhase = (p) => { phaseRef.current = p; setPhaseState(p); };

  const syncHud = (g) =>
    setHud({ captured: g.captured, points: g.points, combo: g.combo, star: g.time < g.starUntil });

  // -------- acciones públicas (botones, teclado, swipe) --------
  const start = () => {
    gameRef.current = newGame();
    placeTarget(gameRef.current);
    syncHud(gameRef.current);
    setLast(null);
    setPhase("playing");
    sfx.start();
  };

  const pushDir = (d) => {
    const g = gameRef.current;
    if (phaseRef.current === "ready" || phaseRef.current === "over") start();
    if (phaseRef.current !== "playing") return;
    const lastDir = g.queue.length ? g.queue[g.queue.length - 1] : g.dir;
    if ((d.x === lastDir.x && d.y === lastDir.y) || (d.x === -lastDir.x && d.y === -lastDir.y)) return;
    if (g.queue.length < 3) { g.queue.push(d); sfx.turn(); }
  };

  const togglePause = () => {
    if (phaseRef.current === "playing") setPhase("paused");
    else if (phaseRef.current === "paused") setPhase("playing");
  };

  const toggleMute = () => setMutedState((m) => { setMuted(!m); return !m; });

  // ---------------------- Motor del juego ----------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    placeTarget(gameRef.current);

    const die = (g, why) => {
      g.alive = false;
      g.reason = why;
      g.shake = 16;
      g.flash = 1;
      const h = g.snake[0];
      burst(g, center(h.x), center(h.y), hero.color, 40);
      sfx.die();
      setReason(why);
      if (g.points > bestRef.current) {
        bestRef.current = g.points;
        setBest(g.points);
        try { localStorage.setItem(BEST_KEY, String(g.points)); } catch { /* sin storage */ }
      }
      setPhase("over");
    };

    const tick = (g) => {
      if (g.queue.length) g.dir = g.queue.shift();
      if (g.dir.x) g.facing = g.dir.x;

      const star = g.time < g.starUntil;
      const head = g.snake[0];
      let nx = head.x + g.dir.x;
      let ny = head.y + g.dir.y;

      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) {
        if (!star) return die(g, "¡Te estrellaste contra un edificio!");
        nx = (nx + COLS) % COLS;
        ny = (ny + ROWS) % ROWS;
      }

      const grows = g.target && g.target.x === nx && g.target.y === ny;
      const body = grows ? g.snake : g.snake.slice(0, -1);
      if (!star && body.some((s) => s.x === nx && s.y === ny))
        return die(g, "¡Te enredaste con tus propios prisioneros!");

      // objetos en el tablero
      const idx = g.items.findIndex((i) => i.x === nx && i.y === ny);
      if (idx >= 0) {
        const it = g.items[idx];
        g.items.splice(idx, 1);
        const cx = center(nx), cy = center(ny);
        if (it.type === "bomb") {
          if (!star) return die(g, "¡Caíste en una trampa del villano!");
          g.points += 50;
          burst(g, cx, cy, "#ff9d1f", 24);
          popText(g, cx, cy, "¡DESACTIVADA! +50", "#ff9d1f");
          sfx.defuse();
        } else if (it.type === "star") {
          g.starUntil = g.time + 6500;
          burst(g, cx, cy, "#ffe14a", 30);
          popText(g, cx, cy, "¡INVENCIBLE!", "#ffe14a");
          sfx.power();
        } else if (it.type === "medal") {
          g.points += 100;
          burst(g, cx, cy, "#3aa0ff", 24);
          popText(g, cx, cy, "¡MEDALLA! +100", "#7fe9ff");
          sfx.bonus();
        }
        syncHud(g);
      }

      g.prev = g.snake.map((s) => ({ ...s }));
      g.snake.unshift({ x: nx, y: ny });

      if (grows) {
        const v = VILLAINS[g.target.v];
        g.segs.push({ kind: "villain", v: g.target.v });
        g.combo = g.time - g.lastCatchT < 3500 ? Math.min(g.combo + 1, 5) : 1;
        g.lastCatchT = g.time;
        const pts = 10 * g.combo;
        g.points += pts;
        g.captured += 1;
        g.step = Math.max(MIN_STEP, START_STEP - g.captured * SPEED_UP);
        const cx = center(nx), cy = center(ny);
        burst(g, cx, cy, v.color, 22);
        popText(g, cx, cy - 10, BURSTS[rand(BURSTS.length)], "#ffe14a");
        popText(g, cx, cy + 14, `+${pts}${g.combo > 1 ? `  x${g.combo}` : ""}`, "#ffffff", false);
        g.shake = 5;
        sfx.capture(g.combo);
        setLast(v);
        placeTarget(g);

        // aparecen objetos especiales
        if (g.captured % 5 === 0) g.items.push({ type: "star", ...freeCell(g), born: g.time, ttl: 7000 });
        if (g.captured % 7 === 0) g.items.push({ type: "medal", ...freeCell(g), born: g.time, ttl: 6000 });
        const bombs = g.items.filter((i) => i.type === "bomb").length;
        if (g.captured >= 6 && g.captured % 3 === 0 && bombs < 4)
          g.items.push({ type: "bomb", ...freeCell(g), born: g.time, ttl: 12000 });
        syncHud(g);
      } else {
        g.snake.pop();
      }
    };

    // ---------------------- Dibujo ----------------------
    const drawBoard = (t) => {
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          ctx.fillStyle = (x + y) % 2 ? "#2a1a5e" : "#33216e";
          ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        }
      }
      // ventanitas de edificios que titilan
      for (let i = 0; i < 26; i++) {
        const x = (i * 97) % SIZE;
        const y = (i * 211) % SIZE;
        const on = Math.sin(t / 700 + i) > 0.6;
        ctx.fillStyle = on ? "rgba(255,225,74,0.18)" : "rgba(127,233,255,0.06)";
        ctx.fillRect(x, y, 4, 4);
      }
    };

    const drawSprite = (sprite, cx, cy, opts = {}) => {
      const img = getSpriteCanvas(sprite, PX, opts.flip);
      const s = opts.scale || 1;
      const w = img.width * s, h = img.height * s;
      ctx.globalAlpha = opts.alpha ?? 1;
      ctx.drawImage(img, Math.round(cx - w / 2), Math.round(cy - h / 2 + (opts.dy || 0)), w, h);
      ctx.globalAlpha = 1;
    };

    const glow = (cx, cy, r, color, a = 0.5) => {
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grd.addColorStop(0, color);
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = a;
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const draw = (g, t, alpha) => {
      ctx.save();
      if (g.shake > 0.3) ctx.translate((Math.random() - 0.5) * g.shake, (Math.random() - 0.5) * g.shake);
      drawBoard(t);

      // objetos
      g.items.forEach((it) => {
        const cx = center(it.x), cy = center(it.y);
        const left = it.ttl - (g.time - it.born);
        if (left < 1800 && Math.floor(t / 120) % 2) return; // parpadea antes de desaparecer
        const colors = { star: "#ffe14a", medal: "#3aa0ff", bomb: "#ff3b5c" };
        glow(cx, cy, 20 + Math.sin(t / 150) * 3, colors[it.type], 0.55);
        drawSprite(ITEMS[it.type], cx, cy, { dy: Math.sin(t / 200 + it.x) * 2 });
      });

      // villano objetivo
      if (g.target) {
        const v = VILLAINS[g.target.v];
        const cx = center(g.target.x), cy = center(g.target.y);
        const pulse = 22 + Math.sin(t / 140) * 4;
        glow(cx, cy, pulse + 6, v.color, 0.6);
        ctx.strokeStyle = "#ffe14a";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.lineDashOffset = -t / 40;
        ctx.beginPath();
        ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        const born = Math.min(1, (g.time - g.target.born) / 200);
        drawSprite(v, cx, cy, { dy: Math.sin(t / 180) * 2, scale: 0.6 + 0.4 * born });
      }

      // posiciones interpoladas (movimiento suave)
      const pos = g.snake.map((s, i) => {
        const p = g.prev && g.prev[i] ? g.prev[i] : s;
        const jump = Math.abs(p.x - s.x) > 1 || Math.abs(p.y - s.y) > 1;
        const k = jump ? 1 : alpha;
        return { x: center(p.x + (s.x - p.x) * k), y: center(p.y + (s.y - p.y) * k) };
      });

      // cuerda de energía que une a los prisioneros
      const star = g.time < g.starUntil;
      ctx.save();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.shadowBlur = 12;
      ctx.shadowColor = star ? `hsl(${(t / 4) % 360},100%,60%)` : hero.color;
      ctx.strokeStyle = star ? `hsl(${(t / 4) % 360},100%,65%)` : hero.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      pos.forEach((p, i) => {
        if (i && Math.abs(p.x - pos[i - 1].x) + Math.abs(p.y - pos[i - 1].y) > CELL * 1.5) ctx.moveTo(p.x, p.y);
        else if (i) ctx.lineTo(p.x, p.y);
        else ctx.moveTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.restore();

      // cola (de atrás hacia adelante)
      for (let i = pos.length - 1; i >= 1; i--) {
        const seg = g.segs[i - 1];
        const p = pos[i];
        const bob = Math.sin(t / 160 + i * 0.8) * 1.5;
        if (!seg || seg.kind === "orb") {
          glow(p.x, p.y, 18, hero.color, 0.7);
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(p.x, p.y + bob, 7, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const v = VILLAINS[seg.v];
          // esposas de energía
          ctx.strokeStyle = "#ffe14a";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y + 16, 13, 4, 0, 0, Math.PI * 2);
          ctx.stroke();
          drawSprite(v, p.x, p.y, { dy: bob, flip: g.facing < 0, alpha: 0.95 });
        }
      }

      // héroe (cabeza)
      if (g.alive || Math.floor(t / 100) % 2) {
        const h = pos[0];
        if (star) {
          glow(h.x, h.y, 32, `hsl(${(t / 3) % 360},100%,60%)`, 0.9);
        } else {
          glow(h.x, h.y, 26, hero.color, 0.55);
        }
        drawSprite(hero, h.x, h.y, { flip: g.facing < 0, scale: 1.08, dy: Math.sin(t / 120) * 1 });
      }

      // partículas
      g.particles.forEach((p) => {
        ctx.globalAlpha = 1 - p.life / p.max;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      ctx.globalAlpha = 1;

      // textos de cómic
      g.texts.forEach((tx) => {
        const k = tx.life / tx.max;
        const scale = tx.big ? (k < 0.15 ? k / 0.15 : 1) * 1.1 : 1;
        ctx.save();
        ctx.translate(tx.x, tx.y - k * 26);
        ctx.scale(scale, scale);
        ctx.globalAlpha = 1 - Math.max(0, (k - 0.6) / 0.4);
        ctx.font = `${tx.big ? 14 : 10}px "Press Start 2P", monospace`;
        ctx.textAlign = "center";
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#140c2b";
        ctx.strokeText(tx.text, 0, 0);
        ctx.fillStyle = tx.color;
        ctx.fillText(tx.text, 0, 0);
        ctx.restore();
      });

      // destello al perder
      if (g.flash > 0.02) {
        ctx.fillStyle = `rgba(255,59,92,${g.flash * 0.45})`;
        ctx.fillRect(0, 0, SIZE, SIZE);
      }
      ctx.restore();
    };

    // ---------------------- Bucle ----------------------
    let raf;
    let lastT = performance.now();
    let hudStar = false;
    const loop = (now) => {
      const dt = Math.min(50, now - lastT);
      lastT = now;
      const g = gameRef.current;
      const playing = phaseRef.current === "playing" && g.alive;

      if (playing) {
        g.time += dt;
        g.acc += dt;
        while (g.acc >= g.step && g.alive) {
          g.acc -= g.step;
          tick(g);
        }
        const before = g.items.length;
        g.items = g.items.filter((i) => g.time - i.born < i.ttl);
        const starNow = g.time < g.starUntil;
        if (before !== g.items.length || starNow !== hudStar) { hudStar = starNow; syncHud(g); }
        if (g.combo > 1 && g.time - g.lastCatchT > 3500) { g.combo = 1; syncHud(g); }
      }

      g.particles.forEach((p) => {
        p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.0004 * dt;
      });
      g.particles = g.particles.filter((p) => p.life < p.max);
      g.texts.forEach((tx) => { tx.life += dt; });
      g.texts = g.texts.filter((tx) => tx.life < tx.max);
      g.shake *= 0.88;
      g.flash *= 0.92;

      draw(g, now, playing ? Math.min(1, g.acc / g.step) : 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [hero]);

  // ---------------------- Teclado ----------------------
  useEffect(() => {
    const onKey = (e) => {
      if (DIRS[e.key]) { e.preventDefault(); pushDir(DIRS[e.key]); return; }
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (phaseRef.current === "ready" || phaseRef.current === "over") start();
        else togglePause();
      }
      if (e.key === "p" || e.key === "P") togglePause();
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ---------------------- Swipe (celular) ----------------------
  const touch = useRef(null);
  const onTouchStart = (e) => {
    // si el toque es en un botón (Jugar otra vez, Cambiar héroe), no lo usa el tablero
    if (e.target.closest("button")) { touch.current = null; return; }
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    if (!touch.current || e.target.closest("button")) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) {
      // un toque simple solo inicia en la pantalla de inicio, no en Game Over
      if (phaseRef.current === "ready") start();
      return;
    }
    if (phaseRef.current === "over") return; // en Game Over solo funcionan los botones
    if (Math.abs(dx) > Math.abs(dy)) pushDir({ x: Math.sign(dx), y: 0 });
    else pushDir({ x: 0, y: Math.sign(dy) });
  };

  // los botones de la cruceta responden apenas tocas, sin esperar el click
  const press = (fn) => (e) => {
    e.preventDefault();
    if (navigator.vibrate) navigator.vibrate(10);
    fn();
  };

  return (
    <div className="hs-wrap">
      <div className="hs-top">
        <button className="hs-btn ghost" onClick={onExit}>‹ ARCADE</button>
        <div className="hs-title">CONQUISTA</div>
        <button className="hs-btn ghost" onClick={toggleMute} aria-label="Sonido">
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      <div className="hs-hud">
        <div className="hs-stat">
          <span>CONTRATOS</span>
          <b>{hud.captured}</b>
        </div>
        <div className="hs-stat center">
          <span>PUNTOS</span>
          <b className="pts">{hud.points}</b>
          {hud.combo > 1 && <em className="combo">COMBO x{hud.combo}</em>}
          {hud.star && <em className="starbadge">★ INVENCIBLE</em>}
        </div>
        <div className="hs-stat right">
          <span>RÉCORD</span>
          <b className="best">{best}</b>
        </div>
      </div>

      <div className="hs-board" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <canvas ref={canvasRef} style={{ width: "100%", aspectRatio: "1 / 1" }} />

        {phase === "ready" && (
          <div className="hs-overlay" onClick={start}>
            <div className="hs-panel">
              <h2>SUPER CONQUISTAS</h2>
              <p>GUÍA A {hero.name.toUpperCase()} POR el realismo magico</p>
              <p>ATRAPA A TUS CONQUISTAS: SI LO LOGRAS SE UNEN A TU GOVIERNO</p>
              <p>NO CHOQUES CON MUROS NI CON TUS CONQUISTAS</p>
              <p className="tips">★ INVENCIBLE · 🏅 +100 · 💣 TRAMPA</p>
              <p className="blink">CLICK, ESPACIO O FLECHA PARA EMPEZAR</p>
            </div>
          </div>
        )}

        {phase === "paused" && (
          <div className="hs-overlay" onClick={togglePause}>
            <div className="hs-panel">
              <h2>PAUSA</h2>
              <p className="blink">ESPACIO O P PARA SEGUIR</p>
            </div>
          </div>
        )}

        {phase === "over" && (
          <div className="hs-overlay">
            <div className="hs-panel">
              <h2 className="red">¡GAME OVER!</h2>
              <p>{reason.toUpperCase()}</p>
              <p className="big">{hud.captured} CONQUISTAS · {hud.points} PTS</p>
              {hud.points >= best && hud.points > 0 && <p className="newbest">¡NUEVO RÉCORD!</p>}
              <div className="hs-row">
                <button className="hs-btn" onClick={start}>JUGAR OTRA VEZ</button>
                <button className="hs-btn ghost" onClick={onExit}>CAMBIAR PERSONAJE</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="hs-ticker">
        {last ? (
          <>CAPTURADO: <b style={{ color: last.color }}>{last.name}</b> — {last.crime}</>
        ) : (
          <>CIUDAD NEÓN TE NECESITA, {hero.name.toUpperCase()}</>
        )}
      </div>

      {/* Control táctil para celular */}
      <div className="hs-dpad">
        <button onPointerDown={press(() => pushDir({ x: 0, y: -1 }))} className="up" aria-label="Arriba">▲</button>
        <button onPointerDown={press(() => pushDir({ x: -1, y: 0 }))} className="left" aria-label="Izquierda">◀</button>
        <button onPointerDown={press(togglePause)} className="mid" aria-label="Pausa">II</button>
        <button onPointerDown={press(() => pushDir({ x: 1, y: 0 }))} className="right" aria-label="Derecha">▶</button>
        <button onPointerDown={press(() => pushDir({ x: 0, y: 1 }))} className="down" aria-label="Abajo">▼</button>
      </div>
    </div>
  );
}

HeroSnake.propTypes = {
  hero: PropTypes.object.isRequired,
  onExit: PropTypes.func.isRequired,
};
