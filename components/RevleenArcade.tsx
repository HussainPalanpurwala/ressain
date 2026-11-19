"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  arcadeCategories,
  arcadeSubtitle,
  arcadeTitle,
  type ArcadeCategory,
  type ArcadeCategoryId,
} from "@/content/arcadeFacts";
import styles from "./RevleenArcade.module.css";
import usePrefersReducedMotion from "./usePrefersReducedMotion";

type Tone = {
  freq: number;
  duration: number;
  type?: OscillatorType;
  delay?: number;
  volume?: number;
  slideTo?: number;
};

type SoundName = "start" | "open" | "back";

/* Short synthesised blips — no files, no dependencies. Volumes are kept low on
   purpose so the cabinet never upstages the rest of the page. */
const SOUNDS: Record<SoundName, Tone[]> = {
  // Power-on arpeggio for START GAME.
  start: [
    { freq: 523, duration: 0.1, volume: 0.09 },
    { freq: 659, duration: 0.1, delay: 0.09, volume: 0.09 },
    { freq: 784, duration: 0.1, delay: 0.18, volume: 0.09 },
    { freq: 1047, duration: 0.2, delay: 0.27, volume: 0.1 },
  ],
  // Rising sweep as a category screen opens.
  open: [
    { freq: 440, slideTo: 760, duration: 0.11, type: "triangle", volume: 0.09 },
    { freq: 988, duration: 0.08, delay: 0.1, volume: 0.06 },
  ],
  // Falling sweep when returning to the arcade.
  back: [
    { freq: 700, slideTo: 330, duration: 0.13, type: "triangle", volume: 0.08 },
  ],
};

// One very quiet blip per fact as it reveals. Scheduled from the open gesture.
const REVEAL_BLIP: Tone = {
  freq: 820,
  duration: 0.045,
  type: "square",
  volume: 0.045,
};

const FLAVOUR: Record<ArcadeCategoryId, string> = {
  food: styles.flavourFood,
  flowers: styles.flavourFlowers,
  movies: styles.flavourMovies,
  world: styles.flavourWorld,
  random: styles.flavourRandom,
  future: styles.flavourFuture,
};

// Decorative pixel confetti scattered around the cabinet (aria-hidden).
const PIXELS = ["♥", "✿", "★", "✦", "♥", "✿", "★", "♥"];

export default function RevleenArcade() {
  const [started, setStarted] = useState(false);
  const [activeId, setActiveId] = useState<ArcadeCategoryId | null>(null);
  const [visited, setVisited] = useState<ArcadeCategoryId[]>([]);
  const [muted, setMuted] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const revealTimersRef = useRef<number[]>([]);

  // Mutable mirrors so one-shot timers always read the current mute/motion state.
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const reduceMotion = usePrefersReducedMotion();
  const reduceRef = useRef(reduceMotion);
  reduceRef.current = reduceMotion;

  const canPlay = useCallback(
    () => !mutedRef.current && !reduceRef.current && typeof window !== "undefined",
    []
  );

  /* The context is created lazily inside a real user gesture, which is what
     mobile browsers require before granting audio access. */
  const playTones = useCallback(
    (tones: Tone[]) => {
      if (!canPlay()) return;
      const AudioCtor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtor) return;

      const ctx = audioCtxRef.current ?? new AudioCtor();
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") void ctx.resume();

      const start = ctx.currentTime + 0.01;
      tones.forEach(
        ({ freq, duration, type = "square", delay = 0, volume = 0.08, slideTo }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const at = start + delay;

          osc.type = type;
          osc.frequency.setValueAtTime(freq, at);
          if (slideTo) {
            osc.frequency.exponentialRampToValueAtTime(slideTo, at + duration);
          }

          gain.gain.setValueAtTime(0.0001, at);
          gain.gain.exponentialRampToValueAtTime(volume, at + 0.006);
          gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(at);
          osc.stop(at + duration + 0.02);
        }
      );
    },
    [canPlay]
  );

  const clearReveals = useCallback(() => {
    revealTimersRef.current.forEach((id) => window.clearTimeout(id));
    revealTimersRef.current = [];
  }, []);

  // Cancel pending blips and close the audio context on unmount.
  useEffect(
    () => () => {
      clearReveals();
      void audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
    },
    [clearReveals]
  );

  const playSound = (name: SoundName) => playTones(SOUNDS[name]);

  const handleStart = () => {
    clearReveals();
    playSound("start");
    setActiveId(null);
    setStarted(true);
  };

  const handleOpen = (category: ArcadeCategory) => {
    clearReveals();
    playSound("open");
    setVisited((prev) =>
      prev.includes(category.id) ? prev : [...prev, category.id]
    );
    setActiveId(category.id);

    // A gentle blip per fact, timed to line up with the CSS reveal stagger.
    if (canPlay()) {
      category.facts.forEach((_, index) => {
        const tone = { ...REVEAL_BLIP, freq: 700 + (index % 4) * 110 };
        const id = window.setTimeout(
          () => playTones([tone]),
          140 + index * 95
        );
        revealTimersRef.current.push(id);
      });
    }
  };

  const handleBack = () => {
    clearReveals();
    playSound("back");
    setActiveId(null);
  };

  const activeCategory =
    arcadeCategories.find((category) => category.id === activeId) ?? null;
  const total = arcadeCategories.length;
  const explored = visited.length;

  return (
    <section
      className={styles.section}
      id="the-revleen-arcade"
      aria-labelledby="revleen-arcade-title"
      aria-describedby="revleen-arcade-subtitle"
    >
      <div className={styles.pixels} aria-hidden="true">
        {PIXELS.map((pixel, index) => (
          <span
            key={index}
            className={`${styles.pixel} ${styles[`pixel${index + 1}`]}`}
          >
            {pixel}
          </span>
        ))}
      </div>

      <div className={styles.inner}>
        <p className={styles.eyebrow}>✦ INSERT COIN · PLAYER ONE ✦</p>

        <div className={styles.cabinet}>
          {/* Illuminated marquee */}
          <div className={styles.marqueeHousing}>
            <div className={styles.marqueeLights} aria-hidden="true">
              {Array.from({ length: 13 }, (_, index) => (
                <span key={index} className={styles.light} />
              ))}
            </div>
            <div className={styles.marquee}>
              <span className={styles.marqueeStar} aria-hidden="true">
                ★
              </span>
              <h2 id="revleen-arcade-title" className={styles.title}>
                {arcadeTitle}
              </h2>
              <span className={styles.marqueeStar} aria-hidden="true">
                ★
              </span>
            </div>
          </div>

          <div className={styles.cabinetBody}>
            <div className={styles.sideArt} aria-hidden="true">
              <span>♥</span>
              <span>✿</span>
              <span>★</span>
              <span>♥</span>
            </div>

            <div className={styles.screenBezel}>
              <div
                className={styles.screen}
                role="region"
                aria-live="polite"
                aria-label="Arcade screen"
              >
                <div className={styles.screenTop}>
                  <span id="revleen-arcade-subtitle" className={styles.subtitle}>
                    {arcadeSubtitle}
                  </span>
                  <span className={styles.playerTag} aria-hidden="true">
                    1UP
                  </span>
                </div>

                <div className={styles.screenMain}>
                  {!started ? (
                    /* ---- Attract screen ---- */
                    <div className={styles.attract}>
                      <div className={styles.attractPixels} aria-hidden="true">
                        <span>♥</span>
                        <span>✿</span>
                        <span>★</span>
                        <span>✦</span>
                        <span>♥</span>
                      </div>
                      <p className={styles.ready}>READY, PLAYER ONE?</p>
                      <div className={styles.scores} aria-hidden="true">
                        <span>1UP 000000</span>
                        <span>HI 099999</span>
                      </div>
                      <button
                        type="button"
                        className={styles.startButton}
                        onClick={handleStart}
                      >
                        START GAME
                      </button>
                      <p className={styles.pressStart} aria-hidden="true">
                        ▶ PRESS START ◀
                      </p>
                    </div>
                  ) : activeCategory ? (
                    /* ---- Category screen ---- */
                    <div
                      className={`${styles.categoryScreen} ${FLAVOUR[activeCategory.id]}`}
                      key={activeCategory.id}
                    >
                      <div className={styles.categoryHead}>
                        <span className={styles.categoryBigIcon} aria-hidden="true">
                          {activeCategory.icon}
                        </span>
                        <div>
                          <h3 className={styles.categoryTitle}>
                            {activeCategory.title}
                          </h3>
                          <p className={styles.categorySubtitle}>
                            {activeCategory.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className={styles.factList}>
                        {activeCategory.facts.map((fact, index) => (
                          <div
                            className={styles.fact}
                            key={fact.id}
                            style={{ "--i": index } as CSSProperties}
                          >
                            <span className={styles.factIcon} aria-hidden="true">
                              {fact.icon}
                            </span>
                            <span className={styles.factText}>{fact.text}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        className={styles.backButton}
                        onClick={handleBack}
                      >
                        <span aria-hidden="true">← </span>BACK TO ARCADE
                      </button>
                    </div>
                  ) : (
                    /* ---- Category select screen ---- */
                    <div className={styles.menu}>
                      <h3 className={styles.screenHeading}>SELECT A STAGE</h3>
                      <p className={styles.screenHint}>
                        Six little worlds. Pick one to explore.
                      </p>
                      <div
                        className={styles.categoryGrid}
                        role="group"
                        aria-label="Arcade categories"
                      >
                        {arcadeCategories.map((category, index) => {
                          const played = visited.includes(category.id);
                          return (
                            <button
                              key={category.id}
                              type="button"
                              className={`${styles.categoryCard} ${played ? styles.cardVisited : ""}`}
                              onClick={() => handleOpen(category)}
                              aria-label={`${category.title}: ${category.subtitle}${played ? ". Already explored" : ""}`}
                            >
                              <span className={styles.cardNum} aria-hidden="true">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <span className={styles.cardIcon} aria-hidden="true">
                                {category.icon}
                              </span>
                              <span className={styles.cardTitle}>{category.title}</span>
                              <span className={styles.cardSubtitle}>
                                {category.subtitle}
                              </span>
                              {played && (
                                <span className={styles.cardBadge} aria-hidden="true">
                                  PLAYED ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.screenGlare} aria-hidden="true" />
              </div>
            </div>

            <div className={styles.sideArt} aria-hidden="true">
              <span>✿</span>
              <span>♥</span>
              <span>✦</span>
              <span>★</span>
            </div>
          </div>

          {/* Control panel: joystick, progress, sound toggle */}
          <div className={styles.controlPanel}>
            <div className={styles.controlsDecor} aria-hidden="true">
              <span className={styles.joystick}>
                <span className={styles.joystickBall} />
              </span>
              <span className={styles.actionButtons}>
                <span className={styles.actionButton} />
                <span className={`${styles.actionButton} ${styles.actionButtonAlt}`} />
              </span>
            </div>

            <div
              className={styles.progress}
              aria-label={`${explored} of ${total} categories explored`}
            >
              <span className={styles.progressLabel}>
                EXPLORED {explored}/{total}
              </span>
              <span className={styles.pips} aria-hidden="true">
                {Array.from({ length: total }, (_, index) => (
                  <span
                    key={index}
                    className={`${styles.pip} ${index < explored ? styles.pipOn : ""}`}
                  />
                ))}
              </span>
            </div>

            <button
              type="button"
              className={`${styles.soundToggle} ${muted ? styles.soundOff : ""}`}
              onClick={() => setMuted((value) => !value)}
              aria-pressed={!muted}
              aria-label={muted ? "Turn sounds on" : "Turn sounds off"}
              title={muted ? "Sound off" : "Sound on"}
            >
              <span aria-hidden="true">{muted ? "♪" : "♫"}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
