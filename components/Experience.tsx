"use client";

import { useCallback, useEffect, useState } from "react";
import BootSequence from "./BootSequence";
import CuriousCorner from "./CuriousCorner";
import Landing from "./Landing";
import { MediaProvider, useMedia } from "./MediaCoordinator";
import MusicPlayer from "./MusicPlayer";
import OpenWhen from "./OpenWhen";
import OurStory from "./OurStory";
import RevleenArcade from "./RevleenArcade";
import Soundtrack from "./Soundtrack";
import TimeTogether from "./TimeTogether";
import WrittenInStars from "./WrittenInStars";

function ExperienceContent() {
  const [entered, setEntered] = useState(false);
  const { music, startMusic } = useMedia();

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
    startMusic();
    setEntered(true);
  }, [startMusic]);

  return (
    <main className={entered ? "app-main--player" : undefined}>
      {music.audio}
      <Landing />
      <TimeTogether />
      <OurStory />
      <CuriousCorner />
      <Soundtrack />
      <OpenWhen />
      <WrittenInStars />
      <RevleenArcade />
      {entered && (
        <MusicPlayer
          playing={music.playing}
          volume={music.volume}
          error={music.error}
          currentTime={music.currentTime}
          duration={music.duration}
          formattedTime={music.formattedTime}
          formattedDuration={music.formattedDuration}
          onVolumeChange={music.setVolume}
          onToggle={music.toggle}
          onSeek={music.seek}
        />
      )}
      {!entered && <BootSequence onEnter={handleEnter} />}
    </main>
  );
}

export default function Experience() {
  return (
    <MediaProvider>
      <ExperienceContent />
    </MediaProvider>
  );
}
