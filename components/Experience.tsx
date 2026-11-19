"use client";

import { useEffect, useState } from "react";
import BootSequence from "./BootSequence";
import Landing from "./Landing";
import TimeTogether from "./TimeTogether";

export default function Experience() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    // A refresh should always begin at the top (header + boot), never from a
    // previously scrolled position deeper in the page.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <main>
      <Landing />
      <TimeTogether />
      {!entered && <BootSequence onEnter={() => setEntered(true)} />}
    </main>
  );
}
