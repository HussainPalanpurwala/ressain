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
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  // One shared noise buffer, created lazily from whichever AudioContext is used.
  const getNoiseBuffer = (context: AudioContext): AudioBuffer => {
    if (noiseBufferRef.current) return noiseBufferRef.current;

    const length = Math.floor(context.sampleRate * 0.4);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    noiseBufferRef.current = buffer;
    return buffer;
  };

  // Short filtered-noise "swishes" that read as a soft paper rustle / page turn.
  // Everything below is synchronous so it still plays on mobile: the context is
  // created/resumed inside the click gesture that calls this function.
  const playOpenSound = () => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const AudioContextClass: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }
    const context = audioContextRef.current;
    if (context.state === "suspended") {
      void context.resume();
    }

    const now = context.currentTime;
    const buffer = getNoiseBuffer(context);

    const swish = (start: number, duration: number, frequency: number, peak: number) => {
      const source = context.createBufferSource();
      source.buffer = buffer;

      const filter = context.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = frequency;
      filter.Q.value = 0.7;

      const gain = context.createGain();
      const end = start + duration;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(peak, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);

      source.start(start);
      source.stop(end + 0.01);
    };

    // Two quick, gentle swishes = paper rustle followed by a page turn.
    swish(now, 0.16, 1600, 0.1);
    swish(now + 0.09, 0.14, 2400, 0.075);
  };

  // Release the audio hardware when the component unmounts.
  useEffect(() => {
    return () => {
      const context = audioContextRef.current;
      if (context && context.state !== "closed") {
        void context.close();
      }
      audioContextRef.current = null;
      noiseBufferRef.current = null;
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
