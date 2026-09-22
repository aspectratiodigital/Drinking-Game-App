import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  GameState,
  Guess,
  ROUND_ORDER,
  RoundPhase,
  Suit,
  advanceTurn,
  createGame,
  currentQuestion,
  submitGuess,
} from "@dga/game-engine";
import PlayingCard from "../components/PlayingCard";
import HigherLowerArrows from "../components/HigherLowerArrows";
import AnimatedPressable from "../components/AnimatedPressable";
import { useTheme } from "../theme/ThemeContext";
import { ThemeColors } from "../theme/colors";

interface Props {
  playerNames: string[];
  onExit: () => void;
}

const SUITS: { value: Suit; label: string }[] = [
  { value: "hearts", label: "♥ Hearts" },
  { value: "diamonds", label: "♦ Diamonds" },
  { value: "clubs", label: "♣ Clubs" },
  { value: "spades", label: "♠ Spades" },
];

function activePhase(state: GameState): RoundPhase {
  return state.stage === "bus" ? ROUND_ORDER[state.busStreak] : (state.stage as RoundPhase);
}

function buildGuess(phase: RoundPhase, value: string): Guess {
  switch (phase) {
    case "redBlack":
      return { kind: "redBlack", value: value as "red" | "black" };
    case "highLow":
      return { kind: "highLow", value: value as "higher" | "lower" };
    case "insideOutside":
      return { kind: "insideOutside", value: value as "inside" | "outside" };
    case "guessSuit":
      return { kind: "guessSuit", value: value as Suit };
  }
}

export default function RideTheBusScreen({ playerNames, onExit }: Props) {
  const { colors } = useTheme();
  const [state, setState] = useState<GameState>(() => createGame(playerNames));

  if (state.stage === "gameOver") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Game Over</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {state.players.find((p) => p.id === state.busPlayerId)?.name} cleared the bus!
        </Text>
        <ScoreList state={state} colors={colors} />
        <AnimatedPressable
          style={[styles.primaryBtn, { backgroundColor: colors.buttonBackground, borderColor: colors.border }]}
          onPress={onExit}
        >
          <Text style={[styles.primaryBtnText, { color: colors.buttonText }]}>New Game</Text>
        </AnimatedPressable>
      </View>
    );
  }

  const onBus = state.stage === "bus";
  const currentPlayer = onBus
    ? state.players.find((p) => p.id === state.busPlayerId)!
    : state.players[state.currentPlayerIndex];

  const phase = activePhase(state);
  const revealedCard = state.lastResult?.card ?? null;

  const handleGuess = (value: string) => {
    setState((prev) => submitGuess(prev, buildGuess(phase, value)));
  };

  const handleNext = () => {
    setState((prev) => advanceTurn(prev));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AnimatedPressable style={styles.exitBtn} onPress={onExit}>
        <Text style={[styles.exitBtnText, { color: colors.textMuted }]}>✕ End Game</Text>
      </AnimatedPressable>

      {onBus && <Text style={[styles.busBanner, { color: colors.suitRed }]}>🚌 ON THE BUS</Text>}
      <Text style={[styles.playerName, { color: colors.text }]}>{currentPlayer.name}'s turn</Text>
      <Text style={[styles.question, { color: colors.textMuted }]}>{currentQuestion(state)}</Text>

      <View style={styles.cardArea}>
        <PlayingCard card={revealedCard} />
      </View>

      {state.lastResult && (
        <Text style={[styles.result, { color: state.lastResult.correct ? colors.correct : colors.wrong }]}>
          {state.lastResult.correct ? "Correct!" : "Wrong — drink!"}
        </Text>
      )}

      {!state.lastResult ? (
        <GuessButtons phase={phase} colors={colors} onGuess={handleGuess} />
      ) : (
        <AnimatedPressable
          style={[styles.primaryBtn, { backgroundColor: colors.buttonBackground, borderColor: colors.border }]}
          onPress={handleNext}
        >
          <Text style={[styles.primaryBtnText, { color: colors.buttonText }]}>
            {onBus ? "Next Card" : "Next Player"}
          </Text>
        </AnimatedPressable>
      )}

      <ScoreList state={state} colors={colors} />
    </View>
  );
}

function GuessButtons({
  phase,
  colors,
  onGuess,
}: {
  phase: RoundPhase;
  colors: ThemeColors;
  onGuess: (value: string) => void;
}) {
  const btnStyle = [styles.choiceBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }];
  const btnTextStyle = [styles.choiceBtnText, { color: colors.text }];

  if (phase === "highLow") {
    return <HigherLowerArrows onHigher={() => onGuess("higher")} onLower={() => onGuess("lower")} />;
  }

  if (phase === "guessSuit") {
    return (
      <View style={styles.suitGrid}>
        {SUITS.map((s) => (
          <AnimatedPressable
            key={s.value}
            style={[styles.suitBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={() => onGuess(s.value)}
          >
            <Text style={btnTextStyle}>{s.label}</Text>
          </AnimatedPressable>
        ))}
      </View>
    );
  }

  const options: Record<"redBlack" | "insideOutside", [string, string]> = {
    redBlack: ["red", "black"],
    insideOutside: ["inside", "outside"],
  };
  const [a, b] = options[phase];

  return (
    <View style={styles.choiceRow}>
      <AnimatedPressable style={btnStyle} onPress={() => onGuess(a)}>
        <Text style={btnTextStyle}>{capitalize(a)}</Text>
      </AnimatedPressable>
      <AnimatedPressable style={btnStyle} onPress={() => onGuess(b)}>
        <Text style={btnTextStyle}>{capitalize(b)}</Text>
      </AnimatedPressable>
    </View>
  );
}

function ScoreList({ state, colors }: { state: GameState; colors: ThemeColors }) {
  return (
    <View style={styles.scoreList}>
      {state.players.map((p) => (
        <Text key={p.id} style={[styles.scoreRow, { color: colors.textMuted }]}>
          {p.name}: {p.drinksOwed} 🍺{p.id === state.busPlayerId ? "  🚌" : ""}
        </Text>
      ))}
    </View>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 72, paddingHorizontal: 24 },
  exitBtn: { position: "absolute", top: 52, right: 20, padding: 8 },
  exitBtnText: { fontSize: 15 },
  title: { fontSize: 30, fontWeight: "800", marginBottom: 10 },
  subtitle: { fontSize: 17, marginBottom: 28, textAlign: "center" },
  busBanner: { fontWeight: "800", fontSize: 17, marginBottom: 6 },
  playerName: { fontSize: 25, fontWeight: "700", marginTop: 10 },
  question: { fontSize: 17, marginTop: 6, marginBottom: 30 },
  cardArea: { height: 190, justifyContent: "center", alignItems: "center", marginBottom: 26 },
  result: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  choiceRow: { flexDirection: "row", gap: 16 },
  choiceBtn: {
    borderWidth: 2,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 14,
    minWidth: 130,
    alignItems: "center",
  },
  suitGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 14 },
  suitBtn: {
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    minWidth: 140,
    alignItems: "center",
  },
  choiceBtnText: { fontSize: 17, fontWeight: "600" },
  primaryBtn: { borderWidth: 2, paddingVertical: 18, paddingHorizontal: 44, borderRadius: 14 },
  primaryBtnText: { fontSize: 19, fontWeight: "700" },
  scoreList: { marginTop: 36, alignItems: "center" },
  scoreRow: { fontSize: 15, marginBottom: 6 },
});
