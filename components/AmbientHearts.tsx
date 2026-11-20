"use client";

import type { CSSProperties } from "react";
import PixelHeart from "./PixelHeart";

const HEART_COUNT = 20;
const COLORS = ["#E453A3", "#F0254B", "#FF8FC7"];

type Heart = {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  rot: number;
  opacity: number;
  color: string;
};

function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hearts are scattered freely (not snapped to a grid) once at module load with
// the seeded, SSR-safe PRNG, so their positions are random-looking yet stable —
// nothing is reassigned at runtime, which is what used to cause the jitter.
function initialHearts(): Heart[] {
  const rand = seededRandom(11);
  const placed: { x: number; y: number }[] = [];
  const MIN_GAP = 11; // percent-space spacing so they never clump
  const ASPECT = 1.25; // weight x slightly so the scatter feels even

  // Keep the middle clear for the title and its permanent hearts.
  const inTitleZone = (x: number, y: number) => {
    const dx = (x - 50) / 33;
    const dy = (y - 47) / 29;
    return dx * dx + dy * dy < 1;
  };

  const scatter = () => {
    let best = { x: 50, y: 50 };
    let bestGap = -1;
    for (let attempt = 0; attempt < 260; attempt += 1) {
      const x = 3 + rand() * 94;
      // Stop above the landing's bottom seam so bottom hearts stay visible.
      const y = 6 + rand() * 81;
      if (inTitleZone(x, y)) continue;
      const gap =
        placed.length === 0
          ? Infinity
          : Math.min(
              ...placed.map((p) => Math.hypot((p.x - x) * ASPECT, p.y - y))
            );
      if (gap > bestGap) {
        bestGap = gap;
        best = { x, y };
      }
      if (gap >= MIN_GAP) break;
    }
    placed.push(best);
    return best;
  };

  return Array.from({ length: HEART_COUNT }, () => {
    const { x, y } = scatter();
    return {
      left: x,
      top: y,
      size: 8 + rand() * 40,
      duration: 7 + rand() * 7,
      delay: -(rand() * 14),
      rot: (rand() * 2 - 1) * 20,
      opacity: 0.35 + rand() * 0.45,
      color: COLORS[Math.floor(rand() * COLORS.length)],
    };
  });
}

const HEARTS: Heart[] = initialHearts();

type HeartStyle = CSSProperties & {
  "--left": string;
  "--top": string;
  "--size": string;
  "--duration": string;
  "--delay": string;
  "--rot": string;
  "--heart-opacity": number;
  "--heart-color": string;
};

export default function AmbientHearts() {
  return (
    <div className="ambient-hearts" aria-hidden="true">
      {HEARTS.map((heart, index) => (
        <span
          key={index}
          className="ambient-heart"
          style={
            {
              "--left": `${heart.left.toFixed(2)}%`,
              "--top": `${heart.top.toFixed(2)}%`,
              "--size": `${heart.size.toFixed(2)}px`,
              "--duration": `${heart.duration.toFixed(2)}s`,
              "--delay": `${heart.delay.toFixed(2)}s`,
              "--rot": `${heart.rot.toFixed(2)}deg`,
              "--heart-opacity": heart.opacity,
              "--heart-color": heart.color,
            } as HeartStyle
          }
        >
          <PixelHeart />
        </span>
      ))}
    </div>
  );
}
