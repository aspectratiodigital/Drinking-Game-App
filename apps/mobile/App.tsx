import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import SetupScreen from "./src/screens/SetupScreen";
import GameScreen from "./src/screens/GameScreen";

export default function App() {
  const [playerNames, setPlayerNames] = useState<string[] | null>(null);

  return (
    <>
      <StatusBar style="light" />
      {playerNames ? (
        <GameScreen playerNames={playerNames} onExit={() => setPlayerNames(null)} />
      ) : (
        <SetupScreen onStart={setPlayerNames} />
      )}
    </>
  );
}
