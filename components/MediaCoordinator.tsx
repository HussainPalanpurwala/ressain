"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import useBackgroundMusic from "./useBackgroundMusic";

type MusicController = Omit<
  ReturnType<typeof useBackgroundMusic>,
  "playing" | "toggle"
> & {
  /** The user's INTENDED music state (not the momentary actual playback). */
  playing: boolean;
  toggle: () => void;
};

type MediaContextValue = {
  music: MusicController;
  startMusic: () => void;
  registerVideo: (element: HTMLVideoElement) => () => void;
  onVideoPlay: (element: HTMLVideoElement) => void;
  onVideoStop: (element: HTMLVideoElement) => void;
};

const MediaContext = createContext<MediaContextValue | null>(null);

/**
 * Single source of truth for media playback. The music's *intent* (what the
 * user wants) is tracked separately from its *actual* playback, so pausing it
 * for a video is never mistaken for the user manually pausing it.
 */
export function MediaProvider({ children }: { children: ReactNode }) {
  const raw = useBackgroundMusic();
  const [intent, setIntent] = useState(false);
  const intentRef = useRef(false);
  const activeVideos = useRef<Set<HTMLVideoElement>>(new Set());
  const knownVideos = useRef<Set<HTMLVideoElement>>(new Set());

  useEffect(() => {
    intentRef.current = intent;
  }, [intent]);

  const applyMusic = useCallback(() => {
    if (intentRef.current && activeVideos.current.size === 0) void raw.start();
    else raw.stop();
  }, [raw.start, raw.stop]);

  const startMusic = useCallback(() => {
    intentRef.current = true;
    setIntent(true);
    if (activeVideos.current.size === 0) void raw.start();
  }, [raw.start]);

  const toggleMusic = useCallback(() => {
    const next = !intentRef.current;
    intentRef.current = next;
    setIntent(next);
    if (next && activeVideos.current.size === 0) void raw.start();
    else raw.stop();
  }, [raw.start, raw.stop]);

  const onVideoPlay = useCallback(
    (element: HTMLVideoElement) => {
      // Only one video at a time — pausing others fires their onPause handlers,
      // but this element is already in the set so music stays paused.
      activeVideos.current.forEach((other) => {
        if (other !== element && !other.paused) other.pause();
      });
      activeVideos.current.add(element);
      raw.stop();
    },
    [raw.stop]
  );

  const onVideoStop = useCallback(
    (element: HTMLVideoElement) => {
      activeVideos.current.delete(element);
      if (activeVideos.current.size === 0 && intentRef.current) void raw.start();
    },
    [raw.start]
  );

  const registerVideo = useCallback(
    (element: HTMLVideoElement) => {
      knownVideos.current.add(element);
      // Scrolling away from a video pauses it, which consistently hands audio
      // back according to the user's intent — never starting it unexpectedly.
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting && !element.paused) element.pause();
        },
        { threshold: 0.1 }
      );
      observer.observe(element);
      return () => {
        observer.disconnect();
        knownVideos.current.delete(element);
        activeVideos.current.delete(element);
        if (!element.paused) element.pause();
        if (activeVideos.current.size === 0 && intentRef.current) void raw.start();
      };
    },
    [raw.start]
  );

  // Tear down cleanly if the whole experience unmounts.
  useEffect(() => {
    return () => {
      knownVideos.current.forEach((element) => {
        if (!element.paused) element.pause();
      });
      raw.stop();
    };
  }, [raw.stop]);

  const music = useMemo<MusicController>(
    () => ({ ...raw, playing: intent, toggle: toggleMusic }),
    [raw, intent, toggleMusic]
  );

  const value = useMemo<MediaContextValue>(
    () => ({ music, startMusic, registerVideo, onVideoPlay, onVideoStop }),
    [music, startMusic, registerVideo, onVideoPlay, onVideoStop]
  );

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
}

export function useMedia() {
  const context = useContext(MediaContext);
  if (!context) throw new Error("useMedia must be used inside MediaProvider");
  return context;
}

/** Hook used by every video element so all playback is centrally coordinated. */
export function useCoordinatedVideo() {
  const media = useMedia();
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return media.registerVideo(element);
  }, [media.registerVideo]);

  const handlePlay = useCallback(() => {
    setPlaying(true);
    if (ref.current) media.onVideoPlay(ref.current);
  }, [media.onVideoPlay]);

  const handleStop = useCallback(() => {
    setPlaying(false);
    if (ref.current) media.onVideoStop(ref.current);
  }, [media.onVideoStop]);

  const toggle = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    if (element.paused) {
      void element.play().catch(() => setPlaying(false));
    } else {
      element.pause();
    }
  }, []);

  return {
    ref,
    playing,
    toggle,
    videoEvents: {
      onPlay: handlePlay,
      onPause: handleStop,
      onEnded: handleStop,
      onError: handleStop,
    },
  };
}
