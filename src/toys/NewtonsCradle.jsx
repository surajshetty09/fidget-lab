import { useEffect, useRef, useState } from "react";

const BALLS = 5;
const RADIUS = 22;
const STRING_LEN = 90;
const SPACING = RADIUS * 2 + 1;

export default function NewtonsCradle() {
  const containerRef = useRef(null);
  const [angles, setAngles] = useState(Array(BALLS).fill(0));
  const velRef = useRef(Array(BALLS).fill(0));
  const dragRef = useRef({ active: false, idx: -1, startX: 0 });
  const rafRef = useRef();

  useEffect(() => {
    let last = performance.now();
    const loop = (ts) => {
      const dt = Math.min((ts - last) / 1000, 0.03);
      last = ts;

      setAngles(prev => {
        const newAngles = [...prev];
        const vels = velRef.current;

        for (let i = 0; i < BALLS; i++) {
          if (dragRef.current.active && dragRef.current.idx === i) continue;
          // Pendulum physics
          const gravity = -25 * Math.sin(newAngles[i]);
          vels[i] += gravity * dt;
          vels[i] *= 0.998;  // tiny damping
          newAngles[i] += vels[i] * dt;
        }

        // Collision transfer — Newton's cradle effect
        for (let i = 0; i < BALLS - 1; i++) {
          const a = newAngles[i], b = newAngles[i + 1];
          // Balls collide when the right-moving left ball meets the left-moving (or stationary) right one
          if (a > 0.02 && b < 0.02 && vels[i] > 0 && vels[i] > vels[i + 1]) {
            // Transfer velocity
            const temp = vels[i];
            vels[i] = vels[i + 1];
            vels[i + 1] = temp * 0.96;  // small energy loss
            newAngles[i] = 0;
          }
          if (a < -0.02 && b > 0.02 && vels[i + 1] < 0 && vels[i + 1] < vels[i]) {
            const temp = vels[i + 1];
            vels[i + 1] = vels[i];
            vels[i] = temp * 0.96;
            newAngles[i + 1] = 0;
          }
        }
        return newAngles;
      });

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handlePointerDown = (e, i) => {
    e.preventDefault();
    dragRef.current = { active: true, idx: i, startX: e.clientX };
    velRef.current[i] = 0;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const newAngle = Math.max(-1.2, Math.min(1.2, dx / 80));
    setAngles(prev => {
      const a = [...prev];
      a[dragRef.current.idx] = newAngle;
      return a;
    });
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
    dragRef.current.idx = -1;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  const reset = () => {
    setAngles(Array(BALLS).fill(0));
    velRef.current = Array(BALLS).fill(0);
  };

  // SVG: bar at top, balls hanging from strings
  const width = SPACING * BALLS + 60;
  const height = 180;
  const cy0 = 30;
  const baseY = cy0 + STRING_LEN;

  return (
    <div className="toy" ref={containerRef}>
      <svg viewBox={`0 0 ${width} ${height}`} className="toy-svg" preserveAspectRatio="xMidYMid meet">
        {/* Top bar */}
        <line x1={20} y1={cy0} x2={width - 20} y2={cy0} stroke="#111" strokeWidth="3" strokeLinecap="square" />
        {/* Balls + strings */}
        {angles.map((angle, i) => {
          const anchorX = 30 + i * SPACING + RADIUS;
          const ballX = anchorX + Math.sin(angle) * STRING_LEN;
          const ballY = cy0 + Math.cos(angle) * STRING_LEN;
          return (
            <g key={i}>
              <line x1={anchorX} y1={cy0} x2={ballX} y2={ballY} stroke="#333" strokeWidth="1.5" />
              <circle
                cx={ballX} cy={ballY} r={RADIUS}
                fill="#E4E4DA"
                stroke="#111" strokeWidth="2.5"
                onPointerDown={(e) => handlePointerDown(e, i)}
                style={{ cursor: "grab", touchAction: "none" }}
              />
              {/* Highlight */}
              <circle cx={ballX - RADIUS * 0.3} cy={ballY - RADIUS * 0.3} r={RADIUS * 0.25}
                fill="rgba(255,255,255,0.55)" pointerEvents="none" />
            </g>
          );
        })}
      </svg>
      <button className="toy-reset" onClick={reset}>RESET</button>
    </div>
  );
}
