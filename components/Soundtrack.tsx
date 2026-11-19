import styles from "./Soundtrack.module.css";

// Every value below is a placeholder. No song name, artist or lyric is supplied.
const DETAILS = [
  { term: "SONG", placeholder: "[ song title to be provided ]" },
  { term: "ARTIST", placeholder: "[ artist to be provided ]" },
  { term: "LYRICS", placeholder: "[ selected lyrics to be provided ]" },
] as const;

export default function Soundtrack() {
  return (
    <section
      className={styles.section}
      id="our-soundtrack"
      aria-labelledby="soundtrack-heading"
    >
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
