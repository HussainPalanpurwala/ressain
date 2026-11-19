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
  const {
    enabled: soundOn,
    setEnabled: setSoundOn,
    playStartup,
    playStage,
    playComplete,
    playEnter,
  } = useRetroSound();

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

  // Console-style power-on fanfare, then a crisp blip per loading line.
  useEffect(() => {
    playStartup();
  }, [playStartup]);

  useEffect(() => {
    if (phase !== "loading") return;
    playStage();
  }, [messageIndex, phase, playStage]);

  useEffect(() => {
    if (phase !== "ready") return;
    playComplete();
  }, [phase, playComplete]);

  const handleEnter = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    playEnter();
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
