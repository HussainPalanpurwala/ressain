"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties } from "react";
import styles from "./MusicPlayer.module.css";

type MusicPlayerProps = {
  playing: boolean;
  volume: number;
  error: boolean;
  currentTime: number;
  duration: number;
  formattedTime: string;
  formattedDuration: string;
  onVolumeChange: (value: number) => void;
  onToggle: () => void;
  onSeek: (time: number) => void;
};

const TRACK = "California Dreamin'";
const ARTIST = "The Mamas & The Papas";

export default function MusicPlayer({
  playing,
  volume,
  error,
  currentTime,
  duration,
  formattedTime,
  formattedDuration,
  onVolumeChange,
  onToggle,
  onSeek,
}: MusicPlayerProps) {
  const [expanded, setExpanded] = useState(false);
  const [showIntroLabel, setShowIntroLabel] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // Visual-only values for the custom slider fills. All playback state still
  // comes from the props; these just paint the "played" portion of each track.
  const seekMax = duration || 100;
  const seekValue = Math.min(currentTime, seekMax);
  const seekFill = seekMax > 0 ? (seekValue / seekMax) * 100 : 0;
  const volumeValue = Math.round(volume * 100);

  // On first load show the "MUSIC CONTROL" tooltip for 10s, then let it fall
  // back to hover/focus-only behaviour. Cleanup clears the timer on unmount.
  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntroLabel(false), 10000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!expanded) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpanded(false);
        toggleRef.current?.focus();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setExpanded(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [expanded]);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div
        className={styles.panel}
        id={panelId}
        role="group"
        aria-label="Music control"
        hidden={!expanded}
      >
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>♫ MUSIC CONTROL</span>
          <span className={styles.headerLine} aria-hidden="true" />
        </div>

        <div className={styles.trackInfo}>
          <span className={styles.track}>{TRACK}</span>
          <span className={styles.artist}>{ARTIST}</span>
        </div>

        <div className={styles.controls}>
          <div className={styles.seekBlock}>
            <input
              type="range"
              min="0"
              max={seekMax}
              step="0.1"
              value={seekValue}
              onChange={(event) => onSeek(Number(event.target.value))}
              aria-label="Seek"
              className={`${styles.slider} ${styles.seek}`}
              style={{ "--fill": `${seekFill}%` } as CSSProperties}
            />
            <div className={styles.timeRow}>
              <span className={styles.timeCurrent}>{formattedTime}</span>
              <span className={styles.timeTotal}>{formattedDuration}</span>
            </div>
          </div>

          <div className={styles.volumeBlock}>
            <svg
              className={styles.volumeIcon}
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M3 9h3.5L11 5v14l-4.5-4H3V9Z" />
              <path d="M14 8.6a5 5 0 0 1 0 6.8l1.4-1.4a3 3 0 0 0 0-4L14 8.6Z" />
            </svg>
            <input
              type="range"
              min="0"
              max="100"
              value={volumeValue}
              onChange={(event) =>
                onVolumeChange(Number(event.target.value) / 100)
              }
              aria-label="Volume"
              className={`${styles.slider} ${styles.volume}`}
              style={{ "--fill": `${volumeValue}%` } as CSSProperties}
            />
          </div>

          {error && (
            <span className={styles.hint}>
              Add the song file at public/audio/california-dreamin.mp3
            </span>
          )}

          <button
            type="button"
            className={styles.control}
            onClick={onToggle}
            aria-label={playing ? "Pause music" : "Play music"}
          >
            {playing ? "❚❚ PAUSE" : "▶ PLAY"}
          </button>
        </div>
      </div>

      <div className={styles.toggleArea}>
        <span
          className={`${styles.hoverLabel} ${showIntroLabel ? styles.hoverLabelIntro : ""}`}
          aria-hidden="true"
        >
          MUSIC CONTROL
        </span>
        <button
          ref={toggleRef}
          type="button"
          className={styles.turntable}
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls={panelId}
          aria-label={expanded ? "Collapse music control" : "Expand music control"}
        >
          <span className={styles.deck} aria-hidden="true">
            <span
              className={`${styles.record} ${playing ? styles.spinning : ""}`}
            />
            <span className={styles.tonearm} />
            <span className={styles.tonearmPivot} />
            <span
              className={`${styles.status} ${playing ? styles.statusOn : ""}`}
            />
          </span>
          <span className={styles.musicIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M9 18V6.6l10-2.1v11.3a3.3 3.3 0 1 1-2-3V7.4L11 9.1V18a3.3 3.3 0 1 1-2-3Z" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
