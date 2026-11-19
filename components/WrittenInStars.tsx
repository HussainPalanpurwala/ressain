"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./WrittenInStars.module.css";

// Coordinates were read directly from public/star-map.jpg (4134 x 2953) and
// are percentages of the FULL image, including its white margin. Because the
// frame is locked to the image's exact aspect ratio, these stay aligned at
// every viewport size. They sit on the constellation NAME LABELS, not on the
// star geometry.
type Constellation = {
  name: string;
  x: number;
  y: number;
  w: number; // hit-region width, as a percentage of the frame
};

const CONSTELLATIONS: Constellation[] = [
  { name: "Swan", x: 24.3, y: 12.3, w: 8 },
  { name: "Dragon", x: 40.6, y: 12.4, w: 9 },
  { name: "Little Dipper", x: 52.3, y: 10.8, w: 13 },
  { name: "Big Dipper", x: 77.0, y: 13.8, w: 12 },
  { name: "Hunting Dogs", x: 69.5, y: 27.2, w: 13 },
  { name: "Little Lion", x: 88.0, y: 24.4, w: 11 },
  { name: "Lyre", x: 28.2, y: 38.3, w: 7 },
  { name: "Hercules", x: 41.3, y: 38.6, w: 10 },
  { name: "Northern Crown", x: 48.9, y: 41.0, w: 14 },
  { name: "Herdsman", x: 56.4, y: 38.5, w: 10 },
  { name: "Berenice's Hair", x: 73.0, y: 43.8, w: 15 },
  { name: "Lion", x: 93.0, y: 39.4, w: 7 },
  { name: "Little Fox", x: 17.3, y: 41.0, w: 10 },
  { name: "Arrow", x: 19.0, y: 45.0, w: 8 },
  { name: "Dolphin", x: 6.6, y: 50.2, w: 9 },
  { name: "Eagle", x: 17.5, y: 54.5, w: 8 },
  { name: "Serpent", x: 23.5, y: 61.0, w: 9 },
  { name: "Ophiuchus", x: 37.0, y: 64.4, w: 11 },
  { name: "Serpent.", x: 51.6, y: 64.6, w: 9 },
  { name: "Virgin", x: 72.5, y: 69.0, w: 8 },
  { name: "Shield", x: 21.5, y: 76.5, w: 8 },
  { name: "Crow", x: 81.5, y: 82.0, w: 7 },
  { name: "Cup", x: 88.5, y: 77.5, w: 7 },
];

// A deterministic, CSS-only starfield for the section BACKGROUND only. These
// dots decorate the space AROUND the star map — the uploaded /star-map.jpg is
// never redrawn or given a glow. A fixed seed keeps server and client markup
// identical (no hydration mismatch). Every animatable quality — brightness
// range, peak scale, drift direction/distance, speed, phase and keyframe
// variant — is seeded too, so the dots feel organic instead of pulsing in
// unison. All colours are strictly in the white → rose → red family.
type StarColor = "white" | "pearl" | "rose" | "cherry" | "garnet";

type Star = {
  x: number;
  y: number;
  size: number;
  color: StarColor;
  delay: number;
  duration: number;
  variant: 0 | 1 | 2;
  minOpacity: number;
  maxOpacity: number;
  scale: number;
  driftX: number;
  driftY: number;
};

const STARS: Star[] = (() => {
  let seed = 20251119;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const r2 = (n: number) => Math.round(n * 100) / 100; // tidy, deterministic values
  // Weighted toward white/near-white with occasional rose and red accents —
  // every tone stays inside the white/red family (no cream or yellow tints).
  const colors: StarColor[] = [
    "white", "white", "white",
    "pearl", "pearl",
    "rose", "rose",
    "cherry", "cherry",
    "garnet",
  ];
  return Array.from({ length: 84 }, () => ({
    x: r2(3 + rand() * 94), // keep dots away from the very edges
    y: r2(6 + rand() * 88),
    size: r2(1.5 + rand() * 2.5), // 1.5–4px
    color: colors[Math.floor(rand() * colors.length)],
    delay: r2(rand() * -12), // negative so dots start at different fade points
    duration: r2(4.5 + rand() * 6), // 4.5–10.5s, slow and restrained
    variant: Math.floor(rand() * 3) as 0 | 1 | 2,
    minOpacity: r2(0.15 + rand() * 0.25), // 0.15–0.40 floor
    maxOpacity: r2(0.7 + rand() * 0.3), // 0.70–1.00 ceiling
    scale: r2(1.15 + rand() * 0.35), // 1.15–1.50 peak scale
    driftX: r2((rand() * 2 - 1) * 6), // -6..6px, direction varies per star
    driftY: r2((rand() * 2 - 1) * 6), // -6..6px
  }));
})();

export default function WrittenInStars() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  // Opening reveal: start almost completely dark, then fade the heading and
  // image in once the section scrolls into view. Reduced-motion users see it
  // immediately.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // A touch/tap outside the label regions ends the highlight.
  useEffect(() => {
    if (active === null) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-hit]")) setActive(null);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [active]);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      id="written-in-the-stars"
      aria-labelledby="written-in-stars-heading"
      data-visible={visible}
    >
      {/* Background-only glowing starfield. Sits at z-index 0, behind the
          heading and the image, ignores pointers, and never touches the map. */}
      <div className={styles.starfield} aria-hidden="true">
        {STARS.map((star, index) => (
          <span
            key={index}
            className={styles.star}
            data-color={star.color}
            data-variant={star.variant}
            style={
              {
                "--sx": `${star.x}%`,
                "--sy": `${star.y}%`,
                "--ss": `${star.size}px`,
                "--sd": `${star.delay}s`,
                "--sdur": `${star.duration}s`,
                "--smin": `${star.minOpacity}`,
                "--smax": `${star.maxOpacity}`,
                "--sscale": `${star.scale}`,
                "--sdx": `${star.driftX}px`,
                "--sdy": `${star.driftY}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className={styles.content}>
        <h2 id="written-in-stars-heading" className={styles.title}>
          Written in the Stars
        </h2>

        <div className={styles.frame} data-active={active !== null}>
          {/* The only image on the page — plain, never redrawn or replaced. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.map}
            src="/star-map.jpg"
            alt="A star map titled The Day We Met, showing the night sky on 19th November 2025 in India, with the constellation names labelled."
          />

          {/* Transparent hit regions over each printed constellation name. */}
          {CONSTELLATIONS.map((constellation, index) => (
            <button
              key={`${constellation.name}-${index}`}
              type="button"
              data-hit
              className={styles.hit}
              style={
                {
                  "--hx": `${constellation.x}%`,
                  "--hy": `${constellation.y}%`,
                  "--hw": `${constellation.w}%`,
                } as React.CSSProperties
              }
              aria-label={`Highlight the ${constellation.name} label`}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setActive(index);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") {
                  setActive((current) => (current === index ? null : current));
                }
              }}
              onFocus={() => setActive(index)}
              onBlur={() => setActive((current) => (current === index ? null : current))}
              onTouchStart={() => setActive(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
