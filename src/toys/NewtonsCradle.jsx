import { useEffect, useRef, useState } from "react";

const BALLS = 5;
const RADIUS = 22;
const STRING_LEN = 100;
const SPACING = RADIUS * 2 + 4;   // small gap between resting balls
const MAX_ANGLE = 1.0;             // ~57°
const GRAVITY = 30;
const DAMPING = 0.9985;
const COLLISION_EFFICIENCY = 0.985; // small loss per transfer

export default function NewtonsCradle() {
  const [angles, setAngles] = useState(Array(BALLS).fill(0));
  const angleRef = useRef(Array(BALLS).fill(0));
  const velRef = useRef(Array(BALLS).fill(0));
  const dragRef = useRef({ active: false, idx: -1, anchorX: 0 });
  const rafRef = useRef();
  const svgRef = useRef(null);

  useEffect(() => {
    let last = performance.now();

    const loop = (ts) => {
      const dt = Math.min((ts - last) / 1000, 0.025);
      last = ts;

      const angles = angleRef.current;
      const vels = velRef.current;

      // Integrate pendulum motion for each ball (except the one being dragged)
      for (let i = 0; i < BALLS; i++) {
        if (dragRef.current.active && dragRef.current.idx === i) continue;
        const acc = -GRAVITY * Math.sin(angles[i]);
        vels[i] += acc * dt;
        vels[i] *= DAMPING;
        angles[i] += vels[i] * dt;
      }

      // Resolve ball-ball collisions left-to-right and right-to-left
      // Two adjacent balls "touch" when angle_left >= 0 AND angle_right <= 0
      // AND they are moving toward each other.
      for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < BALLS - 1; i++) {
          const aL = angles[i];
          const aR = angles[i + 1];
          // Both near resting AND closing the gap
          const inContact = aL >= -0.01 && aR <= 0.01;
          const approaching = vels[i] > vels[i + 1];
          if (inContact && approaching) {
            // Equal-mass elastic collision: swap velocities
            const tmp = vels[i];
            vels[i] = vels[i + 1] * COLLISION_EFFICIENCY;
            vels[i + 1] = tmp * COLLISION_EFFICIENCY;
            // Snap to rest position so they stop overlapping in render
            if (Math.abs(angles[i]) < 0.02) angles[i] = 0;
            if (Math.abs(angles[i + 1]) < 0.02) angles[i + 1] = 0;
          }
        }
      }

      // Hard constraint: balls in the resting cluster cannot pass through each other.
      // If two adjacent balls are both at rest (or near it), clamp angles to 0.
      for (let i = 0; i < BALLS; i++) {
        if (Math.abs(vels[i]) < 0.05 && Math.abs(angles[i]) < 0.03) {
          angles[i] = 0;
          vels[i] = 0;
        }
      }

      // For balls in the middle of the cradle, if neighbors are at rest,
      // and this ball wants to swing inward, the rest balls absorb it.
      // (Already handled by collision swap, but let's also constrain
      //  the angles so neighbors at rest block a middle ball.)
      for (let i = 1; i < BALLS - 1; i++) {
        // Left neighbor at rest blocks negative (leftward) angle
        if (angles[i - 1] === 0 && angles[i] < 0) {
          angles[i] = 0;
          if (vels[i] < 0) vels[i] = 0;
        }
        // Right neighbor at rest blocks positive (rightward) angle
        if (angles[i + 1] === 0 && angles[i] > 0) {
          angles[i] = 0;
          if (vels[i] > 0) vels[i] = 0;
        }
      }

      setAngles([...angles]);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handlePointerDown = (e, i) => {
    e.preventDefault();
    if (!svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
    const anchorX = 30 + i * SPACING + RADIUS;
    dragRef.current = { active: true, idx: i, anchorX };
    velRef.current[i] = 0;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.active || !svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
    const i = dragRef.current.idx;
    const dx = svgP.x - dragRef.current.anchorX;
    const dy = Math.max(20, svgP.y - 30); // anchor at y=30
    let newAngle = Math.atan2(dx, dy);

    // Constrain: only the outer balls can swing outward (typical cradle behavior).
    // Left ball: can only swing left (negative). Right ball: only positive.
    // Middle balls: very limited swing.
    if (i === 0) newAngle = Math.max(-MAX_ANGLE, Math.min(0, newAngle));
    else if (i === BALLS - 1) newAngle = Math.max(0, Math.min(MAX_ANGLE, newAngle));
    else {
      // Middle balls: if left neighbor at rest, can't go negative; if right at rest, can't go positive
      if (angleRef.current[i - 1] === 0) newAngle = Math.max(0, newAngle);
      if (angleRef.current[i + 1] === 0) newAngle = Math.min(0, newAngle);
      newAngle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, newAngle));
    }

    angleRef.current[i] = newAngle;
    setAngles([...angleRef.current]);
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
    dragRef.current.idx = -1;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  const reset = () => {
    angleRef.current = Array(BALLS).fill(0);
    velRef.current = Array(BALLS).fill(0);
    setAngles(Array(BALLS).fill(0));
  };

  const width = SPACING * BALLS + 60;
  const height = 200;
  const cy0 = 30;

  return (
    <div className="toy">
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="toy-svg" preserveAspectRatio="xMidYMid meet">
        {/* Top bar */}
        <line x1={20} y1={cy0} x2={width - 20} y2={cy0} stroke="#111" strokeWidth="3" strokeLinecap="square" />
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
