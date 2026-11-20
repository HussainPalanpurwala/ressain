"use client";

import type { CSSProperties } from "react";
import PixelHeart from "./PixelHeart";

const HEART_COUNT = 20;
const COLS = 6;
const ROWS = 5;
const COLORS = ["#E453A3", "#F0254B", "#FF8FC7"];

// One heart per cell. Keep the whole central band clear (rows 1–4, cols 2–3)
// so nothing forms directly beneath the permanent hearts around the title, and
// also leave the cells flanking the title (cols 1 & 4 at the middle row) empty
// so fading hearts never sit right beside the permanent ones. 20 cells remain
// for the 20 hearts.
const CELLS = Array.from({ length: COLS * ROWS }, (_, index) => index).filter(
  (index) => {
    const col = index % COLS;
    const row = Math.floor(index / COLS);
    const centralBand = col >= 2 && col <= 3 && row >= 1 && row <= 4;
    const flankingTitle = (col === 1 || col === 4) && row === 2;
    return !centralBand && !flankingTitle;
  }
);

type Heart = {
  cell: number;
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

function cellPosition(cell: number, rand: () => number) {
  const col = cell % COLS;
  const row = Math.floor(cell / COLS);
  return {
    left: ((col + 0.2 + rand() * 0.6) / COLS) * 100,
    top: ((row + 0.2 + rand() * 0.6) / ROWS) * 100,
  };
}

function makeHeart(cell: number, rand: () => number, fresh: boolean): Heart {
  return {
    cell,
    ...cellPosition(cell, rand),
    size: 8 + rand() * 40,
    duration: 7 + rand() * 7,
    // Only the first render is staggered. Re-rolls start at 0, otherwise a
    // heart restarts mid-cycle and vanishes right after appearing.
    delay: fresh ? -(rand() * 14) : 0,
    rot: (rand() * 2 - 1) * 20,
    opacity: 0.35 + rand() * 0.45,
    color: COLORS[Math.floor(rand() * COLORS.length)],
  };
}

function initialHearts(): Heart[] {
  const rand = seededRandom(11);
  const pool = [...CELLS];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, HEART_COUNT).map((cell) => makeHeart(cell, rand, true));
}

// The 20 hearts are generated exactly once at module load with the seeded
// (deterministic, SSR-safe) PRNG. Their cells and inline CSS variables never
// change at runtime; the CSS ambientGlow animation alone drives the looping
// appear / float / glow / fade behaviour.
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
