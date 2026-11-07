import { useState } from "react";
import HeroSnake from "../game/HeroSnake";
import SpriteIcon from "../game/SpriteIcon";
import { HEROES, VILLAINS } from "../game/sprites";
import "../game/arcade.css";

export const Home = () => {
  const [screen, setScreen] = useState("arcade"); // arcade | select | game
  const [hero, setHero] = useState(HEROES[0]);

  return (
    <div className="arcade">
      <div className="scanlines" />

      {screen === "arcade" && (
        <main className="arcade-home">
          <p className="now">AHORA EN JUEGO</p>
          <h1 className="arcade-title">ARCADE</h1>
          <div className="neon-line" />
          <p className="subtitle">El Realismo Mágico · Elige tu juego</p>

          <div className="cards">
            <article className="card featured" onClick={() => setScreen("select")}>
              <header>Entregando Contratos</header>
              <div className="preview">
                <div className="preview-chain">
                  <SpriteIcon sprite={VILLAINS[3]} px={3} className="bob d3" />
                  <SpriteIcon sprite={VILLAINS[1]} px={3} className="bob d2" />
                  <SpriteIcon sprite={VILLAINS[2]} px={3} className="bob d1" />
                  <SpriteIcon sprite={HEROES[0]} px={4} className="bob hero" />
                </div>
                <div className="preview-target">
                  <SpriteIcon sprite={VILLAINS[0]} px={3} className="bob" />
                </div>
              </div>
              <p>Atrapa tus conquistas en Ciudad Magica y dales contratos antes de que entreguen las pruebas</p>
              <span className="play">PLAY ›</span>
            </article>

            <article className="card soon">
              <header>PRÓXIMAMENTE</header>
              <div className="preview empty">?</div>
              <p>Un nuevo juego llega pronto.</p>
              <span className="play off">BLOQUEADO</span>
            </article>

            <article className="card soon">
              <header>PRÓXIMAMENTE</header>
              <div className="preview empty">?</div>
              <p>Un nuevo juego llega pronto.</p>
              <span className="play off">BLOQUEADO</span>
            </article>
          </div>
        </main>
      )}

      {screen === "select" && (
        <main className="select">
          <button className="hs-btn ghost back" onClick={() => setScreen("arcade")}>‹ ARCADE</button>
          <h2 className="select-title">ELIGE TU HÉROE</h2>
          <div className="heroes">
            {HEROES.map((h) => (
              <button
                key={h.id}
                className={`hero-card ${hero.id === h.id ? "active" : ""}`}
                style={{ "--c": h.color }}
                onClick={() => setHero(h)}
                onDoubleClick={() => { setHero(h); setScreen("game"); }}
              >
                <SpriteIcon sprite={h} px={7} className="bob" />
                <b>{h.name}</b>
                <small>{h.power}</small>
              </button>
            ))}
          </div>

          <button className="hs-btn go" onClick={() => setScreen("game")}>
            ¡A LA ACCIÓN CON {hero.name.toUpperCase()}!
          </button>

          <h3 className="wanted-title">LOS MÁS BUSCADOS</h3>
          <div className="wanted">
            {VILLAINS.map((v) => (
              <div key={v.id} className="wanted-card" style={{ "--c": v.color }}>
                <span className="tag">SE BUSCA</span>
                <SpriteIcon sprite={v} px={4} />
                <b>{v.name}</b>
                <small>{v.crime}</small>
              </div>
            ))}
          </div>
        </main>
      )}

      {screen === "game" && <HeroSnake hero={hero} onExit={() => setScreen("select")} />}
    </div>
  );
};
