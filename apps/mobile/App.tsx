import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import HomeScreen from "./src/screens/HomeScreen";
import SetupScreen from "./src/screens/SetupScreen";
import RideTheBusScreen from "./src/screens/RideTheBusScreen";
import RingOfFireScreen from "./src/screens/RingOfFireScreen";
import FuckTheDealerScreen from "./src/screens/FuckTheDealerScreen";
import NeverHaveIEverScreen from "./src/screens/NeverHaveIEverScreen";
import LostInThailandScreen from "./src/screens/LostInThailandScreen";
import ComingSoonScreen from "./src/screens/ComingSoonScreen";
import { GameDef } from "./src/data/games";
import { ThemeProvider, useTheme } from "./src/theme/ThemeContext";

type Screen =
  | { name: "home" }
  | { name: "comingSoon"; game: GameDef }
  | { name: "setup"; game: GameDef }
  | { name: "game"; game: GameDef; playerNames: string[] };

const SETUP_HINTS: Record<string, string> = {
  "fuck-the-dealer": "The first player listed will be the Dealer (they don't guess or drink)",
};

function GameByGameId({ gameId, playerNames, onExit }: { gameId: string; playerNames: string[]; onExit: () => void }) {
  switch (gameId) {
    case "ride-the-bus":
      return <RideTheBusScreen playerNames={playerNames} onExit={onExit} />;
    case "ring-of-fire":
      return <RingOfFireScreen playerNames={playerNames} onExit={onExit} />;
    case "fuck-the-dealer":
      return <FuckTheDealerScreen playerNames={playerNames} onExit={onExit} />;
    case "never-have-i-ever":
      return <NeverHaveIEverScreen playerNames={playerNames} onExit={onExit} />;
    case "lost-in-thailand":
      return <LostInThailandScreen playerNames={playerNames} onExit={onExit} />;
    default:
      return null;
  }
}

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
          hint={SETUP_HINTS[screen.game.id]}
          onBack={goHome}
          onStart={(playerNames) => setScreen({ name: "game", game: screen.game, playerNames })}
        />
      )}
      {screen.name === "game" && (
        <GameByGameId gameId={screen.game.id} playerNames={screen.playerNames} onExit={goHome} />
      )}
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
