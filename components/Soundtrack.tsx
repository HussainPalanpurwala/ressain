import styles from "./Soundtrack.module.css";

// Every value below is a placeholder. No song name, artist or lyric is supplied.
const DETAILS = [
  { term: "SONG", placeholder: "[ song title to be provided ]" },
  { term: "ARTIST", placeholder: "[ artist to be provided ]" },
  { term: "LYRICS", placeholder: "[ selected lyrics to be provided ]" },
] as const;

// Purely decorative background details — no content, no interaction.
// Positions are percentages so the layer scales with the section.
const STARS = [
  { left: "7%", top: "26%", className: "starBlush", delay: "0s" },
  { left: "14%", top: "70%", className: "starCherry", delay: "1.1s" },
  { left: "23%", top: "40%", className: "starCream", delay: "0.5s" },
  { left: "78%", top: "22%", className: "starBlush", delay: "1.7s" },
  { left: "86%", top: "58%", className: "starCherry", delay: "0.8s" },
  { left: "93%", top: "37%", className: "starCream", delay: "2.1s" },
  { left: "41%", top: "13%", className: "starBlush", delay: "1.4s" },
  { left: "60%", top: "87%", className: "starCream", delay: "0.2s" },
] as const;

const HEARTS = [
  { left: "11%", top: "47%", className: "heartOne" },
  { left: "89%", top: "74%", className: "heartTwo" },
] as const;

const FLOWERS = [
  { left: "5%", top: "83%", className: "flowerOne" },
  { left: "94%", top: "16%", className: "flowerTwo" },
] as const;

export default function Soundtrack() {
  return (
    <section
      className={styles.section}
      id="our-soundtrack"
      aria-labelledby="soundtrack-heading"
    >
      <div className={styles.decor} aria-hidden="true">
        <div className={styles.wave}>
          <svg viewBox="0 0 600 120" preserveAspectRatio="none" focusable="false">
            <path
              className={styles.waveBlush}
              d="M0 60 C 20 60 25 34 40 34 S 60 86 80 86 S 100 20 120 20 S 140 100 160 100 S 180 44 200 44 S 220 76 240 76 S 260 30 280 30 S 300 90 320 90 S 340 50 360 50 S 380 70 400 70 S 420 26 440 26 S 460 94 480 94 S 500 40 520 40 S 540 80 560 80 S 580 55 600 60"
            />
            <path
              className={styles.waveCherry}
              d="M0 78 C 20 78 30 96 50 96 S 80 58 100 58 S 130 102 150 102 S 180 62 200 62 S 230 100 250 100 S 280 60 300 60 S 330 98 350 98 S 380 58 400 58 S 430 100 450 100 S 480 64 500 64 S 530 98 550 98 S 580 66 600 78"
            />
          </svg>
        </div>

        {STARS.map((star) => (
          <span
            key={`${star.left}-${star.top}`}
            className={`${styles.pixelStar} ${styles[star.className]}`}
            style={{ left: star.left, top: star.top, animationDelay: star.delay }}
          />
        ))}

        {HEARTS.map((heart) => (
          <span
            key={heart.className}
            className={`${styles.heart} ${styles[heart.className]}`}
            style={{ left: heart.left, top: heart.top }}
          />
        ))}

        {FLOWERS.map((flower) => (
          <span
            key={flower.className}
            className={`${styles.flower} ${styles[flower.className]}`}
            style={{ left: flower.left, top: flower.top }}
          />
        ))}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelTop} aria-hidden="true">
          <span className={styles.led} />
          <span className={styles.brandTag}>TAPE DECK</span>
          <span className={styles.panelDots}>···</span>
        </div>

        <div className={styles.panelBody}>
          <div className={styles.deck} aria-hidden="true">
            <div className={styles.cassette}>
              <div className={styles.cassetteLabel}>
                <span>NOW PLAYING</span>
                <span>SIDE A</span>
              </div>
              <div className={styles.tapeWindow}>
                <span className={`${styles.reel} ${styles.reelLeft}`} />
                <span className={styles.tapeBand} />
                <span className={`${styles.reel} ${styles.reelRight}`} />
              </div>
              <div className={styles.cassetteFooter}>
                <span className={styles.screw} />
                <span className={styles.screw} />
              </div>
            </div>
          </div>

          <div className={styles.details}>
            <h2 id="soundtrack-heading" className={styles.heading}>
              OUR SOUNDTRACK
            </h2>

            <dl className={styles.trackList}>
              {DETAILS.map((detail) => (
                <div key={detail.term} className={styles.trackRow}>
                  <dt className={styles.trackTerm}>{detail.term}</dt>
                  <dd className={styles.trackValue}>{detail.placeholder}</dd>
                </div>
              ))}
            </dl>

            <p className={styles.footerNote}>
              [ cover art / full track to be provided ]
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
