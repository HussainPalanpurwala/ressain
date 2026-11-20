"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PixelHeart from "./PixelHeart";
import TypedMessage from "./TypedMessage";
import usePrefersReducedMotion from "./usePrefersReducedMotion";
import useRetroSound from "./useRetroSound";

const HEART_COUNT = 10;
const BOOT_DURATION = 10000;

const MESSAGES = [
  { at: 0, text: "INITIALISING OUR LITTLE UNIVERSE..." },
  { at: 13, text: "SEARCHING THE STARS..." },
  { at: 25, text: "LOCATING TWO SOULS..." },
  { at: 38, text: "ESTABLISHING A CONNECTION..." },
  { at: 48, text: "CONNECTING TWO SOULS ACROSS THE UNIVERSE..." },
  { at: 63, text: "SYNCHRONISING MEMORIES..." },
  { at: 75, text: "CONNECTION ESTABLISHED." },
  { at: 88, text: "WELCOME TO OUR LITTLE UNIVERSE." },
];

type Phase = "loading" | "ready" | "exiting";

export default function BootSequence({ onEnter }: { onEnter: () => void }) {
  const reduceMotion = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  // Mobile browsers keep Web Audio locked until a real gesture. On touch
  // devices we wait for one tap, unlock audio, THEN run the 10s boot so its
  // fanfare and every loading blip are actually audible from 0 to 100%.
  const [needsGesture, setNeedsGesture] = useState(false);
  const [started, setStarted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const finishedRef = useRef(false);
  const didEnterRef = useRef(false);
  const onEnterRef = useRef(onEnter);
  onEnterRef.current = onEnter;

  // The opacity transition and the timeout fallback can both report the exit
  // as complete; make sure the parent is only told once.
  const finishEnter = useCallback(() => {
    if (didEnterRef.current) return;
    didEnterRef.current = true;
    onEnterRef.current();
  }, []);

  // The boot is a full-screen overlay: scrolling the page behind it would
  // leave the experience at a random position once "Enter" is pressed.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const {
    enabled: soundOn,
    setEnabled: setSoundOn,
    playStartup,
    playStage,
    playComplete,
    playEnter,
    unlockAudio,
  } = useRetroSound();

  useEffect(() => {
    const touch =
      window.matchMedia?.("(hover: none)").matches ||
      navigator.maxTouchPoints > 0;
    if (touch) setNeedsGesture(true);
    else setStarted(true);
  }, []);

  const handleBootStart = async () => {
    await unlockAudio();
    setNeedsGesture(false);
    setStarted(true);
  };

  // Progress runs on its own clock, independent of any network activity, and
  // always reaches 100%.
  useEffect(() => {
    if (!started) return;
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
  }, [reduceMotion, started]);

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
    if (!started) return;
    playStartup();
  }, [started, playStartup]);

  useEffect(() => {
    if (!started || phase !== "loading") return;
    playStage();
  }, [started, messageIndex, phase, playStage]);

  useEffect(() => {
    if (!started || phase !== "ready") return;
    playComplete();
  }, [started, phase, playComplete]);

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
      finishEnter();
    }
  };

  // Fallback in case the CSS transition does not fire an opacity event.
  useEffect(() => {
    if (phase !== "exiting") return;
    const timer = window.setTimeout(
      finishEnter,
      reduceMotion ? 50 : 1000
    );
    return () => window.clearTimeout(timer);
  }, [phase, finishEnter, reduceMotion]);

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
      {needsGesture && (
        <button type="button" className="boot__gate" onClick={handleBootStart}>
          <span className="boot__gate-title">TAP TO START BOOT</span>
          <span className="boot__gate-note">Tap once to enable sound</span>
        </button>
      )}

      <div className="boot__inner">
        <div className="boot__glow" aria-hidden="true" />

        <div className="boot__box">
          <span className="boot__corners" aria-hidden="true">
            <span className="boot__corner boot__corner--tl" />
            <span className="boot__corner boot__corner--tr" />
            <span className="boot__corner boot__corner--bl" />
            <span className="boot__corner boot__corner--br" />
          </span>

          <div className="boot__status" aria-hidden="true">
            <span className="boot__status-id">BOOT v1.0.4</span>
            <span className="boot__status-state">
              SYS: <span className="boot__status-ok">OK</span>
            </span>
          </div>

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

          <div className="boot__diag" aria-hidden="true">
            <div className="boot__diag-row">
              <span className="boot__diag-key">CORE</span>
              <span className="boot__diag-leader" />
              <span className="boot__diag-status boot__diag-status--ok">OK</span>
            </div>
            <div className="boot__diag-row">
              <span className="boot__diag-key">UPLINK</span>
              <span className="boot__diag-leader" />
              <span className="boot__diag-status boot__diag-status--ok">OK</span>
            </div>
            <div className="boot__diag-row">
              <span className="boot__diag-key">READY</span>
              <span className="boot__diag-leader" />
              <span
                className={`boot__diag-status${
                  isComplete ? " boot__diag-status--ok" : ""
                }`}
              >
                {isComplete ? "OK" : "--"}
              </span>
            </div>
          </div>

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

      <button
        type="button"
        className="boot__skip"
        onClick={finishEnter}
        aria-label="Skip boot sequence"
      >
        SKIP
      </button>
    </div>
  );
}
