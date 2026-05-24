import { useEffect, useRef, useState } from "react";

const STRINGS = [
  { freq: 261.63, color: "#FF3B30", note: "C" },
  { freq: 293.66, color: "#FF9500", note: "D" },
  { freq: 329.63, color: "#FFCC00", note: "E" },
  { freq: 392.00, color: "#34C759", note: "G" },
  { freq: 440.00, color: "#5AC8FA", note: "A" },
  { freq: 523.25, color: "#AF52DE", note: "C5" },
];

let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function pluck(freq, ctx) {
  const c = ctx || getCtx();
  if (c.state === "suspended") c.resume();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.18, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.2);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 1.2);
}

export default function PluckString() {
  const svgRef = useRef(null);
  const [strings, setStrings] = useState(
    STRINGS.map(s => ({ ...s, pull: 0, vel: 0, dragging: false }))
  );
  const rafRef = useRef();
  const dragRef = useRef({ idx: -1, active: false });

  useEffect(() => {
    let last = performance.now();
    const loop = (ts) => {
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      setStrings(prev => prev.map(s => {
        if (s.dragging) return s;
        // Spring physics — return to center
        const force = -s.pull * 50;
        const newVel = (s.vel + force * dt) * 0.94;
        const newPull = s.pull + newVel * dt;
        return { ...s, vel: newVel, pull: newPull };
      }));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const onDown = (e, i) => {
    e.preventDefault();
    dragRef.current = { idx: i, active: true };
    setStrings(prev => prev.map((s, idx) => idx === i ? { ...s, dragging: true, vel: 0 } : s));
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const onMove = (e) => {
    if (!dragRef.current.active || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const i = dragRef.current.idx;
    const stringCx = ((i + 1) / (STRINGS.length + 1)) * rect.width;
    const pullX = e.clientX - rect.left - stringCx;
    const norm = Math.max(-40, Math.min(40, pullX));
    setStrings(prev => prev.map((s, idx) => idx === i ? { ...s, pull: norm } : s));
  };

  const onUp = () => {
    if (!dragRef.current.active) return;
    const i = dragRef.current.idx;
    setStrings(prev => prev.map((s, idx) => {
      if (idx !== i) return s;
      const amp = Math.abs(s.pull);
      if (amp > 5) pluck(s.freq);
      return { ...s, dragging: false, vel: -s.pull * 4 };
    }));
    dragRef.current = { idx: -1, active: false };
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  };

  const width = 300;
  const height = 180;
  const topY = 22;
  const botY = height - 22;

  return (
    <div className="toy">
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="toy-svg" preserveAspectRatio="xMidYMid meet">
        {/* Top + bottom rails */}
        <rect x="0" y={topY - 8} width={width} height="8" fill="#111" />
        <rect x="0" y={botY} width={width} height="8" fill="#111" />
        {strings.map((s, i) => {
          const cx = ((i + 1) / (STRINGS.length + 1)) * width;
          const midX = cx + s.pull;
          const midY = (topY + botY) / 2;
          return (
            <g key={i}>
              <path
                d={`M${cx},${topY} Q${midX},${midY} ${cx},${botY}`}
                stroke={s.color} strokeWidth="2.5" fill="none"
                strokeLinecap="round"
              />
              {/* Wider invisible hit target */}
              <path
                d={`M${cx},${topY} Q${midX},${midY} ${cx},${botY}`}
                stroke="transparent" strokeWidth="20" fill="none"
                onPointerDown={(e) => onDown(e, i)}
                style={{ cursor: "grab", touchAction: "none" }}
              />
              <text x={cx} y={height - 4} fontSize="9" fontFamily="JetBrains Mono, monospace"
                textAnchor="middle" fill="#666">{s.note}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
