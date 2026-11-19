"use client";

import { useEffect, useRef, useState } from "react";
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
    <section className={styles.section} id="our-time-together">
      <span className={`${styles.pixelDeco} ${styles.decoOne}`} aria-hidden="true" />
      <span className={`${styles.pixelDeco} ${styles.decoTwo}`} aria-hidden="true" />
      <span className={`${styles.pixelDeco} ${styles.decoThree}`} aria-hidden="true" />

      <div className={styles.console}>
        <div className={styles.consoleTop}>
          <span className={styles.brand}>PIXEL HEART SYSTEM</span>
          <span className={styles.status}>
            <span className={styles.led} aria-hidden="true" />
            LOVE MODE: ON
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
            <i>A</i>
            <i>B</i>
          </span>
        </div>
      </div>

      <Typewriter text={CLOSING} />
    </section>
  );
}
