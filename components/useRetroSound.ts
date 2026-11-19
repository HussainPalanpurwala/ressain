"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Tone = {
  freq: number;
  duration: number;
  type?: OscillatorType;
  delay?: number;
};

export default function useRetroSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const AudioCtx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    // Browsers block audio until a user gesture. Resume on the first one.
    const resume = () => {
      if (ctx.state === "suspended") void ctx.resume();
    };
    window.addEventListener("pointerdown", resume);
    window.addEventListener("keydown", resume);

    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
      void ctx.close();
      ctxRef.current = null;
    };
  }, []);

  const play = useCallback(
    (tones: Tone[]) => {
      if (!enabled) return;
      const ctx = ctxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") void ctx.resume();

      const now = ctx.currentTime;
      tones.forEach(({ freq, duration, type = "square", delay = 0 }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0.05, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + duration + 0.02);
      });
    },
    [enabled]
  );

  return { enabled, setEnabled, play };
}
