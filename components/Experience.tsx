"use client";

import { useCallback, useEffect, useState } from "react";
import BootSequence from "./BootSequence";
import Landing from "./Landing";
import MusicPlayer from "./MusicPlayer";
import TimeTogether from "./TimeTogether";
import useBackgroundMusic from "./useBackgroundMusic";

export default function Experience() {
  const [entered, setEntered] = useState(false);
  const music = useBackgroundMusic();

  useEffect(() => {
    // A refresh should always begin at the top (header + boot), never from a
    // previously scrolled position deeper in the page.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  // The button click is a real user gesture, so start the song here — inside
  // the click handler — which is the only reliable way to allow autoplay.
  const handleEnter = useCallback(() => {
    void music.play();
    setEntered(true);
  }, [music.play]);

  return (
    <main>
      {music.audio}
      <Landing />
      <TimeTogether />
      {entered && (
        <MusicPlayer
          playing={music.playing}
          volume={music.volume}
          error={music.error}
          onVolumeChange={music.setVolume}
          onToggle={music.toggle}
        />
      )}
      {!entered && <BootSequence onEnter={handleEnter} />}
    </main>
  );
}
