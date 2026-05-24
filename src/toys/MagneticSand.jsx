import { useEffect, useRef, useState } from "react";

const W = 320, H = 220;
const PARTICLE_COUNT = 600;

export default function MagneticSand() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -100, y: -100, down: false });
  const rafRef = useRef();
  const [hue, setHue] = useState(0);

  useEffect(() => {
    // Initialize particles in a uniform grid with slight randomness
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: 0, vy: 0,
      hue: Math.random() * 360,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = W; canvas.height = H;

    const loop = () => {
      // Trail effect — fade previous frame slightly
      ctx.fillStyle = "rgba(250,250,245,0.18)";
      ctx.fillRect(0, 0, W, H);

      const mouse = mouseRef.current;

      for (const p of particlesRef.current) {
        // Attract toward mouse if down, repel if up
        if (mouse.x > -50) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist2 = dx * dx + dy * dy + 5;
          const dist = Math.sqrt(dist2);
          const force = mouse.down ? 60 / dist2 : -20 / dist2;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Damping
        p.vx *= 0.94;
        p.vy *= 0.94;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        // Draw particle
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const alpha = Math.min(1, 0.4 + speed * 0.3);
        ctx.fillStyle = `hsla(${(p.hue + hue) % 360},75%,55%,${alpha})`;
        ctx.fillRect(p.x, p.y, 2, 2);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [hue]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    };
  };

  const onMove = (e) => {
    const { x, y } = getPos(e);
    mouseRef.current.x = x;
    mouseRef.current.y = y;
  };
  const onDown = (e) => { e.preventDefault(); mouseRef.current.down = true; onMove(e); };
  const onUp = () => { mouseRef.current.down = false; };
  const onLeave = () => { mouseRef.current.x = -100; mouseRef.current.y = -100; mouseRef.current.down = false; };

  const reset = () => {
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: 0, vy: 0,
      hue: Math.random() * 360,
    }));
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#FAFAF5";
    ctx.fillRect(0, 0, W, H);
  };

  return (
    <div className="toy">
      <canvas ref={canvasRef} className="toy-canvas"
        onPointerMove={onMove}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerLeave={onLeave}
        style={{ cursor: "crosshair", touchAction: "none" }}
      />
      <div className="toy-controls">
        <div className="ctrl-row">
          <button className="mini-btn" onClick={() => setHue(h => (h + 60) % 360)}>SHIFT HUE</button>
          <button className="toy-reset" onClick={reset}>RESET</button>
        </div>
      </div>
    </div>
  );
}
