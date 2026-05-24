import { useState, useEffect } from "react";
import NewtonsCradle from "./toys/NewtonsCradle.jsx";
import PluckString from "./toys/PluckString.jsx";
import Spirograph from "./toys/Spirograph.jsx";
import BlockStack from "./toys/BlockStack.jsx";
import MarbleMaze from "./toys/MarbleMaze.jsx";
import MagneticSand from "./toys/MagneticSand.jsx";
import "./App.css";

const TOYS = [
  {
    id: "cradle",
    num: "01",
    title: "Newton's Cradle",
    blurb: "Drag a ball, release, watch momentum transfer.",
    Component: NewtonsCradle,
    color: "#FF3B30",
  },
  {
    id: "strings",
    num: "02",
    title: "Plucked Strings",
    blurb: "Pull each string sideways. Release to hear it sing.",
    Component: PluckString,
    color: "#FF9500",
  },
  {
    id: "sand",
    num: "03",
    title: "Magnetic Sand",
    blurb: "Hover to repel. Click and hold to attract.",
    Component: MagneticSand,
    color: "#AF52DE",
  },
  {
    id: "spiro",
    num: "04",
    title: "Spirograph",
    blurb: "Hypotrochoid curves. Change presets and colors.",
    Component: Spirograph,
    color: "#FFCC00",
  },
  {
    id: "stack",
    num: "05",
    title: "Block Stack",
    blurb: "Tap to drop. Land it on the stack. Don't miss.",
    Component: BlockStack,
    color: "#34C759",
  },
  {
    id: "maze",
    num: "06",
    title: "Marble Maze",
    blurb: "Move your cursor to tilt. Roll the ball to the goal.",
    Component: MarbleMaze,
    color: "#5AC8FA",
  },
];

export default function App() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">
      {/* Brutalist grid header */}
      <header className="hdr">
        <div className="hdr-bar">
          <div className="hdr-left">
            <span className="hdr-mark">▣</span>
            <span className="hdr-label">FIDGET / LAB</span>
          </div>
          <div className="hdr-mid">
            <span className="hdr-meta">EST. 2026 / 06 TOYS</span>
          </div>
          <div className="hdr-right">
            <span className="hdr-time">
              {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <h1 className="hero-h1">
          A KINETIC<br/>
          <span className="hero-h1-em">PLAYGROUND</span><br/>
          FOR THE BROWSER.
        </h1>
        <div className="hero-meta">
          <div className="hero-meta-item">
            <span className="hm-label">→ Index</span>
            <span className="hm-text">Six interactive physics toys, each built from scratch.</span>
          </div>
          <div className="hero-meta-item">
            <span className="hm-label">→ Use</span>
            <span className="hm-text">Drag, pull, tap, hover. Everything responds.</span>
          </div>
          <div className="hero-meta-item">
            <span className="hm-label">→ Sound</span>
            <span className="hm-text">Strings play real notes. Use headphones.</span>
          </div>
        </div>
      </section>

      {/* Toys grid */}
      <main className="grid">
        {TOYS.map((toy) => (
          <article key={toy.id} className="toy-card" style={{ "--accent": toy.color }}>
            <header className="toy-head">
              <span className="toy-num">{toy.num}</span>
              <div className="toy-meta">
                <h2 className="toy-title">{toy.title}</h2>
                <p className="toy-blurb">{toy.blurb}</p>
              </div>
            </header>
            <div className="toy-frame">
              <toy.Component />
            </div>
            <footer className="toy-foot">
              <span className="toy-tag" style={{ background: toy.color }}>{toy.id.toUpperCase()}</span>
              <span className="toy-line">— END SAMPLE</span>
            </footer>
          </article>
        ))}
      </main>

      {/* Footer */}
      <footer className="ftr">
        <div className="ftr-grid">
          <div>
            <span className="ftr-label">FIDGET / LAB</span>
            <p className="ftr-text">Built with React. No libraries for physics — all hand-rolled.</p>
          </div>
          <div>
            <span className="ftr-label">CREDITS</span>
            <p className="ftr-text">Inspired by tactile desk toys & Swiss design.</p>
          </div>
          <div>
            <span className="ftr-label">RATIO</span>
            <p className="ftr-text">— — — — — — — — — — — —</p>
          </div>
        </div>
        <div className="ftr-copy">© FIDGET LAB / NO RIGHTS RESERVED</div>
      </footer>
    </div>
  );
}
