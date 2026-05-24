import { useEffect, useRef, useState } from "react";

const W = 320, H = 220;
const MARBLE_R = 8;

// Maze walls — list of rectangles
const WALLS = [
  { x: 0, y: 0, w: W, h: 4 },
  { x: 0, y: H - 4, w: W, h: 4 },
  { x: 0, y: 0, w: 4, h: H },
  { x: W - 4, y: 0, w: 4, h: H },
  // Internal walls
  { x: 50, y: 40, w: 100, h: 4 },
  { x: 150, y: 40, w: 4, h: 60 },
  { x: 200, y: 100, w: 80, h: 4 },
  { x: 60, y: 100, w: 4, h: 70 },
  { x: 60, y: 170, w: 90, h: 4 },
  { x: 200, y: 40, w: 4, h: 60 },
  { x: 110, y: 100, w: 50, h: 4 },
];

const GOAL = { x: W - 35, y: H - 30, r: 14 };
const START = { x: 20, y: 20 };

export default function MarbleMaze() {
  const svgRef = useRef(null);
  const marbleRef = useRef({ x: START.x, y: START.y, vx: 0, vy: 0 });
  const tiltRef = useRef({ x: 0, y: 0 });
  const [marble, setMarble] = useState({ x: START.x, y: START.y });
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const rafRef = useRef();

  useEffect(() => {
    let last = performance.now();
    const loop = (ts) => {
      const dt = Math.min((ts - last) / 1000, 0.04);
      last = ts;
      const m = marbleRef.current;
      const tilt = tiltRef.current;

      if (!won) {
        // Apply tilt as acceleration
        m.vx += tilt.x * 200 * dt;
        m.vy += tilt.y * 200 * dt;
        m.vx *= 0.96;
        m.vy *= 0.96;

        const newX = m.x + m.vx * dt;
        const newY = m.y + m.vy * dt;

        // Collide with walls
        let collX = false, collY = false;
        for (const wall of WALLS) {
          // Check X
          if (newX + MARBLE_R > wall.x && newX - MARBLE_R < wall.x + wall.w &&
              m.y + MARBLE_R > wall.y && m.y - MARBLE_R < wall.y + wall.h) {
            collX = true;
          }
          if (m.x + MARBLE_R > wall.x && m.x - MARBLE_R < wall.x + wall.w &&
              newY + MARBLE_R > wall.y && newY - MARBLE_R < wall.y + wall.h) {
            collY = true;
          }
        }
        if (!collX) m.x = newX; else m.vx *= -0.4;
        if (!collY) m.y = newY; else m.vy *= -0.4;

        // Goal check
        const dx = m.x - GOAL.x, dy = m.y - GOAL.y;
        if (Math.sqrt(dx * dx + dy * dy) < GOAL.r) {
          setWon(true);
        }

        setMarble({ x: m.x, y: m.y });
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [won]);

  const onMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    tiltRef.current = {
      x: Math.max(-1, Math.min(1, dx)),
      y: Math.max(-1, Math.min(1, dy))
    };
    setMoves(m => m + 1);
  };

  const onLeave = () => {
    tiltRef.current = { x: 0, y: 0 };
  };

  const reset = () => {
    marbleRef.current = { x: START.x, y: START.y, vx: 0, vy: 0 };
    setMarble({ x: START.x, y: START.y });
    setWon(false);
    setMoves(0);
  };

  return (
    <div className="toy">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="toy-svg"
        onPointerMove={onMove} onPointerLeave={onLeave}
        preserveAspectRatio="xMidYMid meet"
        style={{ touchAction: "none", cursor: "crosshair" }}>
        {/* Walls */}
        {WALLS.map((w, i) => (
          <rect key={i} x={w.x} y={w.y} width={w.w} height={w.h} fill="#111" />
        ))}
        {/* Goal */}
        <circle cx={GOAL.x} cy={GOAL.y} r={GOAL.r} fill="none" stroke="#34C759" strokeWidth="3" strokeDasharray="3 3">
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${GOAL.x} ${GOAL.y}`} to={`360 ${GOAL.x} ${GOAL.y}`} dur="6s" repeatCount="indefinite"/>
        </circle>
        <text x={GOAL.x} y={GOAL.y + 4} fontSize="14" textAnchor="middle" fill="#34C759" fontWeight="700">★</text>

        {/* Marble */}
        <circle cx={marble.x} cy={marble.y} r={MARBLE_R} fill="#FF3B30" stroke="#111" strokeWidth="2" />
        <circle cx={marble.x - 2} cy={marble.y - 2} r={MARBLE_R * 0.35} fill="rgba(255,255,255,0.7)" />

        {/* Win overlay */}
        {won && (
          <g>
            <rect x="0" y="0" width={W} height={H} fill="rgba(255,255,255,0.85)" />
            <text x={W / 2} y={H / 2 - 6} fontFamily="JetBrains Mono, monospace" fontSize="22"
              textAnchor="middle" fill="#34C759" fontWeight="700">SOLVED!</text>
            <text x={W / 2} y={H / 2 + 14} fontFamily="JetBrains Mono, monospace" fontSize="10"
              textAnchor="middle" fill="#666">click reset to play again</text>
          </g>
        )}
      </svg>
      <button className="toy-reset" onClick={reset}>{won ? "PLAY AGAIN" : "RESET"}</button>
    </div>
  );
}
