"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { openWhenLetters } from "../content/openWhenLetters";
import styles from "./OpenWhen.module.css";

// Reuse the original decorative seal glyphs, cycling through the existing set.
const SEALS = ["♥", "✦", "☂", "✧", "★", "❦"] as const;

type Note = {
  id: string;
  label: string;
  body: string;
  seal: string;
};

const NOTES: Note[] = openWhenLetters.map((letter, index) => ({
  id: letter.id,
  label: letter.title,
  body: letter.body,
  seal: SEALS[index % SEALS.length],
}));

const DIALOG_TITLE_ID = "open-when-dialog-title";

export default function OpenWhen() {
  const [active, setActive] = useState<Note | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const openSoundRef = useRef<HTMLAudioElement | null>(null);

  // The real envelope-opening recording (the final 3 seconds of the supplied
  // clip). One element is reused and rewound on every open. play() is called
  // synchronously inside the click gesture, which is what mobile browsers
  // require for audio to be allowed.
  const playOpenSound = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let audio = openSoundRef.current;
    if (!audio) {
      audio = new Audio("/audio/envelope-opening.mp3");
      audio.preload = "auto";
      audio.volume = 0.9;
      openSoundRef.current = audio;
    }
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Playback can still be declined by the browser; fail silently so
      // opening a letter never breaks.
    });
  }, []);

  // Stop any in-flight sound if the section unmounts.
  useEffect(() => {
    return () => {
      const audio = openSoundRef.current;
      if (audio) audio.pause();
      openSoundRef.current = null;
    };
  }, []);

  const close = useCallback(() => setActive(null), []);

  const open = (note: Note, trigger: HTMLButtonElement) => {
    playOpenSound();
    lastTrigger.current = trigger;
    setActive(note);
  };

  // Escape closes the lightbox, Tab stays inside it, and the page behind it
  // cannot be scrolled while the dialog is open.
  useEffect(() => {
    if (!active) return;

    const dialog = dialogRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (event.shiftKey) {
        if (current === first || !dialog.contains(current)) {
          event.preventDefault();
          last.focus();
        }
      } else if (current === last || !dialog.contains(current)) {
        event.preventDefault();
        first.focus();
      }
    };

    // Capture phase keeps Escape/Tab handling authoritative for this modal,
    // even if another section also listens for those keys.
    document.addEventListener("keydown", onKeyDown, true);

    // Lock background scrolling, compensating for the scrollbar so opening
    // the lightbox does not shift the layout.
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
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
      <div className={styles.intro} inert={active !== null}>
        <h2 id="open-when-heading" className={styles.heading}>
          Open When…
        </h2>
        <p className={styles.subtitle}>[ a little note for each moment ]</p>
      </div>

      <div className={styles.grid} inert={active !== null}>
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
            ref={dialogRef}
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
            <div className={styles.letterScroll}>
              <span className={styles.letterSeal} aria-hidden="true">
                {active.seal}
              </span>
              <h3 id={DIALOG_TITLE_ID} className={styles.letterTitle}>
                {active.label}
              </h3>
              <p className={styles.letterMessage}>{active.body}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
