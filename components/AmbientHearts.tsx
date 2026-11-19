"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import PixelHeart from "./PixelHeart";

const HEART_COUNT = 20;
const COLS = 6;
const ROWS = 5;
const COLORS = ["#E453A3", "#F0254B", "#FF8FC7"];

// One heart per cell. Only the very middle cells are left empty; hearts may
// appear close to the permanent ones, but a DOM check in reroll() keeps them
// from ever overlapping.
const CELLS = Array.from({ length: COLS * ROWS }, (_, index) => index).filter(
  (index) => {
    const col = index % COLS;
    const row = Math.floor(index / COLS);
    return !(col >= 2 && col <= 3 && row >= 1 && row <= 3);
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

function protectedRects() {
  return Array.from(
    document.querySelectorAll(
      ".landing__heart, .landing__title-wrap, .landing__subtitle, .landing__scroll"
    )
  ).map((el) => el.getBoundingClientRect());
}

function isSafe(x: number, y: number, rects: DOMRect[]): boolean {
  return rects.every((r) => {
    // Distance from the heart centre to the nearest edge of the protected
    // element. 24 = largest heart half-size, plus room for the gentle floating
    // motion of the text / permanent hearts.
    const dx = Math.max(r.left - x, 0, x - r.right);
    const dy = Math.max(r.top - y, 0, y - r.bottom);
    return Math.hypot(dx, dy) > 36;
  });
}

function heartPoint(heart: Heart) {
  return {
    x: (heart.left / 100) * window.innerWidth,
    y: (heart.top / 100) * window.innerHeight,
  };
}

function pickSafeCell(
  free: number[],
  rects: DOMRect[],
  occupied: { x: number; y: number }[]
): { cell: number; pos: { left: number; top: number } } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const shuffled = [...free].sort(() => Math.random() - 0.5);

  for (const cell of shuffled) {
    const pos = cellPosition(cell, Math.random);
    const x = (pos.left / 100) * vw;
    const y = (pos.top / 100) * vh;
    const clearOfHearts = occupied.every(
      (o) => Math.hypot(x - o.x, y - o.y) > 90
    );
    if (isSafe(x, y, rects) && clearOfHearts) return { cell, pos };
  }
  const fallback = shuffled[0];
  return { cell: fallback, pos: cellPosition(fallback, Math.random) };
}

function safetyPass(prev: Heart[], rects: DOMRect[]): Heart[] {
  const next = [...prev];
  for (let pass = 0; pass < 3; pass += 1) {
    for (let i = 0; i < next.length; i += 1) {
      const point = heartPoint(next[i]);
      const occupied = next.filter((_, j) => j !== i).map(heartPoint);
      const clear =
        isSafe(point.x, point.y, rects) &&
        occupied.every(
          (o) => Math.hypot(point.x - o.x, point.y - o.y) > 90
        );
      if (clear) continue;
      const used = new Set(next.map((h) => h.cell));
      const free = CELLS.filter((cell) => !used.has(cell));
      if (!free.length) continue;
      const { cell, pos } = pickSafeCell(free, rects, occupied);
      next[i] = {
        ...makeHeart(cell, Math.random, false),
        ...pos,
        duration: next[i].duration,
      };
    }
  }
  return next;
}

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
  const [hearts, setHearts] = useState<Heart[]>(initialHearts);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    const run = () => {
      if (mounted.current) {
        setHearts((prev) => safetyPass(prev, protectedRects()));
      }
    };

    run();
    // The pixel font loads after mount and can resize the text, so re-check
    // once fonts are ready and again shortly after.
    document.fonts?.ready.then(run);
    const timer = window.setTimeout(run, 1500);

    return () => {
      mounted.current = false;
      window.clearTimeout(timer);
    };
  }, []);

  // Each cycle: move this heart into a free, non-overlapping cell.
  const reroll = (index: number) => {
    if (!mounted.current) return;
    setHearts((prev) => {
      const used = new Set(prev.filter((_, i) => i !== index).map((h) => h.cell));
      const free = CELLS.filter((cell) => !used.has(cell));
      if (free.length === 0) return prev;
      const occupied = prev.filter((_, i) => i !== index).map(heartPoint);
      const { cell, pos } = pickSafeCell(free, protectedRects(), occupied);
      return prev.map((heart, i) =>
        i === index
          ? {
              ...makeHeart(cell, Math.random, false),
              ...pos,
              duration: heart.duration,
            }
          : heart
      );
    });
  };

  return (
    <div className="ambient-hearts" aria-hidden="true">
      {hearts.map((heart, index) => (
        <span
          key={index}
          className="ambient-heart"
          onAnimationIteration={() => reroll(index)}
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
