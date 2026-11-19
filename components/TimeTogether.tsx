"use client";

import { useEffect, useRef, useState } from "react";
import PixelHeart from "./PixelHeart";
import TimeGrid from "./TimeGrid";
import styles from "./TimeTogether.module.css";

// 19 November 2025, 12:07 PM IST (Asia/Kolkata) -> UTC+05:30
const START = new Date("2025-11-19T12:07:00+05:30").getTime();
const CLOSING =
  "And what a beautiful thing it is that our paths crossed so unexpectedly.";

type Time = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const ZERO: Time = { days: 0, hours: 0, minutes: 0, seconds: 0 };

function calculate(elapsed: number): Time {
  const total = Math.max(0, Math.floor(elapsed / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

function Typewriter({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [play, setPlay] = useState(false);
  const [shown, setShown] = useState("");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlay(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!play) return;
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setShown(text.slice(0, index));
      if (index >= text.length) window.clearInterval(timer);
    }, 28);
    return () => window.clearInterval(timer);
  }, [play, text]);

  return (
    <p ref={ref} className={styles.closing}>
      {shown}
      <span className={styles.cursor} aria-hidden="true">
        ▮
      </span>
    </p>
  );
}

const pad = (value: number) => String(value).padStart(2, "0");

export default function TimeTogether() {
  const [time, setTime] = useState<Time>(ZERO);
  const sectionRef = useRef<HTMLElement>(null);

  // Drive the reveal from scroll position so the section blends in gradually
  // instead of switching on at a single threshold.
  useEffect(() => {
    let frame = 0;
    const last = { in: "", out: "", enter: "" };
    const update = () => {
      frame = 0;
      const node = sectionRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight;
      const span = viewport * 0.9;
      const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

      const shape = (value: number) => value * value * (3 - 2 * value);
      const enter = shape(clamp01((viewport - rect.top) / span));
      const exit = shape(clamp01((viewport - rect.bottom) / span));
      const inValue = enter.toFixed(3);
      const outValue = exit.toFixed(3);
      const enterValue = Math.min(enter, 1 - exit).toFixed(3);
      if (inValue !== last.in) {
        node.style.setProperty("--in", inValue);
        last.in = inValue;
      }
      if (outValue !== last.out) {
        node.style.setProperty("--out", outValue);
        last.out = outValue;
      }
      if (enterValue !== last.enter) {
        node.style.setProperty("--enter", enterValue);
        last.enter = enterValue;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const tick = () => setTime(calculate(Date.now() - START));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const units = [
    { label: "HOURS", value: pad(time.hours) },
    { label: "MINUTES", value: pad(time.minutes) },
    { label: "SECONDS", value: pad(time.seconds) },
  ];

  return (
    <section ref={sectionRef} className={styles.section} id="our-time-together">
      <div className={styles.blendTop} aria-hidden="true" />
      <TimeGrid />

      <div className={styles.stretchedHearts} aria-hidden="true">
        <span className={styles.stretchOne}>
          <PixelHeart />
        </span>
        <span className={styles.stretchTwo}>
          <PixelHeart />
        </span>
        <span className={styles.stretchThree}>
          <PixelHeart />
        </span>
      </div>

      <span className={`${styles.pixelDeco} ${styles.decoOne}`} aria-hidden="true" />
      <span className={`${styles.pixelDeco} ${styles.decoTwo}`} aria-hidden="true" />
      <span className={`${styles.pixelDeco} ${styles.decoThree}`} aria-hidden="true" />

      <div className={styles.console}>
        <div className={styles.consoleFrame} aria-hidden="true" />

        <div className={styles.consoleTop}>
          <span className={styles.brand}>
            <span className={styles.led} aria-hidden="true" />
            Thanks to Zuckerberg
          </span>
        </div>

        <div className={styles.screen}>
          <div className={styles.screenHeader}>
            <h2 className={styles.title}>OUR TIME TOGETHER</h2>
            <p className={styles.subtitle}>Since the day we met</p>
          </div>

          <div className={styles.daysBlock}>
            <span key={time.days} className={styles.days}>
              {time.days}
            </span>
            <span className={styles.daysLabel}>DAYS</span>
          </div>

          <div className={styles.units}>
            {units.map((unit) => (
              <div key={unit.label} className={styles.unit}>
                <span key={unit.value} className={styles.unitValue}>
                  {unit.value}
                </span>
                <span className={styles.unitLabel}>{unit.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.screenFooter}>
            <span>PLAYER 01</span>
            <span className={styles.dots} aria-hidden="true">
              ········
            </span>
            <span>SYS.OK</span>
          </div>
        </div>

        <div className={styles.consoleBottom}>
          <span className={styles.dpad} aria-hidden="true">
            ◀ ▲ ▼ ▶
          </span>
          <span className={styles.buttons} aria-hidden="true">
            <i>R</i>
            <i>H</i>
          </span>
        </div>
      </div>

      <Typewriter text={CLOSING} />

      <div className={styles.timestamp}>
        <span className={styles.timestampLabel}>THE DAY IT BEGAN</span>
        <span className={styles.timestampValue}>12:07 PM 19th November 2025</span>
      </div>
    </section>
  );
}
