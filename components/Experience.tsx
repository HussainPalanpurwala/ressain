"use client";

import { useState } from "react";
import BootSequence from "./BootSequence";
import Landing from "./Landing";
import TimeTogether from "./TimeTogether";

export default function Experience() {
  const [entered, setEntered] = useState(false);

  return (
    <main>
      <Landing />
      <TimeTogether />
      {!entered && <BootSequence onEnter={() => setEntered(true)} />}
    </main>
  );
}
