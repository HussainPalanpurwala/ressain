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
  // Long enough to slice several decorrelated rustles out of a single buffer.
  const getNoiseBuffer = (context: AudioContext): AudioBuffer => {
    if (noiseBufferRef.current) return noiseBufferRef.current;

    const length = Math.floor(context.sampleRate * 1.8);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    noiseBufferRef.current = buffer;
    return buffer;
  };

  // A gentle, layered letter-opening sequence, synthesized entirely at call
  // time. Everything below is synchronous so it still plays on mobile: the
  // context is created/resumed inside the click gesture that calls this.
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

    // Tiny variations keep repeated opens from sounding mechanically identical.
    const vary = (value: number, amount: number) =>
      value * (1 + (Math.random() * 2 - 1) * amount);

    type Rustle = {
      start: number;
      duration: number;
      frequency: number;
      endFrequency?: number;
      attack?: number;
      q?: number;
      peak: number;
      type?: BiquadFilterType;
    };

    // Filtered noise with a soft swell (and an optional filter sweep) — the
    // raw material for paper rustles, page turns and the final settle.
    const rustle = ({
      start,
      duration,
      frequency,
      endFrequency,
      attack = 0.05,
      q = 0.7,
      peak,
      type = "bandpass",
    }: Rustle) => {
      const source = context.createBufferSource();
      source.buffer = buffer;

      const filter = context.createBiquadFilter();
      filter.type = type;
      filter.Q.value = q;
      filter.frequency.setValueAtTime(vary(frequency, 0.04), start);
      if (endFrequency !== undefined) {
        filter.frequency.exponentialRampToValueAtTime(
          vary(endFrequency, 0.04),
          start + duration
        );
      }

      const gain = context.createGain();
      const end = start + duration;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(
        vary(peak, 0.1),
        start + Math.min(attack, duration * 0.5)
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);

      // Draw each layer from a different slice of the shared noise buffer.
      const offset = Math.random() * Math.max(0, buffer.duration - duration);
      source.start(start, offset);
      source.stop(end + 0.02);
    };

    // A soft sine "note" with a slow attack and long decay — the chime.
    const tone = (start: number, frequency: number, duration: number, peak: number) => {
      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(peak, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.02);
    };

    const t = now;

    // 1. Lift — the first soft crinkle as the flap is raised.
    rustle({ start: t, duration: 0.5, frequency: 1500, endFrequency: 1900, attack: 0.06, q: 0.6, peak: 0.05 });

    // 2. Page turn — a longer swell whose brightness climbs, then softens.
    rustle({ start: t + 0.18, duration: 0.95, attack: 0.12, frequency: 900, endFrequency: 2800, q: 0.5, peak: 0.07 });

    // 3. Unfold — two gentle, lower creases as the letter is opened flat.
    rustle({ start: t + 0.95, duration: 0.55, frequency: 750, endFrequency: 1100, q: 0.7, peak: 0.04 });
    rustle({ start: t + 1.15, duration: 0.45, frequency: 1300, q: 0.8, peak: 0.025 });

    // 4. Chime — a warm, understated C-major shimmer.
    tone(t + 1.3, 523.25, 0.9, 0.032);
    tone(t + 1.42, 659.25, 0.85, 0.026);
    tone(t + 1.56, 783.99, 0.8, 0.02);

    // 5. Settle — a very quiet, low rustle as the paper comes to rest.
    rustle({ start: t + 1.85, duration: 0.5, attack: 0.1, frequency: 800, q: 0.5, peak: 0.018, type: "lowpass" });
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
