import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  RingOfFireState,
  RING_RULES,
  advanceRingOfFireTurn,
  createRingOfFireGame,
  drawRingOfFireCard,
} from "@dga/game-engine";
import PlayingCard from "../components/PlayingCard";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  playerNames: string[];
  onExit: () => void;
}

export default function RingOfFireScreen({ playerNames, onExit }: Props) {
  const { colors } = useTheme();
  const [state, setState] = useState<RingOfFireState>(() => createRingOfFireGame(playerNames));

  if (state.stage === "gameOver") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Game Over</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          The 4th King has been drawn — drink the cup!
        </Text>
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: colors.buttonBackground, borderColor: colors.border }]}
          onPress={onExit}
        >
          <Text style={[styles.primaryBtnText, { color: colors.buttonText }]}>New Game</Text>
        </Pressable>
      </View>
    );
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  const rule = state.revealedCard ? RING_RULES[state.revealedCard.rank] : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Pressable style={styles.exitBtn} onPress={onExit}>
        <Text style={[styles.exitBtnText, { color: colors.textMuted }]}>✕ End Game</Text>
      </Pressable>

      <Text style={[styles.kingsTracker, { color: colors.suitRed }]}>
        {Array.from({ length: 4 }, (_, i) => (i < state.kingsDrawn ? "♔" : "○")).join(" ")}
      </Text>
      <Text style={[styles.playerName, { color: colors.text }]}>{currentPlayer}'s turn</Text>

      <View style={styles.cardArea}>
        <PlayingCard card={state.revealedCard} />
      </View>

      {rule && (
        <Text style={[styles.rule, { color: colors.text, borderColor: colors.border }]}>{rule}</Text>
      )}

      {!state.revealedCard ? (
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: colors.buttonBackground, borderColor: colors.border }]}
          onPress={() => setState((s) => drawRingOfFireCard(s))}
        >
          <Text style={[styles.primaryBtnText, { color: colors.buttonText }]}>Draw Card</Text>
        </Pressable>
      ) : (
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: colors.buttonBackground, borderColor: colors.border }]}
          onPress={() => setState((s) => advanceRingOfFireTurn(s))}
        >
          <Text style={[styles.primaryBtnText, { color: colors.buttonText }]}>Next Player</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 64, paddingHorizontal: 24 },
  exitBtn: { position: "absolute", top: 48, right: 16, padding: 8 },
  exitBtnText: {},
  title: { fontSize: 28, fontWeight: "800", marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 24, textAlign: "center" },
  kingsTracker: { fontSize: 14, letterSpacing: 2, marginBottom: 8 },
  playerName: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  cardArea: { height: 168, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  rule: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  primaryBtn: { borderWidth: 2, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 12 },
  primaryBtnText: { fontSize: 18, fontWeight: "700" },
});
