"use client";

import { useEffect, useRef } from "react";
import AmbientHearts from "./AmbientHearts";
import SolidPixelHeart from "./SolidPixelHeart";

export default function Landing() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateFade = () => {
      const y = window.scrollY || window.pageYOffset;
      const distance = window.innerHeight * 0.85;
      const progress = Math.max(0, Math.min(1, y / distance));
      sectionRef.current?.style.setProperty(
        "--scroll-fade",
        String(1 - progress)
      );
    };

    window.addEventListener("scroll", updateFade, { passive: true });
    updateFade();
    return () => window.removeEventListener("scroll", updateFade);
  }, []);

  return (
    <section ref={sectionRef} className="landing" id="landing">
      <AmbientHearts />
      <div className="landing__crt" aria-hidden="true" />

      <div className="landing__content">
        <div className="landing__title-wrap">
          <h1 className="landing__title">
            <span>Our Little</span>
            <span>Universe</span>
          </h1>

          <span className="landing__heart landing__heart--tl" aria-hidden="true">
            <SolidPixelHeart />
          </span>
          <span className="landing__heart landing__heart--tr" aria-hidden="true">
            <SolidPixelHeart />
          </span>
          <span className="landing__heart landing__heart--bl" aria-hidden="true">
            <SolidPixelHeart />
          </span>
          <span className="landing__heart landing__heart--br" aria-hidden="true">
            <SolidPixelHeart />
          </span>
          <span className="landing__heart landing__heart--ml" aria-hidden="true">
            <SolidPixelHeart />
          </span>
          <span className="landing__heart landing__heart--mr" aria-hidden="true">
            <SolidPixelHeart />
          </span>
        </div>

        <p className="landing__subtitle">
          A little place for all the things that make us, us.
        </p>
        <p className="landing__scroll">Scroll to continue</p>
      </div>
    </section>
  );
}
