"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SRC = "/audio/california-dreamin.mp3";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export default function useBackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Attach natively: metadata can load before React's synthetic media handlers
  // are attached, which otherwise leaves duration stuck at the fallback.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateDuration = () =>
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const updateTime = () => setCurrentTime(audio.currentTime);
    updateDuration();
    updateTime();
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("timeupdate", updateTime);
    return () => {
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("timeupdate", updateTime);
    };
  }, []);

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

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const audio = (
    <audio
      ref={audioRef}
      src={SRC}
      loop
      preload="auto"
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onError={() => setError(true)}
      onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
      onDurationChange={(event) => setDuration(event.currentTarget.duration)}
      onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
    />
  );

  return {
    audio,
    audioRef,
    playing,
    volume,
    setVolume,
    error,
    play,
    toggle,
    currentTime,
    duration,
    formattedTime: formatTime(currentTime),
    formattedDuration: formatTime(duration),
    seek,
  };
}
