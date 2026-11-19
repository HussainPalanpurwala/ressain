"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SRC = "/audio/california-dreamin.mp3";

export default function useBackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      setPlaying(true);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) await play();
    else {
      audio.pause();
      setPlaying(false);
    }
  }, [play]);

  const audio = (
    <audio
      ref={audioRef}
      src={SRC}
      loop
      preload="auto"
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onError={() => setError(true)}
    />
  );

  return { audio, audioRef, playing, volume, setVolume, error, play, toggle };
}
