"use client";

import { useEffect, useState } from "react";

type TypedMessageProps = {
  text: string;
  reduceMotion: boolean;
};

export default function TypedMessage({ text, reduceMotion }: TypedMessageProps) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    if (reduceMotion) {
      setShown(text);
      return;
    }

    setShown("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setShown(text.slice(0, index));
      if (index >= text.length) window.clearInterval(timer);
    }, 32);

    return () => window.clearInterval(timer);
  }, [text, reduceMotion]);

  return (
    <p className="boot__message" key={text} aria-live="polite">
      {shown}
      <span className="boot__caret" aria-hidden="true" />
    </p>
  );
}
