import styles from "./LastPage.module.css";

export default function LastPage() {
  return (
    <section className={styles.section} id="the-last-page">
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.content}>
        <h2 className={styles.title}>The Last Page</h2>

        {/* Closing message — every line here is an obvious placeholder. */}
        <div className={styles.messagePlaceholder}>
          <span className={styles.phLabel}>[ closing message to be provided ]</span>
          <div className={styles.phLines} aria-hidden="true">
            <span style={{ width: "92%" }} />
            <span style={{ width: "84%" }} />
            <span style={{ width: "70%" }} />
          </div>
        </div>

        <p className={styles.signature}>Revleen &amp; Hussain</p>

        {/* Non-functional placeholder — intentionally disabled. */}
        <button
          type="button"
          className={styles.replay}
          disabled
          aria-disabled="true"
        >
          [ REPLAY BOOT — placeholder ]
        </button>
      </div>
    </section>
  );
}
