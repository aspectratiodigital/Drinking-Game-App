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

export default function GameScreen({ playerNames, onExit }: Props) {
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
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: colors.buttonBackground, borderColor: colors.border }]}
          onPress={onExit}
        >
          <Text style={[styles.primaryBtnText, { color: colors.buttonText }]}>New Game</Text>
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Pressable style={styles.exitBtn} onPress={onExit}>
        <Text style={[styles.exitBtnText, { color: colors.textMuted }]}>✕ End Game</Text>
      </Pressable>

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
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: colors.buttonBackground, borderColor: colors.border }]}
          onPress={handleNext}
        >
          <Text style={[styles.primaryBtnText, { color: colors.buttonText }]}>
            {onBus ? "Next Card" : "Next Player"}
          </Text>
        </Pressable>
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

  if (phase === "guessSuit") {
    return (
      <View style={styles.suitGrid}>
        {SUITS.map((s) => (
          <Pressable key={s.value} style={[styles.suitBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={() => onGuess(s.value)}>
            <Text style={btnTextStyle}>{s.label}</Text>
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
      <Pressable style={btnStyle} onPress={() => onGuess(a)}>
        <Text style={btnTextStyle}>{capitalize(a)}</Text>
      </Pressable>
      <Pressable style={btnStyle} onPress={() => onGuess(b)}>
        <Text style={btnTextStyle}>{capitalize(b)}</Text>
      </Pressable>
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
  container: { flex: 1, alignItems: "center", paddingTop: 64, paddingHorizontal: 24 },
  exitBtn: { position: "absolute", top: 48, right: 16, padding: 8 },
  exitBtnText: {},
  title: { fontSize: 28, fontWeight: "800", marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 24, textAlign: "center" },
  busBanner: { fontWeight: "800", fontSize: 16, marginBottom: 4 },
  playerName: { fontSize: 22, fontWeight: "700", marginTop: 8 },
  question: { fontSize: 16, marginTop: 4, marginBottom: 24 },
  cardArea: { height: 168, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  result: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  choiceRow: { flexDirection: "row", gap: 12 },
  choiceBtn: {
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center",
  },
  suitGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 },
  suitBtn: {
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    minWidth: 130,
    alignItems: "center",
  },
  choiceBtnText: { fontSize: 16, fontWeight: "600" },
  primaryBtn: { borderWidth: 2, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 12 },
  primaryBtnText: { fontSize: 18, fontWeight: "700" },
  scoreList: { marginTop: 32, alignItems: "center" },
  scoreRow: { fontSize: 14, marginBottom: 4 },
});
