"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./MusicPlayer.module.css";

const TRACK = "California Dreamin'";
const ARTIST = "The Mamas & The Papas";
const SRC = "/audio/california-dreamin.mp3";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setPlaying(true);
        setError(false);
      } catch {
        setError(true);
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <audio
        ref={audioRef}
        src={SRC}
        loop
        preload="none"
        onError={() => setError(true)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />

      {open && (
        <div className={styles.panel}>
          <span className={styles.label}>NOW PLAYING</span>
          <span className={styles.track}>{TRACK}</span>
          <span className={styles.artist}>{ARTIST}</span>

          <button type="button" className={styles.control} onClick={toggle}>
            {playing ? "❚❚ PAUSE" : "▶ PLAY"}
          </button>

          <label className={styles.volumeRow}>
            <span>VOL</span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(volume * 100)}
              onChange={(event) => setVolume(Number(event.target.value) / 100)}
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
        className={`${styles.vinyl} ${playing ? styles.spinning : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-label="Open music controls"
      >
        <span className={styles.vinylLabel}>R♥H</span>
      </button>
    </div>
  );
}
