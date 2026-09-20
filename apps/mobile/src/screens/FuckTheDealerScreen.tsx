import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  FuckTheDealerState,
  advanceFtdTurn,
  createFuckTheDealerGame,
  submitFtdGuess,
} from "@dga/game-engine";
import PlayingCard from "../components/PlayingCard";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  playerNames: string[]; // first entry is the dealer
  onExit: () => void;
}

export default function FuckTheDealerScreen({ playerNames, onExit }: Props) {
  const { colors } = useTheme();
  const [dealer] = useState(playerNames[0]);
  const [players] = useState(playerNames.slice(1));
  const [state, setState] = useState<FuckTheDealerState>(() => createFuckTheDealerGame(dealer, players));

  if (state.stage === "gameOver") {
    const sorted = [...players].sort((a, b) => state.drinksOwed[b] - state.drinksOwed[a]);
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Game Over</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>The deck is empty</Text>
        <View style={styles.scoreList}>
          {sorted.map((p) => (
            <Text key={p} style={[styles.scoreRow, { color: colors.textMuted }]}>
              {p}: {state.drinksOwed[p]} 🍺
            </Text>
          ))}
        </View>
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: colors.buttonBackground, borderColor: colors.border }]}
          onPress={onExit}
        >
          <Text style={[styles.primaryBtnText, { color: colors.buttonText }]}>New Game</Text>
        </Pressable>
      </View>
    );
  }

  const currentPlayer = players[state.currentPlayerIndex];

  const handleGuess = (guess: "higher" | "lower") => {
    setState((prev) => submitFtdGuess(prev, guess));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Pressable style={styles.exitBtn} onPress={onExit}>
        <Text style={[styles.exitBtnText, { color: colors.textMuted }]}>✕ End Game</Text>
      </Pressable>

      <Text style={[styles.dealerLabel, { color: colors.textMuted }]}>Dealer: {dealer}</Text>
      <Text style={[styles.playerName, { color: colors.text }]}>{currentPlayer}'s turn</Text>
      <Text style={[styles.question, { color: colors.textMuted }]}>
        Higher or lower than this card?
      </Text>

      <View style={styles.cardArea}>
        <PlayingCard card={state.referenceCard} />
      </View>

      {state.lastResult && (
        <Text style={[styles.result, { color: state.lastResult.correct ? colors.correct : colors.wrong }]}>
          {state.lastResult.correct ? "Correct!" : `Wrong — ${currentPlayer} drinks!`}
        </Text>
      )}

      {!state.awaitingAdvance ? (
        <View style={styles.choiceRow}>
          <Pressable
            style={[styles.choiceBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={() => handleGuess("higher")}
          >
            <Text style={[styles.choiceBtnText, { color: colors.text }]}>Higher</Text>
          </Pressable>
          <Pressable
            style={[styles.choiceBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={() => handleGuess("lower")}
          >
            <Text style={[styles.choiceBtnText, { color: colors.text }]}>Lower</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: colors.buttonBackground, borderColor: colors.border }]}
          onPress={() => setState((prev) => advanceFtdTurn(prev))}
        >
          <Text style={[styles.primaryBtnText, { color: colors.buttonText }]}>
            {state.lastResult?.correct ? "Next Player" : "Guess Again"}
          </Text>
        </Pressable>
      )}

      <View style={styles.scoreList}>
        {players.map((p) => (
          <Text key={p} style={[styles.scoreRow, { color: colors.textMuted }]}>
            {p}: {state.drinksOwed[p]} 🍺
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 64, paddingHorizontal: 24 },
  exitBtn: { position: "absolute", top: 48, right: 16, padding: 8 },
  exitBtnText: {},
  title: { fontSize: 28, fontWeight: "800", marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 24, textAlign: "center" },
  dealerLabel: { fontSize: 14, marginBottom: 4 },
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
  choiceBtnText: { fontSize: 16, fontWeight: "600" },
  primaryBtn: { borderWidth: 2, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 12 },
  primaryBtnText: { fontSize: 18, fontWeight: "700" },
  scoreList: { marginTop: 32, alignItems: "center" },
  scoreRow: { fontSize: 14, marginBottom: 4 },
});
