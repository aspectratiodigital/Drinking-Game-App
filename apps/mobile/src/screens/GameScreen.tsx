import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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

export default function GameScreen({ playerNames, onExit }: Props) {
  const [state, setState] = useState<GameState>(() => createGame(playerNames));

  if (state.stage === "gameOver") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎉 Game Over</Text>
        <Text style={styles.subtitle}>
          {state.players.find((p) => p.id === state.busPlayerId)?.name} cleared the bus!
        </Text>
        <ScoreList state={state} />
        <Pressable style={styles.primaryBtn} onPress={onExit}>
          <Text style={styles.primaryBtnText}>New Game</Text>
        </Pressable>
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
    <View style={styles.container}>
      <Pressable style={styles.exitBtn} onPress={onExit}>
        <Text style={styles.exitBtnText}>✕ End Game</Text>
      </Pressable>

      {onBus && <Text style={styles.busBanner}>🚌 ON THE BUS</Text>}
      <Text style={styles.playerName}>{currentPlayer.name}'s turn</Text>
      <Text style={styles.question}>{currentQuestion(state)}</Text>

      <View style={styles.cardArea}>
        <PlayingCard card={revealedCard} />
      </View>

      {state.lastResult && (
        <Text style={[styles.result, state.lastResult.correct ? styles.correct : styles.wrong]}>
          {state.lastResult.correct ? "Correct!" : `Wrong — drink!`}
        </Text>
      )}

      {!state.lastResult ? (
        <GuessButtons phase={phase} onGuess={handleGuess} />
      ) : (
        <Pressable style={styles.primaryBtn} onPress={handleNext}>
          <Text style={styles.primaryBtnText}>{onBus ? "Next Card" : "Next Player"}</Text>
        </Pressable>
      )}

      <ScoreList state={state} />
    </View>
  );
}

function GuessButtons({ phase, onGuess }: { phase: RoundPhase; onGuess: (value: string) => void }) {
  if (phase === "guessSuit") {
    return (
      <View style={styles.suitGrid}>
        {SUITS.map((s) => (
          <Pressable key={s.value} style={styles.suitBtn} onPress={() => onGuess(s.value)}>
            <Text style={styles.choiceBtnText}>{s.label}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  const options: Record<Exclude<RoundPhase, "guessSuit">, [string, string]> = {
    redBlack: ["red", "black"],
    highLow: ["higher", "lower"],
    insideOutside: ["inside", "outside"],
  };
  const [a, b] = options[phase];

  return (
    <View style={styles.choiceRow}>
      <Pressable style={styles.choiceBtn} onPress={() => onGuess(a)}>
        <Text style={styles.choiceBtnText}>{capitalize(a)}</Text>
      </Pressable>
      <Pressable style={styles.choiceBtn} onPress={() => onGuess(b)}>
        <Text style={styles.choiceBtnText}>{capitalize(b)}</Text>
      </Pressable>
    </View>
  );
}

function ScoreList({ state }: { state: GameState }) {
  return (
    <View style={styles.scoreList}>
      {state.players.map((p) => (
        <Text key={p.id} style={styles.scoreRow}>
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
  container: { flex: 1, backgroundColor: "#0f172a", alignItems: "center", paddingTop: 64, paddingHorizontal: 24 },
  exitBtn: { position: "absolute", top: 48, right: 16, padding: 8 },
  exitBtnText: { color: "#94a3b8" },
  title: { fontSize: 28, fontWeight: "800", color: "#fff", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#94a3b8", marginBottom: 24, textAlign: "center" },
  busBanner: { color: "#fbbf24", fontWeight: "800", fontSize: 16, marginBottom: 4 },
  playerName: { color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 8 },
  question: { color: "#94a3b8", fontSize: 16, marginTop: 4, marginBottom: 24 },
  cardArea: { height: 168, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  result: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  correct: { color: "#4ade80" },
  wrong: { color: "#f87171" },
  choiceRow: { flexDirection: "row", gap: 12 },
  choiceBtn: {
    backgroundColor: "#1e293b",
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center",
  },
  suitGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 },
  suitBtn: {
    backgroundColor: "#1e293b",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    minWidth: 130,
    alignItems: "center",
  },
  choiceBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  primaryBtn: { backgroundColor: "#22c55e", paddingVertical: 16, paddingHorizontal: 40, borderRadius: 12 },
  primaryBtnText: { color: "#052e16", fontSize: 18, fontWeight: "700" },
  scoreList: { marginTop: 32, alignItems: "center" },
  scoreRow: { color: "#cbd5e1", fontSize: 14, marginBottom: 4 },
});
