"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./OpenWhen.module.css";

// These labels are navigation/UI structure only — not story copy.
const NOTES = [
  { id: "miss", label: "Open when you miss this", seal: "♥" },
  { id: "smile", label: "Open when you need a smile", seal: "✦" },
  { id: "rain", label: "Open when it's raining", seal: "☂" },
  { id: "alone", label: "Open when you feel alone", seal: "✧" },
  { id: "celebrate", label: "Open when you're celebrating", seal: "★" },
  { id: "reminder", label: "Open when you need a reminder", seal: "❦" },
] as const;

type Note = (typeof NOTES)[number];

const DIALOG_TITLE_ID = "open-when-dialog-title";

export default function OpenWhen() {
  const [active, setActive] = useState<Note | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => setActive(null), []);

  const open = (note: Note, trigger: HTMLButtonElement) => {
    lastTrigger.current = trigger;
    setActive(note);
  };

  // Escape closes the lightbox; focus moves inside while it is open.
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, close]);

  // Return focus to the note that opened the lightbox.
  useEffect(() => {
    if (active) return;
    lastTrigger.current?.focus();
  }, [active]);

  return (
    <section
      className={styles.section}
      id="open-when"
      aria-labelledby="open-when-heading"
    >
      <div className={styles.intro}>
        <h2 id="open-when-heading" className={styles.heading}>
          Open When…
        </h2>
        <p className={styles.subtitle}>[ a little note for each moment ]</p>
      </div>

      <div className={styles.grid}>
        {NOTES.map((note) => (
          <button
            key={note.id}
            type="button"
            className={styles.note}
            onClick={(event) => open(note, event.currentTarget)}
            aria-haspopup="dialog"
          >
            <span className={styles.tape} aria-hidden="true" />
            <span className={styles.seal} aria-hidden="true">
              {note.seal}
            </span>
            <span className={styles.noteLabel}>{note.label}</span>
            <span className={styles.noteHint}>click to open →</span>
          </button>
        ))}
      </div>

      {active && (
        <div className={styles.lightbox} onClick={close}>
          <div
            className={styles.letter}
            role="dialog"
            aria-modal="true"
            aria-labelledby={DIALOG_TITLE_ID}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              ref={closeRef}
              type="button"
              className={styles.closeButton}
              onClick={close}
              aria-label="Close note"
            >
              ✕
            </button>
            <span className={styles.letterSeal} aria-hidden="true">
              {active.seal}
            </span>
            <h3 id={DIALOG_TITLE_ID} className={styles.letterTitle}>
              {active.label}
            </h3>
            <p className={styles.letterMessage}>[ message to be provided ]</p>
          </div>
        </div>
      )}
    </section>
  );
}
