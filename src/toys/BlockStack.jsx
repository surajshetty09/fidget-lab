import { useEffect, useRef, useState } from "react";

const COLORS = ["#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#5AC8FA", "#AF52DE"];

export default function BlockStack() {
  const containerRef = useRef(null);
  const [blocks, setBlocks] = useState([]);
  const [score, setScore] = useState(0);
  const [dragging, setDragging] = useState(null);
  const [previewX, setPreviewX] = useState(150);
  const W = 320, H = 220;
  const FLOOR_Y = H - 12;

  useEffect(() => {
    if (blocks.length === 0) {
      setBlocks([{ x: 110, y: FLOOR_Y - 18, w: 100, h: 18, color: COLORS[0] }]);
    }
  }, []);

  const startDrag = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    setPreviewX(Math.max(20, Math.min(W - 60, x - 30)));
    setDragging(true);
  };

  const moveDrag = (e) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    setPreviewX(Math.max(20, Math.min(W - 60, x - 30)));
  };

  const releaseDrag = () => {
    if (!dragging) return;
    setDragging(false);

    // Drop block onto stack
    const blockW = 60;
    const blockH = 18;
    const dropX = previewX;
    const color = COLORS[blocks.length % COLORS.length];

    setBlocks(prev => {
      // Find what the block lands on (top block or floor)
      const top = prev[prev.length - 1];
      let landY;
      let overlap = false;
      if (top) {
        // Check horizontal overlap
        const blockRight = dropX + blockW;
        const blockLeft = dropX;
        const topRight = top.x + top.w;
        const topLeft = top.x;
        overlap = !(blockRight < topLeft + 8 || blockLeft > topRight - 8);
      }

      if (top && overlap) {
        landY = top.y - blockH;
        setScore(s => s + 10);
      } else {
        // Tower falls!
        landY = FLOOR_Y - blockH;
        // Show a fall — but for simplicity, reset stack
        setTimeout(() => {
          setBlocks([{ x: 110, y: FLOOR_Y - 18, w: 100, h: 18, color: COLORS[0] }]);
          setScore(0);
        }, 600);
      }

      return [...prev, { x: dropX, y: landY, w: blockW, h: blockH, color, falling: overlap ? false : true }];
    });
  };

  return (
    <div
      className="toy"
      ref={containerRef}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={releaseDrag}
      onPointerLeave={releaseDrag}
      style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="toy-svg" preserveAspectRatio="xMidYMid meet">
        {/* Floor */}
        <rect x="0" y={FLOOR_Y} width={W} height="12" fill="#111" />
        {/* Score */}
        <text x="10" y="20" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#111" fontWeight="700">
          {score} pts
        </text>
        <text x={W - 10} y="20" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#666" textAnchor="end">
          tap to drop
        </text>

        {/* Preview block (if dragging) */}
        {dragging && (
          <g opacity="0.5">
            <rect x={previewX} y="40" width="60" height="18" fill={COLORS[blocks.length % COLORS.length]} stroke="#111" strokeWidth="2" />
            <line x1={previewX + 30} y1="58" x2={previewX + 30} y2={FLOOR_Y - 4} stroke="#111" strokeWidth="1" strokeDasharray="2 4" />
          </g>
        )}

        {/* Stack */}
        {blocks.map((b, i) => (
          <g key={i} className={b.falling ? "block-fall" : ""}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h}
              fill={b.color} stroke="#111" strokeWidth="2" />
          </g>
        ))}
      </svg>
    </div>
  );
}
