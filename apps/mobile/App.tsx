import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import HomeScreen from "./src/screens/HomeScreen";
import SetupScreen from "./src/screens/SetupScreen";
import GameScreen from "./src/screens/GameScreen";
import ComingSoonScreen from "./src/screens/ComingSoonScreen";
import { GameDef } from "./src/data/games";
import { ThemeProvider, useTheme } from "./src/theme/ThemeContext";

type Screen =
  | { name: "home" }
  | { name: "comingSoon"; game: GameDef }
  | { name: "setup"; game: GameDef }
  | { name: "game"; game: GameDef; playerNames: string[] };

function Root() {
  const { mode } = useTheme();
  const [screen, setScreen] = useState<Screen>({ name: "home" });

  const goHome = () => setScreen({ name: "home" });

  const handleSelectGame = (game: GameDef) => {
    setScreen(game.available ? { name: "setup", game } : { name: "comingSoon", game });
  };

  return (
    <>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      {screen.name === "home" && <HomeScreen onSelectGame={handleSelectGame} />}
      {screen.name === "comingSoon" && <ComingSoonScreen game={screen.game} onBack={goHome} />}
      {screen.name === "setup" && (
        <SetupScreen
          title={screen.game.title}
          onBack={goHome}
          onStart={(playerNames) => setScreen({ name: "game", game: screen.game, playerNames })}
        />
      )}
      {screen.name === "game" && <GameScreen playerNames={screen.playerNames} onExit={goHome} />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  );
}
