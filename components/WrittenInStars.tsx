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
      data-visible={visible}
    >
      <div className={styles.content}>
        <h2 className={styles.title}>Written in the Stars</h2>

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
