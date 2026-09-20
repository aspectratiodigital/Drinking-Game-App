import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NeverHaveIEverState, createNeverHaveIEverGame, nextPrompt, toggleDrinker } from "@dga/game-engine";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  playerNames: string[];
  onExit: () => void;
}

export default function NeverHaveIEverScreen({ playerNames, onExit }: Props) {
  const { colors } = useTheme();
  const [state, setState] = useState<NeverHaveIEverState>(() => createNeverHaveIEverGame(playerNames));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Pressable style={styles.exitBtn} onPress={onExit}>
        <Text style={[styles.exitBtnText, { color: colors.textMuted }]}>✕ End Game</Text>
      </Pressable>

      <Text style={[styles.roundLabel, { color: colors.textMuted }]}>Round {state.round}</Text>
      <View style={[styles.promptCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.promptText, { color: colors.text }]}>Never have I ever{"\n"}{state.currentPrompt}</Text>
      </View>

      <Text style={[styles.instruction, { color: colors.textMuted }]}>Tap everyone who has done it</Text>

      <View style={styles.playerGrid}>
        {state.players.map((p) => {
          const isDrinking = state.drinkers.includes(p);
          return (
            <Pressable
              key={p}
              onPress={() => setState((s) => toggleDrinker(s, p))}
              style={[
                styles.playerChip,
                {
                  borderColor: colors.border,
                  backgroundColor: isDrinking ? colors.suitRed : colors.cardBackground,
                },
              ]}
            >
              <Text style={[styles.playerChipText, { color: isDrinking ? colors.buttonText : colors.text }]}>
                {p} {isDrinking ? "🍺" : ""}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[styles.primaryBtn, { backgroundColor: colors.buttonBackground, borderColor: colors.border }]}
        onPress={() => setState((s) => nextPrompt(s))}
      >
        <Text style={[styles.primaryBtnText, { color: colors.buttonText }]}>Next Prompt</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 64, paddingHorizontal: 24 },
  exitBtn: { position: "absolute", top: 48, right: 16, padding: 8 },
  exitBtnText: {},
  roundLabel: { fontSize: 14, marginBottom: 12 },
  promptCard: {
    width: "100%",
    borderWidth: 3,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  promptText: { fontSize: 22, fontWeight: "700", textAlign: "center", lineHeight: 30 },
  instruction: { fontSize: 14, marginBottom: 16 },
  playerGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginBottom: 28 },
  playerChip: {
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  playerChipText: { fontSize: 15, fontWeight: "600" },
  primaryBtn: { borderWidth: 2, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 12 },
  primaryBtnText: { fontSize: 18, fontWeight: "700" },
});
