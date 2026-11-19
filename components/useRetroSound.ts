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
  const loadingRef = useRef<{
    osc: OscillatorNode;
    osc2: OscillatorNode;
    gain: GainNode;
  } | null>(null);
  const loadingActiveRef = useRef(false);
  const startLoadingRef = useRef<() => void>(() => {});
  const [enabled, setEnabled] = useState(true);

  // One continuous sound that grows from near-silence to a soft presence as
  // the loading bar fills — no gaps between stages.
  const startLoading = useCallback(() => {
    loadingActiveRef.current = true;
    const ctx = ctxRef.current;
    if (!ctx || !enabled || ctx.state !== "running" || loadingRef.current) {
      return;
    }

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);

    const osc2 = ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime);
    const layerGain = ctx.createGain();
    layerGain.gain.value = 0.1;

    osc.connect(gain);
    osc2.connect(layerGain);
    layerGain.connect(gain);
    osc.start();
    osc2.start();

    loadingRef.current = { osc, osc2, gain };
  }, [enabled]);

  useEffect(() => {
    startLoadingRef.current = startLoading;
  }, [startLoading]);

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
      if (loadingActiveRef.current) startLoadingRef.current();
    };
    const events = ["pointerdown", "touchstart", "keydown", "click"];
    events.forEach((event) => window.addEventListener(event, unlock, true));

    return () => {
      events.forEach((event) => window.removeEventListener(event, unlock, true));
      const loading = loadingRef.current;
      if (loading) {
        try {
          loading.osc.stop();
          loading.osc2.stop();
        } catch {
          // already stopped
        }
      }
      void ctx.close();
      ctxRef.current = null;
      loadingRef.current = null;
    };
  }, []);

  const updateLoading = useCallback((progress: number) => {
    const loading = loadingRef.current;
    const ctx = ctxRef.current;
    if (!loading || !ctx) return;
    const now = ctx.currentTime;
    // Very quiet, high and soft — a shimmer, never a low boom.
    loading.gain.gain.setTargetAtTime(0.002 + progress * 0.016, now, 0.3);
    loading.osc.frequency.setTargetAtTime(523 + progress * 120, now, 0.5);
    loading.osc2.frequency.setTargetAtTime(659 + progress * 150, now, 0.5);
  }, []);

  const stopLoading = useCallback(() => {
    loadingActiveRef.current = false;
    const loading = loadingRef.current;
    const ctx = ctxRef.current;
    if (!loading || !ctx) return;
    const now = ctx.currentTime;
    loading.gain.gain.setTargetAtTime(0.0001, now, 0.12);
    loading.osc.stop(now + 0.6);
    loading.osc2.stop(now + 0.6);
    loadingRef.current = null;
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

  return {
    enabled,
    setEnabled,
    play,
    startLoading,
    updateLoading,
    stopLoading,
  };
}
