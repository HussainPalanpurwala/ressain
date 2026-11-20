"use client";

import { useCallback, useState, type CSSProperties } from "react";
import PixelHeart from "./PixelHeart";

const HEART_COUNT = 12;
const SMALL_HEARTS = 4;
const COLORS = ["#E453A3", "#F0254B", "#FF8FC7"];

type Heart = {
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

// Pick a free, scattered spot. The middle stays clear for the title and its
// permanent hearts, and the lowest band stops above the landing's seam fade.
function scatter(rand: () => number, occupied: { x: number; y: number }[]) {
  const MIN_GAP = 11;
  const ASPECT = 1.25;
  const inTitleZone = (x: number, y: number) => {
    const dx = (x - 50) / 33;
    const dy = (y - 47) / 29;
    return dx * dx + dy * dy < 1;
  };

  let best = { x: 50, y: 50 };
  let bestGap = -1;
  for (let attempt = 0; attempt < 260; attempt += 1) {
    const x = 3 + rand() * 94;
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

function newHeart(
  rand: () => number,
  occupied: { x: number; y: number }[],
  fresh: boolean,
  small: boolean
): Heart {
  const { x, y } = scatter(rand, occupied);
  return {
    left: x,
    top: y,
    small,
    // A few small hearts for variety; the rest stay large so the field reads
    // calm rather than speckled.
    size: small ? 9 + rand() * 9 : 20 + rand() * 34,
    // Slower loops mean fewer respawns and a longer, gentler fade.
    duration: (7 + rand() * 7) * 1.4,
    // Only the initial render is staggered. Re-spawns keep their existing
    // timing (see reroll) so the animation never restarts mid-cycle.
    delay: fresh ? -(rand() * 14) : 0,
    rot: (rand() * 2 - 1) * 20,
    opacity: 0.35 + rand() * 0.45,
    color: COLORS[Math.floor(rand() * COLORS.length)],
  };
}

// Deterministic initial field — generated once at module load for SSR safety.
const initialHearts = () => {
  const rand = seededRandom(11);
  const occupied: { x: number; y: number }[] = [];
  return Array.from({ length: HEART_COUNT }, (_, index) => {
    const heart = newHeart(rand, occupied, true, index < SMALL_HEARTS);
    occupied.push({ x: heart.left, y: heart.top });
    return heart;
  });
};

const INITIAL_HEARTS = initialHearts();

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

  // The original effect moved each heart to a new spot every loop. Doing it
  // here — on animationiteration, when the keyframe opacity is exactly 0 —
  // keeps that lively respawn without any visible jump or jitter.
  const reroll = useCallback((index: number) => {
    setHearts((prev) => {
      const occupied = prev
        .filter((_, i) => i !== index)
        .map((h) => ({ x: h.left, y: h.top }));
      const next = newHeart(Math.random, occupied, false, prev[index].small);
      return prev.map((heart, i) =>
        i === index
          ? {
              ...next,
              // Preserve the timing so the animation phase is uninterrupted.
              duration: heart.duration,
              delay: heart.delay,
            }
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
