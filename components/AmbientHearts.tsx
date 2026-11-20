"use client";

import { useCallback, useState, type CSSProperties } from "react";
import PixelHeart from "./PixelHeart";

const HEART_COUNT = 12;
const SMALL_HEARTS = 4;
const COLORS = ["#E453A3", "#F0254B", "#FF8FC7"];

// The landing's text block sits in the middle. Hearts are never placed here.
const TEXT_ZONE = { left: 18, right: 82, top: 24, bottom: 72 };

type Heart = {
  left: number;
  top: number;
  small: boolean;
  size: string;
  duration: number;
  delay: number;
  rot: number;
  opacity: number;
  color: string;
};

type Point = { x: number; y: number };
type Rect = { left: number; right: number; top: number; bottom: number };

function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const inRect = (x: number, y: number, r: Rect, pad = 0) =>
  x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad;

// Find a random free spot: outside the text, clear of every existing heart,
// and above the landing's bottom seam. Never falls back to a crowded point
// unless the viewport is genuinely too small to fit them all.
function findSpot(rand: () => number, occupied: Point[], rects: Rect[]): Point {
  const MIN_GAP = 13;
  let best: Point = { x: 50, y: 50 };
  let bestGap = -1;

  for (let attempt = 0; attempt < 600; attempt += 1) {
    const x = 3 + rand() * 94;
    const y = 5 + rand() * 83;
    if (inRect(x, y, TEXT_ZONE)) continue;
    if (rects.some((r) => inRect(x, y, r, 3))) continue;

    const gap =
      occupied.length === 0
        ? Infinity
        : Math.min(
            ...occupied.map((p) => Math.hypot((p.x - x) * 1.2, p.y - y))
          );
    if (gap > bestGap) {
      bestGap = gap;
      best = { x, y };
    }
    if (gap >= MIN_GAP) break;
  }
  return best;
}

// Sizes scale with the smaller viewport dimension so phones never get tiny
// specks and large screens never get oversized hearts.
const sizeFor = (min: number, vmin: number, max: number) =>
  `clamp(${min.toFixed(1)}px, ${vmin.toFixed(2)}vmin, ${max.toFixed(1)}px)`;

function makeHeart(rand: () => number, spot: Point, small: boolean, fresh: boolean): Heart {
  return {
    left: spot.x,
    top: spot.y,
    small,
    size: small
      ? sizeFor(18 + rand() * 4, 2.8 + rand() * 0.6, 26 + rand() * 6)
      : sizeFor(30 + rand() * 8, 5 + rand() * 1.2, 48 + rand() * 14),
    duration: (7 + rand() * 7) * 1.4,
    delay: fresh ? -(rand() * 14) : 0,
    rot: (rand() * 2 - 1) * 20,
    opacity: 0.35 + rand() * 0.45,
    color: COLORS[Math.floor(rand() * COLORS.length)],
  };
}

// Deterministic first paint (SSR-safe). Later respawns use live text rects.
const INITIAL_HEARTS: Heart[] = (() => {
  const rand = seededRandom(11);
  const occupied: Point[] = [];
  return Array.from({ length: HEART_COUNT }, (_, index) => {
    const spot = findSpot(rand, occupied, []);
    occupied.push(spot);
    return makeHeart(rand, spot, index < SMALL_HEARTS, true);
  });
})();

// Measure the actual text on screen so respawns can avoid it precisely.
function textRects(): Rect[] {
  if (typeof window === "undefined") return [];
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return Array.from(
    document.querySelectorAll(
      ".landing__title-wrap, .landing__subtitle, .landing__scroll"
    )
  ).map((el) => {
    const r = el.getBoundingClientRect();
    return {
      left: (r.left / vw) * 100,
      right: (r.right / vw) * 100,
      top: (r.top / vh) * 100,
      bottom: (r.bottom / vh) * 100,
    };
  });
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
  const [hearts, setHearts] = useState<Heart[]>(INITIAL_HEARTS);

  // Fires at the end of each loop, when opacity is exactly 0 — the new random
  // position appears invisibly, so there is no jump. The text and the other
  // hearts are measured fresh each time to prevent any overlap.
  const reroll = useCallback((index: number) => {
    setHearts((prev) => {
      const rects = textRects();
      const occupied = prev
        .filter((_, i) => i !== index)
        .map((h) => ({ x: h.left, y: h.top }));
      const current = prev[index];
      const next = makeHeart(
        Math.random,
        findSpot(Math.random, occupied, rects),
        current.small,
        false
      );
      return prev.map((heart, i) =>
        i === index
          ? { ...next, duration: heart.duration, delay: heart.delay }
          : heart
      );
    });
  }, []);

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
              "--size": heart.size,
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
