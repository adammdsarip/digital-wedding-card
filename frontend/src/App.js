import React, { useCallback, useState } from "react";
import "./App.css";
import OpeningScene from "./components/opening/OpeningScene";
import MainInvitation from "./components/invitation/MainInvitation";

export default function App() {
  const [stage, setStage] = useState("opening"); // opening | fading | main

  const handleOpened = useCallback(() => {
    setStage("fading");
    setTimeout(() => setStage("main"), 900);
  }, []);

  return (
    <div className="app">
      {stage !== "main" && (
        <div className={`opening-wrap ${stage === "fading" ? "fade-out" : ""}`}>
          <OpeningScene onOpened={handleOpened} />
        </div>
      )}
      {stage !== "opening" && (
        <div className={`main-wrap ${stage === "main" ? "fade-in" : ""}`}>
          <MainInvitation />
        </div>
      )}
    </div>
  );
}
