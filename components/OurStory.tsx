"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type {
  StoryPhoto,
  StorySong,
  StoryTextBlock,
  StoryVideo,
} from "@/content/story";
import { story } from "@/content/story";
import styles from "./OurStory.module.css";

/* One paragraph per blank line in the copy; *word* becomes <em>word</em>. */
function Prose({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\s*\n/).map((paragraph, index) => (
        <p className={styles.storyText} key={index}>
          {paragraph.split(/(\*[^*]+\*)/g).map((part, partIndex) =>
            part.length > 2 && part.startsWith("*") && part.endsWith("*") ? (
              <em key={partIndex}>{part.slice(1, -1)}</em>
            ) : (
              <Fragment key={partIndex}>{part}</Fragment>
            )
          )}
        </p>
      ))}
    </>
  );
}

function TextPlaceholder({ block }: { block: StoryTextBlock }) {
  const hasText = block.text.trim().length > 0;
  return (
    <div className={styles.textPlaceholder} data-reveal>
      {hasText ? (
        <Prose text={block.text} />
      ) : (
        <>
          <span className={styles.phLabel}>[ {block.label} — text to be provided ]</span>
          <div className={styles.phLines} aria-hidden="true">
            {Array.from({ length: block.lines }, (_, index) => (
              <span key={index} style={{ width: `${94 - index * 9}%` }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PhotoPlaceholder({
  photo,
  onClick,
  placeholderText,
}: {
  photo: StoryPhoto;
  onClick: (photo: StoryPhoto) => void;
  placeholderText?: string;
}) {
  const { label, shape, src, caption } = photo;
  return (
    <button
      type="button"
      className={`${styles.photo} ${styles[shape]}`}
      onClick={() => onClick(photo)}
      aria-label={`Open ${label}`}
      data-reveal
    >
      <span className={styles.paperClip} aria-hidden="true" />
      {src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={label} />
          {caption && <span className={styles.photoCaption}>{caption}</span>}
        </>
      ) : (
        <span className={styles.photoInner}>
          <span className={styles.clip} aria-hidden="true" />
          <span className={styles.photoIcon} aria-hidden="true">
            ▧
          </span>
          <span className={styles.phLabel}>
            {placeholderText ?? `[ ${label} — photo to be provided ]`}
          </span>
          <span className={styles.photoCaption}>[ handwritten caption to be provided ]</span>
        </span>
      )}
    </button>
  );
}

function VideoPlaceholder({ video }: { video: StoryVideo }) {
  const [active, setActive] = useState(false);
  const { label, featured, src } = video;
  return (
    <div
      className={`${styles.video} ${featured ? styles.videoFeatured : ""}`}
      data-reveal
    >
      <div className={styles.videoThumb}>
        {src ? (
          <video src={src} controls playsInline preload="metadata" />
        ) : (
          <span className={styles.phLabel}>
            [ {label} — {active ? "video playback here" : "video to be provided"} ]
          </span>
        )}
      </div>
      <button
        type="button"
        className={styles.playButton}
        onClick={() => setActive((value) => !value)}
      >
        {active ? "❚❚ PAUSE" : "▶ PLAY"}
      </button>
    </div>
  );
}

function SongDetail({ song }: { song: StorySong }) {
  const hasSong = song.title.trim() || song.artist.trim() || song.lyrics.trim();
  if (!hasSong) return <span className={styles.phLabel}>{song.label}</span>;
  return (
    <div>
      {song.title && <span className={styles.letterHeading}>{song.title}</span>}
      {song.artist && <span className={styles.phLabel}>{song.artist}</span>}
      {song.lyrics && <Prose text={song.lyrics} />}
    </div>
  );
}

export default function OurStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const [lightbox, setLightbox] = useState<StoryPhoto | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const items = Array.from(
      section.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    items.forEach((item) => item.classList.add(styles.reveal));

    // Scroll-driven so the pop-in builds as you enter each piece and reverses
    // when you scroll back up — not a one-time reveal.
    let frame = 0;
    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const isMobile = window.matchMedia("(max-width: 760px)").matches;
      // Start the reveal earlier — when the item is ~85% down the viewport —
      // and use a shorter scroll window so each pop completes faster while
      // still easing in and out smoothly. The value is recomputed from scroll
      // position every frame, so the effect still reverses when scrolling back up.
      const start = viewport * 0.85;
      const span = viewport * (isMobile ? 0.4 : 0.32);
      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const raw = Math.max(0, Math.min(1, (start - rect.top) / span));
        // Smootherstep on mobile (continuous first and second derivatives),
        // smoothstep elsewhere — both ease in and out instead of popping.
        const eased = isMobile
          ? raw * raw * raw * (raw * (raw * 6 - 15) + 10)
          : raw * raw * (3 - 2 * raw);
        item.style.setProperty("--seen", eased.toFixed(3));
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const { intro, memories, momentToRemember, personalNote } = story;
  const { beginning, conversations, surprise, palace, temple, train } = memories;

  return (
    <section ref={sectionRef} className={styles.section} id="our-story">
      <div className={styles.blendFromTimer} aria-hidden="true" />

      <div className={styles.intro} data-reveal>
        <h2 className={styles.sectionTitle}>{intro.title}</h2>
        <p className={styles.introLine}>{intro.line}</p>
      </div>

      <div className={styles.timeline}>
        <div className={styles.stitching} aria-hidden="true" />

        {/* 01 — The Beginning */}
        <article className={`${styles.memory} ${styles.memoryMinimal}`} data-reveal>
          <span className={styles.marker}>{beginning.marker}</span>
          <div className={styles.memoryBody}>
            <h3 className={styles.memoryTitle}>{beginning.title}</h3>
            <TextPlaceholder block={beginning.story} />
          </div>
        </article>

        {/* 02 — The Conversations */}
        <article className={`${styles.memory} ${styles.memoryLetter}`} data-reveal>
          <span className={styles.marker}>{conversations.marker}</span>
          <div className={styles.memoryBody}>
            <h3 className={styles.memoryTitle}>{conversations.title}</h3>
            <TextPlaceholder block={conversations.story} />
            <div className={styles.letterLayout}>
              <button
                type="button"
                className={styles.letterCard}
                onClick={() => setLetterOpen(true)}
                data-reveal
              >
                <span className={styles.letterSeal} aria-hidden="true">✦</span>
                <span className={styles.letterHeading}>{conversations.letter.heading}</span>
                <span className={styles.phLabel}>{conversations.letter.cardPreview}</span>
                <span className={styles.letterOpen}>{conversations.letter.readLabel}</span>
              </button>
              <div className={styles.videoStack}>
                <PhotoPlaceholder
                  photo={conversations.firstChatImage}
                  onClick={setLightbox}
                  placeholderText="[ chat image to be provided ]"
                />
                <PhotoPlaceholder
                  photo={conversations.secondChatImage}
                  onClick={setLightbox}
                  placeholderText="[ chat image to be provided ]"
                />
              </div>
            </div>
          </div>
        </article>

        {/* 03 — The Jammu Surprise */}
        <article className={`${styles.memory} ${styles.memorySurprise}`} data-reveal>
          <span className={styles.marker}>{surprise.marker}</span>
          <div className={styles.memoryBody}>
            <h3 className={styles.memoryTitle}>{surprise.title}</h3>
            <VideoPlaceholder video={surprise.reactionVideo} />
            <div className={styles.miniGallery}>
              {surprise.gallery.map((photo) => (
                <PhotoPlaceholder key={photo.label} photo={photo} onClick={setLightbox} />
              ))}
            </div>
            <TextPlaceholder block={surprise.story} />
          </div>
        </article>

        {/* 04 — Hari Niwas Palace */}
        <article className={`${styles.memory} ${styles.memoryPalace}`} data-reveal>
          <span className={styles.marker}>{palace.marker}</span>
          <div className={styles.memoryBody}>
            <h3 className={styles.memoryTitle}>{palace.title}</h3>
            <div className={styles.palaceTop}>
              <div className={styles.palacePhotoPair}>
                <PhotoPlaceholder photo={palace.bluePainting} onClick={setLightbox} />
                <PhotoPlaceholder photo={palace.blueSkyPhoto} onClick={setLightbox} />
              </div>
              <TextPlaceholder block={palace.blueSky} />
            </div>
            <div className={styles.palaceBottom}>
              <TextPlaceholder block={palace.drunkUncle} />
              <VideoPlaceholder video={palace.hidingVideo} />
            </div>
          </div>
        </article>

        {/* 05 — The Temple */}
        <article className={`${styles.memory} ${styles.memoryTemple}`} data-reveal>
          <span className={styles.marker}>{temple.marker}</span>
          <div className={styles.memoryBody}>
            <h3 className={styles.memoryTitle}>{temple.title}</h3>
            <TextPlaceholder block={temple.story} />
            <PhotoPlaceholder photo={temple.photo} onClick={setLightbox} />
          </div>
        </article>

        {/* 06 — The Missed Train */}
        <article className={`${styles.memory} ${styles.memoryTrain}`} data-reveal>
          <span className={styles.marker}>{train.marker}</span>
          <div className={styles.memoryBody}>
            <h3 className={styles.memoryTitle}>{train.title}</h3>
            <TextPlaceholder block={train.story} />
            <div className={styles.trainMotif} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        </article>
      </div>

      {/* Transition */}
      <div className={styles.transition} data-reveal>
        <h2 className={styles.transitionTitle}>{momentToRemember.title}</h2>
        <div className={styles.narrowReading}>
          <TextPlaceholder block={momentToRemember.text} />
          <TextPlaceholder block={momentToRemember.reflection} />
        </div>
      </div>

      {/* Personal note */}
      <div className={styles.note} data-reveal>
        <h2 className={styles.noteTitle}>{personalNote.title}</h2>
        <div className={styles.notePaper}>
          <p className={styles.noteNameStruck}>{personalNote.crossedName}</p>
          <p className={styles.noteNameBold}>{personalNote.boldName}</p>
          <TextPlaceholder block={personalNote.opening} />
          <TextPlaceholder block={personalNote.middle} />
          <TextPlaceholder block={personalNote.ending} />
          <div className={styles.songDetail}>
            <SongDetail song={personalNote.song} />
          </div>
        </div>
      </div>

      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <div className={styles.lightboxInner} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setLightbox(null)}
            >
              ✕
            </button>
            {lightbox.src ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lightbox.src} alt={lightbox.label} />
                {lightbox.caption && <span className={styles.photoCaption}>{lightbox.caption}</span>}
              </>
            ) : (
              <span className={styles.phLabel}>
                [ {lightbox.label} {story.lightbox.photoLabel} ]
              </span>
            )}
          </div>
        </div>
      )}

      {letterOpen && (
        <div className={styles.lightbox} onClick={() => setLetterOpen(false)}>
          <div
            className={`${styles.lightboxInner} ${styles.letterReading}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setLetterOpen(false)}
            >
              ✕
            </button>
            <h3 className={styles.memoryTitle}>{conversations.letter.heading}</h3>
            <TextPlaceholder block={conversations.letter.fullText} />
          </div>
        </div>
      )}
    </section>
  );
}
