"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./OurStory.module.css";

function TextPlaceholder({ label, lines = 3 }: { label: string; lines?: number }) {
  return (
    <div className={styles.textPlaceholder} data-reveal>
      <span className={styles.phLabel}>[ {label} — text to be provided ]</span>
      <div className={styles.phLines} aria-hidden="true">
        {Array.from({ length: lines }, (_, index) => (
          <span key={index} style={{ width: `${94 - index * 9}%` }} />
        ))}
      </div>
    </div>
  );
}

function PhotoPlaceholder({
  label,
  shape = "wide",
  onClick,
}: {
  label: string;
  shape?: "wide" | "tall" | "square";
  onClick: (label: string) => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.photo} ${styles[shape]}`}
      onClick={() => onClick(label)}
      aria-label={`Open ${label}`}
      data-reveal
    >
      <span className={styles.pin} aria-hidden="true" />
      <span className={styles.photoInner}>
        <span className={styles.clip} aria-hidden="true" />
        <span className={styles.photoIcon} aria-hidden="true">
          ▧
        </span>
        <span className={styles.phLabel}>[ {label} — photo to be provided ]</span>
        <span className={styles.photoCaption}>[ handwritten caption to be provided ]</span>
      </span>
    </button>
  );
}

function VideoPlaceholder({
  label,
  featured = false,
}: {
  label: string;
  featured?: boolean;
}) {
  const [active, setActive] = useState(false);
  return (
    <div
      className={`${styles.video} ${featured ? styles.videoFeatured : ""}`}
      data-reveal
    >
      <div className={styles.videoThumb}>
        <span className={styles.phLabel}>
          [ {label} — {active ? "video playback here" : "video to be provided"} ]
        </span>
      </div>
      <button
        type="button"
        className={styles.playButton}
        onClick={() => setActive((value) => !value)}
      >
        {active ? "❚❚ PAUSE" : "▶ PLAY"}
      </button>
    </div>
  );
}

export default function OurStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const items = Array.from(section.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.inView);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((item) => {
      item.classList.add(styles.reveal);
      observer.observe(item);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const timeline = timelineRef.current;
      if (!timeline) return;
      const rect = timeline.getBoundingClientRect();
      const start = window.innerHeight * 0.75;
      const progress = Math.max(
        0,
        Math.min(1, (start - rect.top) / Math.max(1, rect.height))
      );
      timeline.style.setProperty("--line-progress", progress.toFixed(3));
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

  return (
    <section ref={sectionRef} className={styles.section} id="our-story">
      <div className={styles.blendFromTimer} aria-hidden="true" />

      <div className={styles.intro} data-reveal>
        <h2 className={styles.sectionTitle}>Our Story</h2>
        <p className={styles.introLine}>
          A few moments, a few places, and a little bit of everything that
          brought us here.
        </p>
      </div>

      <div ref={timelineRef} className={styles.timeline}>
        <div className={styles.stitching} aria-hidden="true" />

        {/* 01 — The Beginning */}
        <article className={`${styles.memory} ${styles.memoryMinimal}`} data-reveal>
          <span className={styles.marker}>01</span>
          <div className={styles.memoryBody}>
            <h3 className={styles.memoryTitle}>The Beginning</h3>
            <TextPlaceholder label="The Beginning story" lines={4} />
            <span className={styles.diaryAnnotation}>
              [ handwritten note in the margin — to be provided ]
            </span>
            <div className={styles.instagramDetail}>
              <span className={styles.igDot} aria-hidden="true" />
              <span className={styles.phLabel}>
                [ small Instagram-inspired detail — to be provided ]
              </span>
            </div>
          </div>
        </article>

        {/* 02 — The Conversations */}
        <article className={`${styles.memory} ${styles.memoryLetter}`} data-reveal>
          <span className={styles.marker}>02</span>
          <div className={styles.memoryBody}>
            <h3 className={styles.memoryTitle}>The Conversations</h3>
            <div className={styles.letterLayout}>
              <button
                type="button"
                className={styles.letterCard}
                onClick={() => setLetterOpen(true)}
                data-reveal
              >
                <span className={styles.letterSeal} aria-hidden="true">✦</span>
                <span className={styles.letterHeading}>The original letter</span>
                <span className={styles.phLabel}>
                  [ letter text to be provided ]
                </span>
                <span className={styles.letterOpen}>Read the letter →</span>
              </button>
              <div className={styles.videoStack}>
                <VideoPlaceholder label="First video response" />
                <VideoPlaceholder label="Second video response" featured />
              </div>
            </div>
          </div>
        </article>

        {/* 03 — The Jammu Surprise */}
        <article className={`${styles.memory} ${styles.memorySurprise}`} data-reveal>
          <span className={styles.marker}>03</span>
          <div className={styles.memoryBody}>
            <h3 className={styles.memoryTitle}>The Jammu Surprise</h3>
            <VideoPlaceholder label="Surprise reaction video" featured />
            <div className={styles.miniGallery}>
              <PhotoPlaceholder label="Jammu photo 1" shape="square" onClick={setLightbox} />
              <PhotoPlaceholder label="Jammu photo 2" shape="square" onClick={setLightbox} />
              <PhotoPlaceholder label="Jammu photo 3" shape="square" onClick={setLightbox} />
            </div>
            <TextPlaceholder label="The Jammu Surprise story" lines={3} />
          </div>
        </article>

        {/* 04 — Hari Niwas Palace */}
        <article className={`${styles.memory} ${styles.memoryPalace}`} data-reveal>
          <span className={styles.marker}>04</span>
          <div className={styles.memoryBody}>
            <h3 className={styles.memoryTitle}>Hari Niwas Palace</h3>
            <div className={styles.palaceTop}>
              <PhotoPlaceholder label="Blue painting" shape="tall" onClick={setLightbox} />
              <TextPlaceholder label="Blue sky and her dad" lines={4} />
            </div>
            <div className={styles.palaceBottom}>
              <TextPlaceholder label="The drunk uncle story" lines={3} />
              <VideoPlaceholder label="Hiding video" />
            </div>
          </div>
        </article>

        {/* 05 — The Temple */}
        <article className={`${styles.memory} ${styles.memoryTemple}`} data-reveal>
          <span className={styles.marker}>05</span>
          <div className={styles.memoryBody}>
            <h3 className={styles.memoryTitle}>The Temple</h3>
            <TextPlaceholder label="The Temple story" lines={4} />
            <PhotoPlaceholder label="Temple photo" shape="wide" onClick={setLightbox} />
          </div>
        </article>

        {/* 06 — The Missed Train */}
        <article className={`${styles.memory} ${styles.memoryTrain}`} data-reveal>
          <span className={styles.marker}>06</span>
          <div className={styles.memoryBody}>
            <h3 className={styles.memoryTitle}>The Missed Train</h3>
            <TextPlaceholder label="The Missed Train story" lines={5} />
            <div className={styles.trainMotif} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        </article>
      </div>

      {/* Transition */}
      <div className={styles.transition} data-reveal>
        <h2 className={styles.transitionTitle}>A Moment to Remember</h2>
        <div className={styles.narrowReading}>
          <TextPlaceholder label="A Moment to Remember text" lines={4} />
        </div>
      </div>

      {/* Personal note */}
      <div className={styles.note} data-reveal>
        <h2 className={styles.noteTitle}>A Personal Note</h2>
        <div className={styles.notePaper}>
          <TextPlaceholder label="Personal note — opening" lines={3} />
          <TextPlaceholder label="Personal note — middle (keep full approved wording)" lines={7} />
          <TextPlaceholder label="Personal note — ending leading into the song" lines={3} />
          <div className={styles.songDetail}>
            <span className={styles.phLabel}>[ song details and selected lyrics — to be provided ]</span>
          </div>
        </div>
      </div>

      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <div className={styles.lightboxInner} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setLightbox(null)}
            >
              ✕
            </button>
            <span className={styles.phLabel}>[ {lightbox} — full-size photo to be provided ]</span>
          </div>
        </div>
      )}

      {letterOpen && (
        <div className={styles.lightbox} onClick={() => setLetterOpen(false)}>
          <div
            className={`${styles.lightboxInner} ${styles.letterReading}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setLetterOpen(false)}
            >
              ✕
            </button>
            <h3 className={styles.memoryTitle}>The original letter</h3>
            <TextPlaceholder label="Full original letter — preserve exactly as supplied" lines={12} />
          </div>
        </div>
      )}
    </section>
  );
}
