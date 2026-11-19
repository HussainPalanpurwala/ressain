"use client";

import { useState } from "react";
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
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <div className={styles.bar}>
        <button
          type="button"
          className={styles.turntable}
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle music controls"
        >
          <span className={styles.deck}>
            <span
              className={`${styles.record} ${playing ? styles.spinning : ""}`}
            >
              <span className={styles.recordLabel}>R♥H</span>
            </span>
            <span className={styles.tonearm} />
            <span className={styles.tonearmPivot} />
            <span
              className={`${styles.status} ${playing ? styles.statusOn : ""}`}
            />
          </span>
        </button>

        <div className={styles.meta}>
          <span className={styles.label}>NOW PLAYING</span>
          <span className={styles.track}>{TRACK}</span>
          <span className={styles.artist}>{ARTIST}</span>
        </div>

        {open && (
          <div className={styles.details}>
            <div className={styles.seekRow}>
              <span className={styles.time}>{formattedTime}</span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={Math.min(currentTime, duration || 100)}
                onChange={(event) => onSeek(Number(event.target.value))}
                aria-label="Seek"
                className={styles.seek}
              />
              <span className={styles.time}>{formattedDuration}</span>
            </div>

            <label className={styles.volumeRow}>
              <span>VOL</span>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(volume * 100)}
                onChange={(event) =>
                  onVolumeChange(Number(event.target.value) / 100)
                }
                aria-label="Volume"
              />
              <span>{Math.round(volume * 100)}</span>
            </label>

            {error && (
              <span className={styles.hint}>
                Add the song file at public/audio/california-dreamin.mp3
              </span>
            )}
          </div>
        )}

        <button type="button" className={styles.control} onClick={onToggle}>
          {playing ? "❚❚ PAUSE" : "▶ PLAY"}
        </button>
      </div>
    </div>
  );
}
