"use client";

import { useCallback, useState, type CSSProperties } from "react";
import PixelHeart from "./PixelHeart";

const HEART_COUNT = 12;
const SMALL_HEARTS = 4;
const SLOT_COUNT = 16;
const COLORS = ["#E453A3", "#F0254B", "#FF8FC7"];

type Heart = {
  slot: number;
  left: number;
  top: number;
  small: boolean;
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

// A point in the free area, kept away from existing points and the title zone.
function scatter(rand: () => number, occupied: { x: number; y: number }[]) {
  const MIN_GAP = 10;
  const ASPECT = 1.25;
  const inTitleZone = (x: number, y: number) => {
    const dx = (x - 50) / 33;
    const dy = (y - 47) / 29;
    return dx * dx + dy * dy < 1;
  };

  let best = { x: 50, y: 50 };
  let bestGap = -1;
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const x = 3 + rand() * 94;
    // Stop above the landing's seam fade so hearts stay visible.
    const y = 6 + rand() * 88;
    if (inTitleZone(x, y)) continue;
    const gap =
      occupied.length === 0
        ? Infinity
        : Math.min(
            ...occupied.map((p) => Math.hypot((p.x - x) * ASPECT, p.y - y))
          );
    if (gap > bestGap) {
      bestGap = gap;
      best = { x, y };
    }
    if (gap >= MIN_GAP) break;
  }
  return best;
}

// A fixed set of well-separated spots. Hearts only ever occupy these, and
// respawn into a DIFFERENT free one, so they can never bunch up in one place.
const SLOTS: { x: number; y: number }[] = (() => {
  const rand = seededRandom(11);
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < SLOT_COUNT; i += 1) {
    points.push(scatter(rand, points));
  }
  return points;
})();

function makeHeart(
  slot: number,
  fresh: boolean,
  small: boolean,
  rand: () => number
): Heart {
  const { x, y } = SLOTS[slot];
  return {
    slot,
    left: x,
    top: y,
    small,
    size: small ? 9 + rand() * 9 : 20 + rand() * 34,
    duration: (7 + rand() * 7) * 1.4,
    // Only the initial field is staggered; respawns keep their timing so the
    // animation never restarts mid-cycle.
    delay: fresh ? -(rand() * 14) : 0,
    rot: (rand() * 2 - 1) * 20,
    opacity: 0.35 + rand() * 0.45,
    color: COLORS[Math.floor(rand() * COLORS.length)],
  };
}

// Deterministic initial field for SSR-safe hydration.
const INITIAL_HEARTS: Heart[] = (() => {
  const rand = seededRandom(27);
  const slots = SLOTS.map((_, i) => i).sort(() => rand() - 0.5);
  return Array.from({ length: HEART_COUNT }, (_, i) =>
    makeHeart(slots[i], true, i < SMALL_HEARTS, rand)
  );
})();

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

  // Called at the end of each animation loop, when opacity is exactly 0, so
  // the move is invisible. Pick a different free slot to guarantee an even,
  // ever-changing spread instead of hearts revisiting the same area.
  const reroll = useCallback((index: number) => {
    setHearts((prev) => {
      const used = new Set(prev.filter((_, i) => i !== index).map((h) => h.slot));
      const free = SLOTS.map((_, i) => i).filter((i) => !used.has(i));
      if (free.length === 0) return prev;
      const nextSlot = free[Math.floor(Math.random() * free.length)];
      const current = prev[index];
      const next = makeHeart(nextSlot, false, current.small, Math.random);
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
