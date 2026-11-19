"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type LoadingSound = {
  sources: AudioScheduledSourceNode[];
  master: GainNode;
  filter: BiquadFilterNode;
};

export default function useRetroSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const unlockedRef = useRef(false);
  const loadingRef = useRef<LoadingSound | null>(null);
  const loadingActiveRef = useRef(false);
  const startLoadingRef = useRef<() => void>(() => {});
  const [enabled, setEnabled] = useState(true);

  const getCtx = () => {
    const ctx = ctxRef.current;
    if (!ctx || ctx.state !== "running") return null;
    return ctx;
  };

  // A soft, warm pad: a detuned C-major chord with a little filtered air.
  // No short blips, no low-frequency thump.
  const startLoading = useCallback(() => {
    loadingActiveRef.current = true;
    const ctx = getCtx();
    if (!ctx || !enabled || loadingRef.current) return;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(520, ctx.currentTime);
    filter.Q.value = 0.4;
    filter.connect(master);
    master.connect(ctx.destination);

    const sources: AudioScheduledSourceNode[] = [];
    const notes = [261.63, 329.63, 392.0];
    notes.forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index === 1 ? 6 : index === 2 ? -5 : 0;
      const voice = ctx.createGain();
      voice.gain.value = index === 0 ? 1 : 0.55;
      oscillator.connect(voice);
      voice.connect(filter);
      oscillator.start();
      sources.push(oscillator);
    });

    // Gentle filtered noise for texture, kept very low.
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.35;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 900;
    noiseFilter.Q.value = 0.7;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.12;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(filter);
    noise.start();
    sources.push(noise);

    loadingRef.current = { sources, master, filter };
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
        loading.sources.forEach((source) => {
          try {
            source.stop();
          } catch {
            // already stopped
          }
        });
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
    // Slowly opens the filter and lifts the level — a gentle "waking up".
    loading.master.gain.setTargetAtTime(0.004 + progress * 0.02, now, 0.5);
    loading.filter.frequency.setTargetAtTime(
      520 + progress * 1100,
      now,
      0.7
    );
  }, []);

  const stopLoading = useCallback(() => {
    loadingActiveRef.current = false;
    const loading = loadingRef.current;
    const ctx = ctxRef.current;
    if (!loading || !ctx) return;
    const now = ctx.currentTime;
    loading.master.gain.setTargetAtTime(0.0001, now, 0.25);
    loading.sources.forEach((source) => {
      try {
        source.stop(now + 1);
      } catch {
        // already stopped
      }
    });
    loadingRef.current = null;
  }, []);

  // Slow chord swells instead of short notification beeps.
  const swell = useCallback((frequencies: number[], peak: number, length: number) => {
    const ctx = getCtx();
    if (!ctx || !unlockedRef.current) return;
    const start = ctx.currentTime + 0.02;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, start);
    master.gain.linearRampToValueAtTime(peak, start + length * 0.35);
    master.gain.exponentialRampToValueAtTime(0.0001, start + length);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1700;
    master.connect(filter);
    filter.connect(ctx.destination);
    frequencies.forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      oscillator.type = index % 2 === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      const voice = ctx.createGain();
      voice.gain.value = 1 / frequencies.length;
      oscillator.connect(voice);
      voice.connect(master);
      oscillator.start(start);
      oscillator.stop(start + length + 0.1);
    });
  }, []);

  const playComplete = useCallback(
    () => swell([392, 493.88, 587.33, 783.99], 0.05, 1.4),
    [swell]
  );
  const playEnter = useCallback(
    () => swell([329.63, 392, 523.25], 0.045, 0.9),
    [swell]
  );

  return {
    enabled,
    setEnabled,
    startLoading,
    updateLoading,
    stopLoading,
    playComplete,
    playEnter,
  };
}
