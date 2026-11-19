"use client";

import { useState } from "react";
import styles from "./MusicPlayer.module.css";

type MusicPlayerProps = {
  playing: boolean;
  volume: number;
  error: boolean;
  onVolumeChange: (value: number) => void;
  onToggle: () => void;
};

const TRACK = "California Dreamin'";
const ARTIST = "The Mamas & The Papas";

export default function MusicPlayer({
  playing,
  volume,
  error,
  onVolumeChange,
  onToggle,
}: MusicPlayerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      {open && (
        <div className={styles.panel}>
          <span className={styles.label}>NOW PLAYING</span>
          <span className={styles.track}>{TRACK}</span>
          <span className={styles.artist}>{ARTIST}</span>

          <button type="button" className={styles.control} onClick={onToggle}>
            {playing ? "❚❚ PAUSE" : "▶ PLAY"}
          </button>

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

      <button
        type="button"
        className={styles.turntable}
        onClick={() => setOpen((value) => !value)}
        aria-label="Open music controls"
      >
        <span className={styles.deck}>
          <span
            className={`${styles.record} ${playing ? styles.spinning : ""}`}
          >
            <span className={styles.recordLabel}>R♥H</span>
          </span>
          <span className={styles.tonearm} />
          <span className={styles.tonearmPivot} />
          <span className={`${styles.status} ${playing ? styles.statusOn : ""}`} />
        </span>
      </button>
    </div>
  );
}
