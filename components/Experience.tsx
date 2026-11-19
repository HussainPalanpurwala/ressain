"use client";

import { useState } from "react";
import BootSequence from "./BootSequence";
import Landing from "./Landing";

export default function Experience() {
  const [entered, setEntered] = useState(false);

  return (
    <main>
      <Landing />
      {!entered && <BootSequence onEnter={() => setEntered(true)} />}
    </main>
  );
}
