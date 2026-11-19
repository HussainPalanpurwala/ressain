"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  questions,
  type Question,
  type QuestionCategory,
  type QuestionDepth,
} from "@/content/questions";
import styles from "./CuriousCorner.module.css";
import usePrefersReducedMotion from "./usePrefersReducedMotion";

const STORAGE_KEY = "curious-corner:saved-questions";

/* Canonical ordering of the values declared by the Question interface. The
   actual chips are derived from the data so the UI can never disagree with it. */
const CATEGORY_ORDER: QuestionCategory[] = [
  "Deep & Philosophical",
  "Personal",
  "Hypothetical",
  "Playful & Random",
];
const DEPTH_ORDER: QuestionDepth[] = ["Light", "Medium", "Deep", "Very Deep"];

const presentCategories = new Set(questions.map((q) => q.category));
const presentDepths = new Set(questions.map((q) => q.depth));
const presentPerspectives = new Set(questions.map((q) => q.perspective));

const CATEGORIES: QuestionCategory[] = [
  ...CATEGORY_ORDER.filter((c) => presentCategories.has(c)),
  ...Array.from(presentCategories).filter((c) => !CATEGORY_ORDER.includes(c)),
];
const DEPTHS: QuestionDepth[] = [
  ...DEPTH_ORDER.filter((d) => presentDepths.has(d)),
  ...Array.from(presentDepths).filter((d) => !DEPTH_ORDER.includes(d)),
];

/* Purely decorative text repeated per reel strip. The two copies in each strip
   are identical so a -50% translate loops seamlessly. */
const REEL_LINE =
  "QUESTION!! QUESTION!! QUESTION!! QUESTION!! QUESTION!! QUESTION!! QUESTION!! QUESTION!! ";

/* Tiny Web Audio blips — synthesised on the fly, no files or dependencies.
   Kept short and punchy so they never upstage the card, with enough gain to be
   clearly audible. They remain fully optional via the sound toggle / mute. */
type Tone = {
  freq: number;
  duration: number;
  type?: OscillatorType;
  delay?: number;
  volume?: number;
  slideTo?: number;
};

const SOUNDS: Record<
  "surprise" | "another" | "save" | "tick" | "open" | "close",
  Tone[]
> = {
  // Short rising blip.
  surprise: [{ freq: 520, slideTo: 780, duration: 0.09, type: "square", volume: 0.15 }],
  // Higher two-step chirp — clearly distinct from "surprise".
  another: [
    { freq: 880, duration: 0.07, type: "square", volume: 0.13 },
    { freq: 1180, duration: 0.1, delay: 0.06, type: "square", volume: 0.12 },
  ],
  // Pleasant two-note confirm (E5 -> B5).
  save: [
    { freq: 659, duration: 0.12, type: "triangle", volume: 0.18 },
    { freq: 988, duration: 0.18, delay: 0.1, type: "triangle", volume: 0.16 },
  ],
  // Soft, quick tick for filter chips / clear.
  tick: [{ freq: 1300, duration: 0.035, type: "square", volume: 0.12 }],
  // Page-opening sweep (distinct from the blips and the confirm).
  open: [{ freq: 440, slideTo: 680, duration: 0.13, type: "triangle", volume: 0.14 }],
  // Page-closing sweep — the mirror of "open".
  close: [{ freq: 680, slideTo: 330, duration: 0.13, type: "triangle", volume: 0.14 }],
};

type DrawResult = { question: Question; remaining: number[] };

/* Display-only personalisation for the perspective badge. The question data,
   filters and saved matching keep their canonical "Me"/"You"/"Both" values —
   only the label rendered on screen is swapped. */
function perspectiveLabel(perspective: Question["perspective"]): string {
  if (perspective === "Me") return "Hussain";
  if (perspective === "You") return "Revleen";
  return perspective;
}

function filterQuestions(
  categories: QuestionCategory[],
  depths: QuestionDepth[]
): Question[] {
  if (categories.length === 0 && depths.length === 0) return questions;
  return questions.filter(
    (q) =>
      (categories.length === 0 || categories.includes(q.category)) &&
      (depths.length === 0 || depths.includes(q.depth))
  );
}

/* Pure draw: pick at random from a pool, preferring to avoid `excludeId`, and
   return the ids still available in that pool (the no-repeat remainder). */
function drawQuestion(
  pool: Question[],
  excludeId: number | null
): DrawResult | null {
  if (pool.length === 0) return null;
  const ids = pool.map((q) => q.id);
  let candidates = excludeId === null ? ids.slice() : ids.filter((id) => id !== excludeId);
  if (candidates.length === 0) candidates = ids.slice();
  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  const question = pool.find((q) => q.id === picked) ?? pool[0];
  return { question, remaining: ids.filter((id) => id !== picked) };
}

function isQuestion(value: unknown): value is Question {
  if (typeof value !== "object" || value === null) return false;
  const q = value as Record<string, unknown>;
  return (
    typeof q.id === "number" &&
    Number.isFinite(q.id) &&
    typeof q.text === "string" &&
    q.text.trim().length > 0 &&
    typeof q.category === "string" &&
    presentCategories.has(q.category as QuestionCategory) &&
    typeof q.depth === "string" &&
    presentDepths.has(q.depth as QuestionDepth) &&
    typeof q.perspective === "string" &&
    presentPerspectives.has(q.perspective as Question["perspective"])
  );
}

function loadSaved(): Question[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<number>();
    const clean: Question[] = [];
    for (const item of parsed) {
      if (!isQuestion(item) || seen.has(item.id)) continue;
      seen.add(item.id);
      clean.push(item);
    }
    return clean;
  } catch {
    return [];
  }
}

export default function CuriousCorner() {
  const [selectedCategories, setSelectedCategories] = useState<QuestionCategory[]>([]);
  const [selectedDepths, setSelectedDepths] = useState<QuestionDepth[]>([]);
  const [current, setCurrent] = useState<Question | null>(null);
  const [remaining, setRemaining] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [saved, setSaved] = useState<Question[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [muted, setMuted] = useState(false);

  const currentIdRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  // Close the audio context when the section unmounts.
  useEffect(() => () => {
    void audioCtxRef.current?.close();
    audioCtxRef.current = null;
  }, []);

  /* Synthesise a short sound. The context is created lazily *inside* a click
     handler (a real user gesture), which is what mobile browsers require before
     they grant audio access. No sound is ever queued ahead of a gesture. */
  const playSound = (name: keyof typeof SOUNDS) => {
    if (muted || reduceMotion || typeof window === "undefined") return;
    const AudioCtor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtor) return;

    const ctx = audioCtxRef.current ?? new AudioCtor();
    audioCtxRef.current = ctx;
    if (ctx.state === "suspended") void ctx.resume();

    const start = ctx.currentTime + 0.01;
    SOUNDS[name].forEach(
      ({ freq, duration, type = "triangle", delay = 0, volume = 0.14, slideTo }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const at = start + delay;

        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        if (slideTo) {
          osc.frequency.exponentialRampToValueAtTime(slideTo, at + duration);
        }

        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(volume, at + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(at);
        osc.stop(at + duration + 0.02);
      }
    );
  };

  const eligible = useMemo(
    () => filterQuestions(selectedCategories, selectedDepths),
    [selectedCategories, selectedDepths]
  );

  const isSaved = current !== null && saved.some((q) => q.id === current.id);
  const filtersActive = selectedCategories.length > 0 || selectedDepths.length > 0;

  // Initialise storage only on the client, then persist only after hydration so
  // the first (empty) render can never overwrite the saved collection.
  useEffect(() => {
    setSaved(loadSaved());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      /* Storage may be unavailable (private mode / quota): keep working in memory. */
    }
  }, [saved, hydrated]);

  // Start with a random card from the full collection. The initial server and
  // client render both show the placeholder, so hydration stays safe.
  useEffect(() => {
    const result = drawQuestion(questions, null);
    if (!result) return;
    setCurrent(result.question);
    currentIdRef.current = result.question.id;
    setRemaining(result.remaining);
    setPage((p) => p + 1);
  }, []);

  const applyPool = useCallback((pool: Question[]) => {
    const result = drawQuestion(pool, currentIdRef.current);
    setCurrent(result?.question ?? null);
    currentIdRef.current = result?.question.id ?? null;
    setRemaining(result?.remaining ?? []);
    setPage((p) => p + 1);
  }, []);

  const drawNext = useCallback(() => {
    const pool = eligible;
    if (pool.length === 0) return;
    const poolIds = new Set(pool.map((q) => q.id));
    let available = remaining.filter((id) => poolIds.has(id));
    // Reset only this eligible pool when it is exhausted (or filters changed).
    if (available.length === 0) available = pool.map((q) => q.id);

    let candidates = available;
    const exclude = currentIdRef.current;
    if (exclude !== null && candidates.length > 1) {
      candidates = candidates.filter((id) => id !== exclude);
    }
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    const question = pool.find((q) => q.id === picked);
    if (!question) return;

    setRemaining(available.filter((id) => id !== picked));
    setCurrent(question);
    currentIdRef.current = question.id;
    setPage((p) => p + 1);
  }, [eligible, remaining]);

  const toggleCategory = (category: QuestionCategory) => {
    playSound("tick");
    const next = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(next);
    applyPool(filterQuestions(next, selectedDepths));
  };

  const toggleDepth = (depth: QuestionDepth) => {
    playSound("tick");
    const next = selectedDepths.includes(depth)
      ? selectedDepths.filter((d) => d !== depth)
      : [...selectedDepths, depth];
    setSelectedDepths(next);
    applyPool(filterQuestions(selectedCategories, next));
  };

  const clearFilters = () => {
    playSound("tick");
    setSelectedCategories([]);
    setSelectedDepths([]);
    applyPool(questions);
  };

  const saveCurrent = () => {
    if (!current || isSaved) return;
    playSound("save");
    setSaved((prev) => (prev.some((q) => q.id === current.id) ? prev : [...prev, current]));
  };

  const toggleSavedPanel = () => {
    playSound(showSaved ? "close" : "open");
    setShowSaved((open) => !open);
  };

  const removeSaved = (id: number) => {
    setSaved((prev) => prev.filter((q) => q.id !== id));
  };

  const depthLevel = (depth: QuestionDepth) => {
    const index = DEPTH_ORDER.indexOf(depth);
    return index === -1 ? 1 : index + 1;
  };

  return (
    <section
      className={styles.section}
      id="the-curious-corner"
      aria-labelledby="curious-corner-heading"
      aria-describedby="curious-corner-subtitle"
    >
      <div className={styles.reelBackground} aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => (
          <div className={styles.reelStrip} key={i}>
            <span className={styles.reelText}>{REEL_LINE}</span>
            <span className={styles.reelText}>{REEL_LINE}</span>
          </div>
        ))}
      </div>

      <div className={styles.inner}>
        <header className={styles.intro}>
          <h2 id="curious-corner-heading" className={styles.heading}>
            The Curious Corner
          </h2>
          <p id="curious-corner-subtitle" className={styles.subtitle}>
            For all the questions we haven&apos;t thought to ask yet.
          </p>
        </header>

        <div className={styles.topbar}>
          <span className={styles.cardTag} aria-hidden="true">
            {current ? `NO. ${String(current.id).padStart(3, "0")}` : "···"}
          </span>
          <div className={styles.topbarActions}>
            <button
              type="button"
              className={`${styles.soundToggle} ${muted ? styles.soundToggleOff : ""}`}
              onClick={() => setMuted((on) => !on)}
              aria-pressed={muted}
              aria-label={muted ? "Turn sounds on" : "Turn sounds off"}
              title={muted ? "Sounds off" : "Sounds on"}
            >
              <span aria-hidden="true">{muted ? "♪" : "♫"}</span>
            </button>
            <button
              type="button"
              className={styles.savedToggle}
              onClick={toggleSavedPanel}
              aria-expanded={showSaved}
              aria-controls="curious-corner-panel"
            >
              <span aria-hidden="true">♥</span>
              <span>My Saved Questions</span>
              {saved.length > 0 && (
                <span className={styles.count} aria-label={`${saved.length} saved`}>
                  {saved.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div
          id="curious-corner-panel"
          className={styles.panel}
          role="region"
          aria-label={showSaved ? "My Saved Questions" : "Question generator"}
        >
          {showSaved ? (
            <div className={styles.journal}>
              <div className={styles.journalHead}>
                <h3 className={styles.journalTitle}>My Saved Questions</h3>
                <span className={styles.count} aria-hidden="true">
                  {saved.length}
                </span>
              </div>

              {saved.length === 0 ? (
                <p className={styles.journalEmpty}>Nothing saved yet.</p>
              ) : (
                <ol className={styles.savedList}>
                  {saved.map((q, index) => (
                    <li key={q.id} className={styles.savedItem}>
                      <span className={styles.savedIndex} aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className={styles.savedBody}>
                        <span className={styles.savedMeta}>
                          {q.category} · {q.depth} · {q.perspective}
                        </span>
                        <p className={styles.savedText}>{q.text}</p>
                      </div>
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeSaved(q.id)}
                        aria-label={`Remove saved question: ${q.text}`}
                      >
                        <span aria-hidden="true">✕</span>
                      </button>
                    </li>
                  ))}
                </ol>
              )}

              <div className={styles.journalActions}>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => {
                    playSound("close");
                    setShowSaved(false);
                  }}
                >
                  Back to generator
                </button>
                <button
                  type="button"
                  className={styles.danger}
                  onClick={() => setSaved([])}
                  disabled={saved.length === 0}
                >
                  Remove all
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.generator}>
              <div className={styles.moods} role="group" aria-labelledby="moods-label">
                <p id="moods-label" className={styles.moodsTitle}>
                  Choose Your Mood
                </p>
                <div className={styles.filterGroups}>
                  <div className={styles.filterGroup} role="group" aria-label="Category">
                    <span className={styles.groupLabel} aria-hidden="true">CATEGORY</span>
                    <div className={styles.chips}>
                      {CATEGORIES.map((category) => (
                        <button
                          key={category}
                          type="button"
                          className={`${styles.chip} ${selectedCategories.includes(category) ? styles.chipOn : ""}`}
                          onClick={() => toggleCategory(category)}
                          aria-pressed={selectedCategories.includes(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.filterGroup} role="group" aria-label="Depth">
                    <span className={styles.groupLabel} aria-hidden="true">DEPTH</span>
                    <div className={styles.chips}>
                      {DEPTHS.map((depth) => (
                        <button
                          key={depth}
                          type="button"
                          className={`${styles.chip} ${selectedDepths.includes(depth) ? styles.chipOn : ""}`}
                          onClick={() => toggleDepth(depth)}
                          aria-pressed={selectedDepths.includes(depth)}
                        >
                          {depth}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={clearFilters}
                  disabled={!filtersActive}
                >
                  Clear filters <span>/ Full collection</span>
                </button>
              </div>

              <div className={styles.card}>
                <span className={styles.tape} aria-hidden="true" />
                <div className={styles.cardStage} aria-live="polite" aria-atomic="true">
                  <div className={styles.cardInner} key={page}>
                    {current ? (
                      <>
                        <div className={styles.meta}>
                          <span className={styles.category}>{current.category}</span>
                          <span
                            className={styles.depth}
                            aria-label={`Depth: ${current.depth}`}
                          >
                            <span className={styles.pips} aria-hidden="true">
                              {Array.from({ length: DEPTH_ORDER.length }, (_, i) => (
                                <span
                                  key={i}
                                  className={`${styles.pip} ${i < depthLevel(current.depth) ? styles.pipOn : ""}`}
                                />
                              ))}
                            </span>
                            <span>{current.depth}</span>
                          </span>
                          <span className={styles.perspective}>
                            {perspectiveLabel(current.perspective)}
                          </span>
                        </div>
                        <span className={styles.questionLabel} aria-hidden="true">QUESTION</span>
                        <p className={styles.questionText}>{current.text}</p>
                      </>
                    ) : (
                      <p className={styles.empty}>No questions match this mood.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => {
                    playSound("surprise");
                    drawNext();
                  }}
                  disabled={!current}
                >
                  Surprise Me
                </button>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => {
                    playSound("another");
                    drawNext();
                  }}
                  disabled={!current || eligible.length < 2}
                >
                  Another Question
                </button>
                <button
                  type="button"
                  className={`${styles.secondary} ${isSaved ? styles.isSaved : ""}`}
                  onClick={saveCurrent}
                  disabled={!current}
                  aria-pressed={isSaved}
                >
                  {isSaved ? <span aria-hidden="true">♥ </span> : null}
                  {isSaved ? "Saved" : "Save Question"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
