"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PixelHeart from "./PixelHeart";
import TypedMessage from "./TypedMessage";
import usePrefersReducedMotion from "./usePrefersReducedMotion";
import useRetroSound from "./useRetroSound";

const HEART_COUNT = 10;
const BOOT_DURATION = 16000;

const MESSAGES = [
  { at: 0, text: "INITIALISING OUR LITTLE UNIVERSE..." },
  { at: 13, text: "SEARCHING THE STARS..." },
  { at: 26, text: "LOCATING TWO SOULS..." },
  { at: 39, text: "ESTABLISHING A CONNECTION..." },
  { at: 52, text: "CONNECTING TWO SOULS ACROSS THE UNIVERSE..." },
  { at: 65, text: "SYNCHRONISING MEMORIES..." },
  { at: 78, text: "CONNECTION ESTABLISHED." },
  { at: 88, text: "WELCOME TO OUR LITTLE UNIVERSE." },
];

type Phase = "loading" | "ready" | "exiting";

export default function BootSequence({ onEnter }: { onEnter: () => void }) {
  const reduceMotion = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const rootRef = useRef<HTMLDivElement>(null);
  const finishedRef = useRef(false);
  const { enabled: soundOn, setEnabled: setSoundOn, play } = useRetroSound();

  // Progress runs on its own clock, independent of any network activity, and
  // always reaches 100%.
  useEffect(() => {
    if (reduceMotion) {
      setProgress(100);
      setPhase("ready");
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const next = Math.min(100, (elapsed / BOOT_DURATION) * 100);
      setProgress(next);
      if (next < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        setPhase("ready");
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  const messageIndex = useMemo(() => {
    let index = 0;
    for (let i = 0; i < MESSAGES.length; i += 1) {
      if (progress >= MESSAGES[i].at) index = i;
    }
    return index;
  }, [progress]);

  const filled = Math.min(HEART_COUNT, Math.ceil(progress / 10));
  const isComplete = phase !== "loading";

  // Little arcade blip as each loading line appears.
  useEffect(() => {
    if (phase !== "loading") return;
    play([
      { freq: 660, duration: 0.07, volume: 0.14 },
      { freq: 990, duration: 0.06, delay: 0.07, volume: 0.12 },
      { freq: 1320, duration: 0.05, delay: 0.14, type: "triangle", volume: 0.1 },
    ]);
  }, [messageIndex, phase, play]);

  // Success chime when the boot finishes.
  useEffect(() => {
    if (phase !== "ready") return;
    play([
      { freq: 523, duration: 0.1, volume: 0.14 },
      { freq: 659, duration: 0.1, delay: 0.1, volume: 0.14 },
      { freq: 784, duration: 0.1, delay: 0.2, volume: 0.14 },
      { freq: 1047, duration: 0.12, delay: 0.3, volume: 0.14 },
      { freq: 1319, duration: 0.28, delay: 0.42, type: "triangle", volume: 0.12 },
    ]);
  }, [phase, play]);

  const handleEnter = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    play([
      { freq: 880, duration: 0.08, volume: 0.16 },
      { freq: 660, duration: 0.08, delay: 0.08, volume: 0.14 },
      { freq: 440, duration: 0.22, delay: 0.16, type: "triangle", volume: 0.14 },
    ]);
    setPhase("exiting");
  };

  const handleTransitionEnd = (
    event: React.TransitionEvent<HTMLDivElement>
  ) => {
    if (
      event.target === rootRef.current &&
      event.propertyName === "opacity" &&
      phase === "exiting"
    ) {
      onEnter();
    }
  };

  // Fallback in case the CSS transition does not fire an opacity event.
  useEffect(() => {
    if (phase !== "exiting") return;
    const timer = window.setTimeout(onEnter, reduceMotion ? 50 : 1000);
    return () => window.clearTimeout(timer);
  }, [phase, onEnter, reduceMotion]);

  return (
    <div
      ref={rootRef}
      className={[
        "boot",
        isComplete ? "boot--complete" : "",
        phase === "exiting" ? "boot--exiting" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="boot__inner">
        <div className="boot__glow" aria-hidden="true" />

        <div className="boot__box">
          <button
            type="button"
            className="boot__sound"
            onClick={() => setSoundOn((value) => !value)}
            aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
          >
            {soundOn ? "♪ ON" : "♪ OFF"}
          </button>

          <p className="boot__label">
            LOADING <span className="boot__caret" aria-hidden="true" />
          </p>

          <TypedMessage
            text={MESSAGES[messageIndex].text}
            reduceMotion={reduceMotion}
          />

          <div className="boot__hearts" aria-hidden="true">
            {Array.from({ length: HEART_COUNT }, (_, index) => (
              <span
                key={index}
                className={`boot-heart${
                  index < filled || isComplete ? " boot-heart--filled" : ""
                }`}
              >
                <PixelHeart />
              </span>
            ))}
          </div>

          <div className="boot__percent">{Math.round(progress)}%</div>

          <button
            type="button"
            className={`boot__enter${
              phase === "ready" ? " boot__enter--visible" : ""
            }`}
            onClick={handleEnter}
            tabIndex={phase === "ready" ? 0 : -1}
          >
            Enter our universe
          </button>
        </div>
      </div>
    </div>
  );
}
