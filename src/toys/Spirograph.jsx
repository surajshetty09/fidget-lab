import { useEffect, useRef, useState } from "react";

const PRESETS = [
  { R: 60, r: 30, d: 50, label: "Rose" },
  { R: 70, r: 21, d: 30, label: "Flower" },
  { R: 80, r: 17, d: 60, label: "Star" },
  { R: 55, r: 23, d: 35, label: "Loop" },
];

export default function Spirograph() {
  const canvasRef = useRef(null);
  const [params, setParams] = useState(PRESETS[0]);
  const [color, setColor] = useState("#FF3B30");
  const [presetIdx, setPresetIdx] = useState(0);
  const rafRef = useRef();
  const tRef = useRef(0);
  const lastPointRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = 320;
    const H = canvas.height = 220;

    // Reset canvas on params change
    ctx.fillStyle = "#FAFAF5";
    ctx.fillRect(0, 0, W, H);
    tRef.current = 0;
    lastPointRef.current = null;

    const cx = W / 2, cy = H / 2;
    const { R, r, d } = params;

    const draw = () => {
      // Hypotrochoid math
      for (let step = 0; step < 6; step++) {
        const t = tRef.current;
        const x = cx + (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
        const y = cy + (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);

        if (lastPointRef.current) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        lastPointRef.current = { x, y };
        tRef.current += 0.04;
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [params, color]);

  const clear = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#FAFAF5";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    tRef.current = 0;
    lastPointRef.current = null;
  };

  const colors = ["#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#5AC8FA", "#AF52DE", "#111111"];

  return (
    <div className="toy">
      <canvas ref={canvasRef} className="toy-canvas" />
      <div className="toy-controls">
        <div className="ctrl-row">
          {PRESETS.map((p, i) => (
            <button key={i}
              className={`mini-btn${presetIdx === i ? " active" : ""}`}
              onClick={() => { setParams(p); setPresetIdx(i); }}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="ctrl-row">
          {colors.map(c => (
            <button key={c}
              className={`color-dot${color === c ? " active" : ""}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <button className="toy-reset" onClick={clear}>CLEAR</button>
      </div>
    </div>
  );
}
