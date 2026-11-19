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
  const pendingRef = useRef<Tone[][]>([]);
  const scheduleRef = useRef<(tones: Tone[]) => void>(() => {});
  const [enabled, setEnabled] = useState(true);

  const schedule = useCallback(
    (tones: Tone[]) => {
      const ctx = ctxRef.current;
      if (!ctx || ctx.state !== "running") return;
      const now = ctx.currentTime + 0.01;
      tones.forEach(
        ({
          freq,
          duration,
          type = "square",
          delay = 0,
          volume = 0.14,
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
          gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
          gain.gain.setValueAtTime(volume, start + duration * 0.55);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + duration + 0.03);
        }
      );
    },
    []
  );

  useEffect(() => {
    scheduleRef.current = schedule;
  }, [schedule]);

  useEffect(() => {
    const AudioCtx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    const unlock = () => {
      void ctx.resume().then(() => {
        const queued = pendingRef.current;
        pendingRef.current = [];
        queued.forEach((tones) => scheduleRef.current(tones));
      });
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
      if (ctx.state !== "running") {
        // Queue it — it will sound as soon as a gesture unlocks audio.
        void ctx.resume();
        pendingRef.current.push(tones);
        return;
      }
      schedule(tones);
    },
    [enabled, schedule]
  );

  // Console-style power-on fanfare.
  const playStartup = useCallback(
    () =>
      play([
        { freq: 523, duration: 0.14, volume: 0.15 },
        { freq: 659, duration: 0.14, delay: 0.12, volume: 0.15 },
        { freq: 784, duration: 0.14, delay: 0.24, volume: 0.15 },
        { freq: 1047, duration: 0.3, delay: 0.36, volume: 0.16 },
      ]),
    [play]
  );

  // Short but clearly audible blip per loading message — same level throughout.
  const playStage = useCallback(
    () =>
      play([
        { freq: 880, duration: 0.13, volume: 0.14 },
        { freq: 1320, duration: 0.11, delay: 0.11, volume: 0.12 },
      ]),
    [play]
  );

  const playComplete = useCallback(
    () =>
      play([
        { freq: 523, duration: 0.14, volume: 0.14 },
        { freq: 659, duration: 0.14, delay: 0.12, volume: 0.14 },
        { freq: 784, duration: 0.14, delay: 0.24, volume: 0.14 },
        { freq: 1047, duration: 0.16, delay: 0.36, volume: 0.14 },
        {
          freq: 1319,
          duration: 0.34,
          delay: 0.5,
          type: "triangle",
          volume: 0.13,
        },
      ]),
    [play]
  );

  const playEnter = useCallback(
    () =>
      play([
        { freq: 784, duration: 0.13, volume: 0.14 },
        { freq: 1047, duration: 0.13, delay: 0.11, volume: 0.14 },
        { freq: 1319, duration: 0.26, delay: 0.22, volume: 0.14 },
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
