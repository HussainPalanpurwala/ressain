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

// A 20 ms silent WAV. Playing it *inside* the first real user gesture is the
// classic mobile Safari trick that unlocks Web Audio for the whole document;
// resume() on its own is frequently ignored while the page is still locked.
const SILENT_WAV =
  "data:audio/wav;base64,UklGRmQBAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

export default function useRetroSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const unlockedRef = useRef(false);
  const pendingRef = useRef<Tone[] | null>(null);
  // The power-on fanfare is kept apart from ordinary blips so the unlock can
  // replay it once without ever stacking the whole locked boot into one burst.
  const startupRef = useRef<Tone[] | null>(null);
  const scheduleRef = useRef<(tones: Tone[], offset?: number) => void>(
    () => {}
  );
  const unlockRef = useRef<() => Promise<boolean>>(() => Promise.resolve(false));
  const [enabled, setEnabled] = useState(true);
  // Mirrors `enabled` so the one-shot unlock callback (created once) always
  // sees the current mute state instead of a stale captured value.
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  // Nothing queued before a mute should ever sound if sound is re-enabled.
  useEffect(() => {
    if (!enabled) {
      pendingRef.current = null;
      startupRef.current = null;
    }
  }, [enabled]);

  const schedule = useCallback((tones: Tone[], offset = 0) => {
    const ctx = ctxRef.current;
    if (!ctx || ctx.state !== "running") return;
    const now = ctx.currentTime + 0.01 + offset;
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
  }, []);

  useEffect(() => {
    scheduleRef.current = schedule;
  }, [schedule]);

  useEffect(() => {
    const AudioCtx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    // Create the context as soon as the client mounts so it is ready for the
    // very first gesture instead of being built part-way through the boot.
    // Some browsers refuse to construct one (Web Audio disabled, too many live
    // contexts, privacy modes); that must never take down the whole page.
    let ctx: AudioContext;
    try {
      ctx = new AudioCtx();
    } catch {
      return;
    }
    ctxRef.current = ctx;

    let unlockAudio: HTMLAudioElement | null = null;

    const flush = () => {
      if (!enabledRef.current) return;
      const startup = startupRef.current;
      const pending = pendingRef.current;
      startupRef.current = null;
      pendingRef.current = null;
      if (!startup && !pending) return;

      if (startup) scheduleRef.current(startup);
      if (pending) {
        // Stagger the blip after the fanfare so the two never collapse into a
        // single burst of overlapping notes.
        const fanfareLength = startup
          ? startup.reduce(
              (end, tone) => Math.max(end, (tone.delay ?? 0) + tone.duration),
              0
            )
          : 0;
        scheduleRef.current(pending, startup ? fanfareLength + 0.08 : 0);
      }
    };

    const unlock = async (): Promise<boolean> => {
      // Mobile browsers only grant audio access to media played *inside* a user
      // gesture. The silent WAV satisfies that rule inaudibly, after which the
      // Web Audio context is free to resume.
      try {
        if (!unlockAudio) {
          unlockAudio = new Audio(SILENT_WAV);
          unlockAudio.preload = "auto";
        }
        unlockAudio.currentTime = 0;
        const played = unlockAudio.play();
        if (played && typeof played.catch === "function") {
          played.catch(() => {});
        }
      } catch {
        // Ignore browsers that refuse programmatic playback; resume() below is
        // still attempted.
      }

      const active = ctxRef.current ?? ctx;
      if (active.state === "running") {
        if (!unlockedRef.current) {
          unlockedRef.current = true;
          flush();
        }
        return true;
      }
      try {
        await active.resume();
      } catch {
        return false;
      }
      if (String(active.state) === "running") {
        if (!unlockedRef.current) {
          unlockedRef.current = true;
          flush();
        }
        return true;
      }
      return false;
    };
    unlockRef.current = unlock;

    const events = ["pointerdown", "touchstart", "keydown", "click"];
    events.forEach((event) => window.addEventListener(event, unlock, true));

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, unlock, true)
      );
      if (unlockAudio) {
        unlockAudio.pause();
        unlockAudio.src = "";
      }
      void ctx.close().catch(() => {});
      ctxRef.current = null;
      unlockedRef.current = false;
    };
  }, []);

  const play = useCallback(
    (tones: Tone[], startup = false) => {
      if (!enabledRef.current) return;
      const ctx = ctxRef.current;
      if (!ctx) return;
      if (ctx.state !== "running") {
        // Queue it — it will sound as soon as a gesture unlocks audio. Keep the
        // fanfare and only the newest live sound so a long locked boot cannot
        // dump every missed blip at once.
        void ctx.resume().catch(() => {});
        if (startup) startupRef.current = tones;
        else pendingRef.current = tones;
        return;
      }
      schedule(tones);
    },
    [schedule]
  );

  // Console-style power-on fanfare.
  const playStartup = useCallback(
    () =>
      play(
        [
          { freq: 523, duration: 0.14, volume: 0.15 },
          { freq: 659, duration: 0.14, delay: 0.12, volume: 0.15 },
          { freq: 784, duration: 0.14, delay: 0.24, volume: 0.15 },
          { freq: 1047, duration: 0.3, delay: 0.36, volume: 0.16 },
        ],
        true
      ),
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

  // Lets a component unlock audio from INSIDE a real user gesture (e.g. a
  // "tap to boot" gate) before it starts a timed sequence that needs sound.
  const unlockAudio = useCallback(() => unlockRef.current(), []);

  return {
    enabled,
    setEnabled,
    unlockAudio,
    playStartup,
    playStage,
    playComplete,
    playEnter,
  };
}
