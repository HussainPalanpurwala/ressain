"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Tone = {
  freq: number;
  duration: number;
  type?: OscillatorType;
  delay?: number;
  volume?: number;
  slideTo?: number;
};

export default function useRetroSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const unlockedRef = useRef(false);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const AudioCtx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    // Mobile browsers only allow audio after a real user gesture. Unlock on
    // the first touch / tap / key press anywhere on the page.
    const unlock = () => {
      unlockedRef.current = true;
      if (ctx.state === "suspended") void ctx.resume();
    };
    const events = ["pointerdown", "touchstart", "keydown", "click"];
    events.forEach((event) => window.addEventListener(event, unlock, true));

    return () => {
      events.forEach((event) => window.removeEventListener(event, unlock, true));
      void ctx.close();
      ctxRef.current = null;
    };
  }, []);

  const play = useCallback(
    (tones: Tone[]) => {
      if (!enabled) return;
      const ctx = ctxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") {
        // Not unlocked yet (mobile). Try once; the gesture handler above will
        // resume it, and later boot stages will be heard normally.
        void ctx.resume();
        return;
      }
      if (!unlockedRef.current && ctx.state !== "running") return;

      const now = ctx.currentTime + 0.01;
      tones.forEach(
        ({
          freq,
          duration,
          type = "square",
          delay = 0,
          volume = 0.12,
          slideTo,
        }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + delay;

          osc.type = type;
          osc.frequency.setValueAtTime(freq, start);
          if (slideTo) {
            osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
          }

          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + duration + 0.03);
        }
      );
    },
    [enabled]
  );

  return { enabled, setEnabled, play };
}
