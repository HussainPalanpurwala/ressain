"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  categoryMessages,
  quizCategories,
  quizQuestions,
  scoreTitles,
  type QuizCategoryId,
} from "@/content/arcadeQuiz";
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

type SoundName =
  | "start"
  | "hover"
  | "click"
  | "select"
  | "correct"
  | "incorrect"
  | "transition"
  | "category"
  | "count"
  | "victory"
  | "back";

type Phase = "attract" | "playing" | "categoryDone" | "results";

type AnswerRecord = {
  originalIndex: number;
  correct: boolean;
  category: QuizCategoryId;
};

/* Short synthesised blips — no files, no dependencies, no continuous audio.
   Every sound is a one-shot fired by a real interaction (or by the finite
   results count-up). Volumes stay low so the cabinet never upstages the page. */
const SOUNDS: Record<SoundName, Tone[]> = {
  // Power-on arpeggio for START GAME / PLAY AGAIN.
  start: [
    { freq: 523, duration: 0.1, volume: 0.09 },
    { freq: 659, duration: 0.1, delay: 0.09, volume: 0.09 },
    { freq: 784, duration: 0.1, delay: 0.18, volume: 0.09 },
    { freq: 1047, duration: 0.2, delay: 0.27, volume: 0.1 },
  ],
  // Very quiet hover tick.
  hover: [{ freq: 960, duration: 0.025, type: "sine", volume: 0.022 }],
  // Generic button click.
  click: [
    { freq: 620, duration: 0.045, type: "square", volume: 0.05 },
    { freq: 880, duration: 0.035, delay: 0.035, type: "square", volume: 0.035 },
  ],
  // Answer selection acknowledge beep.
  select: [{ freq: 540, duration: 0.06, type: "square", volume: 0.055 }],
  // Cheerful 8-bit ascending success.
  correct: [
    { freq: 523, duration: 0.09, volume: 0.06 },
    { freq: 659, duration: 0.09, delay: 0.08, volume: 0.06 },
    { freq: 784, duration: 0.09, delay: 0.16, volume: 0.06 },
    { freq: 1047, duration: 0.16, delay: 0.24, volume: 0.07 },
  ],
  // Playful low buzzer for a wrong answer.
  incorrect: [
    { freq: 250, slideTo: 150, duration: 0.18, type: "sawtooth", volume: 0.055 },
    {
      freq: 190,
      slideTo: 120,
      duration: 0.2,
      delay: 0.14,
      type: "sawtooth",
      volume: 0.045,
    },
  ],
  // Short sweep as the next question slides in.
  transition: [
    { freq: 420, slideTo: 660, duration: 0.1, type: "triangle", volume: 0.05 },
  ],
  // Small jingle when a category is cleared.
  category: [
    { freq: 523, duration: 0.08, volume: 0.055 },
    { freq: 659, duration: 0.08, delay: 0.07, volume: 0.055 },
    { freq: 784, duration: 0.08, delay: 0.14, volume: 0.055 },
    { freq: 1047, duration: 0.14, delay: 0.21, volume: 0.06 },
  ],
  // Single retro tick, pitched up per step by the results count-up.
  count: [{ freq: 600, duration: 0.035, type: "square", volume: 0.04 }],
  // Short victory fanfare at game finish.
  victory: [
    { freq: 523, duration: 0.12, volume: 0.07 },
    { freq: 659, duration: 0.12, delay: 0.11, volume: 0.07 },
    { freq: 784, duration: 0.12, delay: 0.22, volume: 0.07 },
    { freq: 1047, duration: 0.26, delay: 0.33, volume: 0.08 },
    { freq: 784, duration: 0.1, delay: 0.62, volume: 0.06 },
    { freq: 1047, duration: 0.3, delay: 0.72, volume: 0.08 },
  ],
  // Falling sweep when returning to the arcade.
  back: [
    { freq: 700, slideTo: 330, duration: 0.13, type: "triangle", volume: 0.08 },
  ],
};

// Same category emojis/colours as the original cabinet, keyed by quiz id.
const CATEGORY_ICONS: Record<QuizCategoryId, string> = {
  food: "🍜",
  flowers: "🌸",
  movies: "🎬",
  world: "🌍",
  random: "✨",
  future: "🔮",
};

const FLAVOUR: Record<QuizCategoryId, string> = {
  food: styles.flavourFood,
  flowers: styles.flavourFlowers,
  movies: styles.flavourMovies,
  world: styles.flavourWorld,
  random: styles.flavourRandom,
  future: styles.flavourFuture,
};

const TOTAL = quizQuestions.length;
const CATEGORY_TOTAL = quizCategories.length;

// Returns a permutation where order[displaySlot] = original option index.
// The correct answer keeps its original index, so scoring stays accurate.
function shuffledOrder(): number[] {
  const order = [0, 1, 2, 3];
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export default function RevleenArcade() {
  const [phase, setPhase] = useState<Phase>("attract");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [shuffles, setShuffles] = useState<number[][]>([]);
  const [answers, setAnswers] = useState<(AnswerRecord | null)[]>(() =>
    quizQuestions.map(() => null)
  );
  const [completedCategory, setCompletedCategory] =
    useState<QuizCategoryId | null>(null);
  const [countShown, setCountShown] = useState(0);
  const [muted, setMuted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timersRef = useRef<number[]>([]);
  const lastSoundRef = useRef(0);
  const resultsPlayedRef = useRef(false);

  // Mutable mirrors so one-shot timers read the current mute/motion state.
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
     mobile browsers require before granting audio access. Nothing plays on load. */
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

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((timer) => timer !== id);
      fn();
    }, delay);
    timersRef.current.push(id);
  }, []);

  // Cancel pending one-shots and close the audio context on unmount.
  useEffect(
    () => () => {
      clearTimers();
      void audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
    },
    [clearTimers]
  );

  // throttleMs (when provided) prevents rapid hovers/clicks from stacking.
  const playSound = useCallback(
    (name: SoundName, throttleMs = 0) => {
      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      if (throttleMs > 0 && now - lastSoundRef.current < throttleMs) return;
      lastSoundRef.current = now;
      playTones(SOUNDS[name]);
    },
    [playTones]
  );

  const playHover = useCallback(() => playSound("hover", 140), [playSound]);
  const playClick = useCallback(() => playSound("click", 40), [playSound]);

  // ---- Derived quiz state ----
  const question = quizQuestions[qIndex];
  const category =
    quizCategories.find((item) => item.id === question.category) ??
    quizCategories[0];
  const order = shuffles[qIndex] ?? [0, 1, 2, 3];
  const isLocked = selected !== null;
  const isCorrect = selected !== null && order[selected] === question.correctIndex;
  const score = answers.reduce((sum, answer) => sum + (answer?.correct ? 1 : 0), 0);
  const answeredCount = answers.reduce((sum, answer) => sum + (answer ? 1 : 0), 0);
  const progressPct = Math.round((answeredCount / TOTAL) * 100);
  const categoriesDone = quizCategories.filter((item) =>
    quizQuestions
      .filter((quizQuestion) => quizQuestion.category === item.id)
      .every((quizQuestion) => answers[quizQuestion.id - 1])
  ).length;

  const doneCat = completedCategory ?? question.category;
  const catQuestions = quizQuestions.filter((item) => item.category === doneCat);
  const catCorrect = answers.filter(
    (answer) => answer?.category === doneCat && answer.correct
  ).length;
  let catMessageKey: keyof typeof categoryMessages = "none";
  if (catCorrect === catQuestions.length && catQuestions.length > 0) {
    catMessageKey = "perfect";
  } else if (catCorrect > catQuestions.length / 2) {
    catMessageKey = "most";
  } else if (catCorrect >= 1) {
    catMessageKey = "few";
  } else {
    catMessageKey = "none";
  }
  const celebrate = catMessageKey === "perfect" || catMessageKey === "most";

  const band =
    scoreTitles.find((item) => score >= item.min && score <= item.max) ??
    scoreTitles[0];
  const percent = Math.round((score / TOTAL) * 100);

  // Results: fanfare once, then a finite retro count-up with pitched blips.
  useEffect(() => {
    if (phase !== "results" || resultsPlayedRef.current) return;
    resultsPlayedRef.current = true;
    playSound("victory");
    if (reduceRef.current) {
      setCountShown(score);
      return;
    }
    for (let step = 1; step <= score; step += 1) {
      schedule(() => {
        setCountShown(step);
        playTones(
          SOUNDS.count.map((tone) => ({ ...tone, freq: 320 + step * 26 }))
        );
      }, 1120 + step * 70);
    }
  }, [phase, score, playSound, playTones, schedule]);

  const resetRound = useCallback(() => {
    setShuffles(quizQuestions.map(() => shuffledOrder()));
    setAnswers(quizQuestions.map(() => null));
    setQIndex(0);
    setSelected(null);
    setCompletedCategory(null);
    setCountShown(0);
    resultsPlayedRef.current = false;
  }, []);

  const handleStart = () => {
    clearTimers();
    playSound("start");
    resetRound();
    setPhase("playing");
  };

  const handleSelect = (position: number) => {
    if (isLocked) return;
    const originalIndex = order[position];
    const correct = originalIndex === question.correctIndex;
    setSelected(position);
    setAnswers((previous) => {
      const next = [...previous];
      next[qIndex] = {
        originalIndex,
        correct,
        category: question.category,
      };
      return next;
    });
    playSound("select", 40);
    // Layer the verdict a beat after the select beep so sounds never overlap.
    schedule(() => playSound(correct ? "correct" : "incorrect"), 70);
  };

  const goToNext = () => {
    setSelected(null);
    setQIndex((index) => index + 1);
    setPhase("playing");
  };

  const handleNext = () => {
    playClick();
    const nextQuestion = quizQuestions[qIndex + 1];
    if (!nextQuestion || nextQuestion.category !== question.category) {
      // Category wrap-up jingle instead of a question-transition sweep.
      schedule(() => playSound("category"), 55);
      setCompletedCategory(question.category);
      setPhase("categoryDone");
    } else {
      schedule(() => playSound("transition"), 55);
      goToNext();
    }
  };

  const handleCategoryContinue = () => {
    playClick();
    const nextQuestion = quizQuestions[qIndex + 1];
    if (!nextQuestion) {
      setPhase("results");
    } else {
      goToNext();
    }
  };

  const handlePlayAgain = () => {
    clearTimers();
    playSound("start");
    resetRound();
    setPhase("playing");
  };

  const handleReturn = () => {
    clearTimers();
    playSound("back");
    resetRound();
    setPhase("attract");
  };

  // Physical control-deck buttons reuse the exact same phase handlers as the
  // on-screen controls — no quiz logic is duplicated here.
  const isStageClear = phase === "categoryDone";
  // The machine buttons keep their fixed names. During a stage-clear they are
  // disabled so only the on-screen CONTINUE / EXIT buttons are usable.
  const handlePrimary = () => {
    if (phase === "attract") {
      handleStart();
    } else if (phase === "results") {
      handlePlayAgain();
    } else if (selected === null) {
      playClick();
    } else {
      handleNext();
    }
  };
  const physicalPrimaryLabel = "NEXT QUESTION";
  const physicalPrimaryAriaLabel = "Next question";

  return (
    <section
      className={styles.section}
      id="the-revleen-arcade"
      aria-labelledby="revleen-arcade-title"
      aria-describedby="revleen-arcade-subtitle"
    >
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
                THE REVLEEN ARCADE
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
                    A quiz about a very particular person — 24 questions, six stages.
                  </span>
                  <span className={styles.playerTag} aria-hidden="true">
                    1UP
                  </span>
                </div>

                <div className={styles.screenMain}>
                  {phase === "attract" ? (
                    /* ---- Attract screen ---- */
                    <div className={styles.attract}>
                      <p className={styles.ready}>READY, PLAYER ONE?</p>
                      <div className={styles.scores} aria-hidden="true">
                        <span>1UP 000000</span>
                        <span>HI {String(TOTAL * 1000).padStart(6, "0")}</span>
                      </div>
                      <button
                        type="button"
                        className={styles.startButton}
                        onClick={handleStart}
                        onMouseEnter={playHover}
                      >
                        START GAME
                      </button>
                      <p className={styles.pressStart} aria-hidden="true">
                        ▶ PRESS START ◀
                      </p>
                    </div>
                  ) : phase === "playing" ? (
                    /* ---- Quiz screen ---- */
                    <div className={styles.quiz} key={qIndex}>
                      <div className={styles.quizHud}>
                        <span className={styles.hudBlock}>
                          <span className={styles.hudLabel}>STAGE</span>
                          <span className={styles.hudValue}>{category.title}</span>
                        </span>
                        <span className={styles.hudBlock}>
                          <span className={styles.hudLabel}>QUESTION</span>
                          <span className={styles.hudValue}>
                            {String(qIndex + 1).padStart(2, "0")}/{TOTAL}
                          </span>
                        </span>
                        <span className={styles.hudBlock}>
                          <span className={styles.hudLabel}>SCORE</span>
                          <span className={`${styles.hudValue} ${styles.hudScore}`}>
                            {score}
                          </span>
                        </span>
                      </div>

                      <div
                        className={styles.progressTrack}
                        role="progressbar"
                        aria-label="Quiz progress"
                        aria-valuemin={0}
                        aria-valuemax={TOTAL}
                        aria-valuenow={answeredCount}
                      >
                        <div
                          className={styles.progressFill}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div
                        className={styles.categoryTrack}
                        role="group"
                        aria-label="Category progress"
                      >
                        {quizCategories.map((item, index) => {
                          const stageQuestions = quizQuestions.filter(
                            (quizQuestion) => quizQuestion.category === item.id
                          );
                          const done = stageQuestions.every(
                            (quizQuestion) => answers[quizQuestion.id - 1]
                          );
                          const current = item.id === question.category && !done;
                          return (
                            <span
                              key={item.id}
                              className={`${styles.catChip} ${done ? styles.chipDone : ""} ${current ? styles.chipCurrent : ""}`}
                              title={item.title}
                              aria-label={`${item.title}: ${done ? "complete" : current ? "current" : "upcoming"}`}
                            >
                              {done ? "✓" : String(index + 1).padStart(2, "0")}
                            </span>
                          );
                        })}
                      </div>

                      <h3 className={styles.questionText} id="quiz-question">
                        {question.question}
                      </h3>

                      <div
                        className={styles.options}
                        role="group"
                        aria-labelledby="quiz-question"
                      >
                        {order.map((originalIndex, position) => {
                          const text = question.options[originalIndex];
                          const letter = String.fromCharCode(65 + position);
                          const chosen = selected === position;
                          const correctSlot =
                            selected !== null &&
                            originalIndex === question.correctIndex;
                          const wrongSlot = chosen && !correctSlot;
                          const optionClass = [
                            styles.option,
                            isLocked ? styles.optionLocked : "",
                            correctSlot ? styles.optionCorrect : "",
                            wrongSlot ? styles.optionWrong : "",
                            correctSlot && !chosen ? styles.optionReveal : "",
                          ]
                            .filter(Boolean)
                            .join(" ");

                          return (
                            <button
                              key={position}
                              type="button"
                              className={optionClass}
                              onClick={() => handleSelect(position)}
                              onMouseEnter={playHover}
                              aria-label={`Option ${letter}: ${text}${correctSlot ? ", correct answer" : ""}`}
                              aria-disabled={isLocked}
                            >
                              <span className={styles.optionLetter} aria-hidden="true">
                                {letter}
                              </span>
                              <span className={styles.optionText}>{text}</span>
                              {chosen && correctSlot ? (
                                <span className={styles.optionMark} aria-hidden="true">
                                  ✓
                                </span>
                              ) : null}
                              {wrongSlot ? (
                                <span className={styles.optionMark} aria-hidden="true">
                                  ✕
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>

                      <p
                        className={`${styles.feedback} ${selected === null ? "" : isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`}
                        role="status"
                        aria-live="assertive"
                      >
                        {selected === null
                          ? "SELECT YOUR ANSWER"
                          : isCorrect
                            ? "✓ CORRECT! +1 POINT"
                            : `✕ NOT QUITE — IT WAS: ${question.options[question.correctIndex]}`}
                      </p>
                      {/* NEXT QUESTION / EXIT GAME now live on the cabinet's
                          control deck as the physical left-end buttons. */}
                    </div>
                  ) : phase === "categoryDone" ? (
                    /* ---- Category completion screen ---- */
                    <div
                      className={`${styles.categoryDone} ${FLAVOUR[doneCat]}`}
                      key={`stage-${doneCat}`}
                    >
                      <div className={styles.categoryHead}>
                        <span className={styles.categoryBigIcon} aria-hidden="true">
                          {CATEGORY_ICONS[doneCat]}
                        </span>
                        <div>
                          <h3 className={styles.categoryTitle}>STAGE CLEAR!</h3>
                          <p className={styles.categorySubtitle}>
                            {quizCategories.find((item) => item.id === doneCat)?.title}
                          </p>
                        </div>
                      </div>

                      {celebrate ? (
                        <div className={styles.celebrateBits} aria-hidden="true">
                          <span>★</span>
                          <span>✦</span>
                          <span>★</span>
                          <span>✿</span>
                        </div>
                      ) : null}

                      <p className={styles.catDoneScore}>
                        {catCorrect}/{catQuestions.length} CORRECT
                      </p>
                      <p className={styles.catDoneMessage}>
                        {categoryMessages[catMessageKey]}
                      </p>

                      <div className={styles.nextRow}>
                        <button
                          type="button"
                          className={styles.backButton}
                          onClick={handleCategoryContinue}
                          onMouseEnter={playHover}
                        >
                          {quizQuestions[qIndex + 1]
                            ? "CONTINUE"
                            : "SEE RESULTS"}{" "}
                          <span aria-hidden="true">→</span>
                        </button>
                      </div>

                      <div className={styles.exitRow}>
                        <button
                          type="button"
                          className={`${styles.backButton} ${styles.exitButton}`}
                          onClick={handleReturn}
                          onMouseEnter={playHover}
                        >
                          EXIT GAME
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ---- Results screen ---- */
                    <div className={styles.results}>
                      <p className={styles.ready}>GAME OVER · PLAYER ONE</p>
                      <div
                        className={styles.resultScore}
                        aria-label={`Final score ${score} out of ${TOTAL}`}
                        aria-live="off"
                      >
                        {countShown}
                        <span>/{TOTAL}</span>
                      </div>
                      <p className={styles.resultPercent}>{percent}% CORRECT</p>
                      <h3 className={styles.resultTitle}>{band.title}</h3>
                      <p className={styles.resultMessage}>{band.message}</p>
                      <div className={styles.resultActions}>
                        <button
                          type="button"
                          className={styles.startButton}
                          onClick={handlePlayAgain}
                          onMouseEnter={playHover}
                        >
                          PLAY AGAIN
                        </button>
                        <button
                          type="button"
                          className={styles.backButton}
                          onClick={handleReturn}
                          onMouseEnter={playHover}
                        >
                          <span aria-hidden="true">← </span>RETURN TO ARCADE
                        </button>
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

          {/* Control deck: physical NEXT / EXIT buttons, progress, sound */}
          <div className={styles.controlPanel}>
            <div className={styles.physicalControls}>
              <button
                type="button"
                className={`${styles.physicalButton} ${styles.physicalButtonNext}`}
                onClick={handlePrimary}
                disabled={isStageClear}
                aria-label={physicalPrimaryAriaLabel}
                title={physicalPrimaryAriaLabel}
                onMouseEnter={playHover}
              >
                <span className={styles.physicalButtonLabel}>{physicalPrimaryLabel}</span>
              </button>
              <button
                type="button"
                className={`${styles.physicalButton} ${styles.physicalButtonExit}`}
                onClick={handleReturn}
                disabled={isStageClear}
                aria-label="Exit game"
                title="Exit game"
                onMouseEnter={playHover}
              >
                <span className={styles.physicalButtonLabel}>EXIT GAME</span>
              </button>
            </div>

            <div
              className={styles.progress}
              aria-label={`${categoriesDone} of ${CATEGORY_TOTAL} stages complete`}
            >
              <span className={styles.progressLabel}>
                STAGES {categoriesDone}/{CATEGORY_TOTAL}
              </span>
              <span className={styles.pips} aria-hidden="true">
                {Array.from({ length: CATEGORY_TOTAL }, (_, index) => (
                  <span
                    key={index}
                    className={`${styles.pip} ${index < categoriesDone ? styles.pipOn : ""}`}
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
