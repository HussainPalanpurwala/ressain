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
          volume = 0.08,
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
          gain.gain.exponentialRampToValueAtTime(volume, start + 0.006);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + duration + 0.02);
        }
      );
    },
    [enabled]
  );

  // Classic handheld-console power-on fanfare.
  const playStartup = useCallback(
    () =>
      play([
        { freq: 523, duration: 0.08, volume: 0.1 },
        { freq: 659, duration: 0.08, delay: 0.09, volume: 0.1 },
        { freq: 784, duration: 0.08, delay: 0.18, volume: 0.1 },
        { freq: 1047, duration: 0.22, delay: 0.27, volume: 0.11 },
      ]),
    [play]
  );

  // Short, crisp blip for each loading message.
  const playStage = useCallback(
    () =>
      play([
        { freq: 880, duration: 0.045, volume: 0.08 },
        { freq: 1320, duration: 0.04, delay: 0.05, volume: 0.06 },
      ]),
    [play]
  );

  const playComplete = useCallback(
    () =>
      play([
        { freq: 523, duration: 0.09, volume: 0.09 },
        { freq: 659, duration: 0.09, delay: 0.09, volume: 0.09 },
        { freq: 784, duration: 0.09, delay: 0.18, volume: 0.09 },
        { freq: 1047, duration: 0.1, delay: 0.27, volume: 0.09 },
        { freq: 1319, duration: 0.26, delay: 0.38, type: "triangle", volume: 0.08 },
      ]),
    [play]
  );

  const playEnter = useCallback(
    () =>
      play([
        { freq: 784, duration: 0.08, volume: 0.09 },
        { freq: 1047, duration: 0.08, delay: 0.08, volume: 0.09 },
        { freq: 1319, duration: 0.18, delay: 0.16, volume: 0.09 },
      ]),
    [play]
  );

  return {
    enabled,
    setEnabled,
    playStartup,
    playStage,
    playComplete,
    playEnter,
  };
}
