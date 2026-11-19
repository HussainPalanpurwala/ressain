"use client";

import { useEffect, useState } from "react";
import styles from "./WrittenInStars.module.css";

// Positions are derived deterministically from the index so the server and the
// client render an identical starfield (no hydration mismatch, no Math.random).
const BACKGROUND_STARS = Array.from({ length: 64 }, (_, index) => ({
  id: index,
  x: 3 + ((index * 37 + 11) % 94),
  y: 5 + ((index * 53 + 29) % 90),
  size: 2 + (index % 3),
  delay: ((index * 17) % 40) / 10,
  duration: 3 + (index % 5),
}));

// The few stars a visitor can actually interact with.
const CLICKABLE_STARS = [
  { label: "Star 01", x: 20, y: 42, delay: 0, duration: 4 },
  { label: "Star 02", x: 50, y: 32, delay: 1.2, duration: 4.6 },
  { label: "Star 03", x: 80, y: 46, delay: 2.1, duration: 5.2 },
];

export default function WrittenInStars() {
  const [active, setActive] = useState<number | null>(null);

  const toggle = (index: number) => {
    setActive((current) => (current === index ? null : index));
  };

  // Escape dismisses the revealed note, matching the other overlay in the
  // experience. (The Open When lightbox stops propagation when it is open.)
  useEffect(() => {
    if (active === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active]);

  return (
    <section className={styles.section} id="written-in-the-stars">
      {/* Decorative starfield — purely presentational */}
      <div className={styles.sky} aria-hidden="true">
        {BACKGROUND_STARS.map((star) => (
          <span
            key={star.id}
            className={styles.star}
            style={
              {
                "--x": `${star.x}%`,
                "--y": `${star.y}%`,
                "--s": `${star.size}px`,
                "--delay": `${star.delay}s`,
                "--duration": `${star.duration}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>Written in the Stars</h2>
        <p className={styles.hint}>[ select a star to reveal its note ]</p>
      </div>

      {/* Clickable stars are real buttons so they work with keyboard + AT */}
      {CLICKABLE_STARS.map((star, index) => (
        <button
          key={star.label}
          type="button"
          className={styles.clickStar}
          style={
            {
              "--x": `${star.x}%`,
              "--y": `${star.y}%`,
              "--delay": `${star.delay}s`,
              "--duration": `${star.duration}s`,
            } as React.CSSProperties
          }
          data-active={active === index}
          aria-label={`Reveal note from ${star.label}`}
          aria-expanded={active === index}
          aria-controls="written-stars-note"
          onClick={() => toggle(index)}
        >
          <span className={styles.starMark} aria-hidden="true" />
        </button>
      ))}

      <div className={styles.noteDock} id="written-stars-note" aria-live="polite">
        {active !== null && (
          <div className={styles.noteCard} role="status">
            <button
              type="button"
              className={styles.noteClose}
              onClick={() => setActive(null)}
              aria-label="Close note"
            >
              ✕
            </button>
            <span className={styles.noteTag}>
              [ {CLICKABLE_STARS[active].label} — note ]
            </span>
            <p className={styles.noteText}>[ note to be provided ]</p>
          </div>
        )}
      </div>
    </section>
  );
}
