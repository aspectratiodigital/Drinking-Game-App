import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  title: string;
  hint?: string;
  onStart: (playerNames: string[]) => void;
  onBack: () => void;
}

export default function SetupScreen({ title, hint, onStart, onBack }: Props) {
  const { colors } = useTheme();
  const [names, setNames] = useState<string[]>(["Player 1", "Player 2"]);

  const updateName = (index: number, value: string) => {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  };

  const addPlayer = () => setNames((prev) => [...prev, `Player ${prev.length + 1}`]);
  const removePlayer = (index: number) =>
    setNames((prev) => (prev.length > 2 ? prev.filter((_, i) => i !== index) : prev));

  const canStart = names.every((n) => n.trim().length > 0) && names.length >= 2;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Pressable onPress={onBack} style={styles.backBtn}>
        <Text style={[styles.backBtnText, { color: colors.text }]}>‹ Back</Text>
      </Pressable>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Who's playing?</Text>
      {hint && <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>}

      {names.map((name, i) => (
        <View key={i} style={styles.row}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border },
            ]}
            value={name}
            onChangeText={(v) => updateName(i, v)}
            placeholder={`Player ${i + 1}`}
            placeholderTextColor={colors.textMuted}
          />
          {names.length > 2 && (
            <Pressable onPress={() => removePlayer(i)} style={styles.removeBtn}>
              <Text style={[styles.removeBtnText, { color: colors.suitRed }]}>✕</Text>
            </Pressable>
          )}
        </View>
      ))}

      <Pressable onPress={addPlayer} style={styles.addBtn}>
        <Text style={[styles.addBtnText, { color: colors.text }]}>+ Add Player</Text>
      </Pressable>

      <Pressable
        disabled={!canStart}
        onPress={() => onStart(names.map((n) => n.trim()))}
        style={[
          styles.startBtn,
          { backgroundColor: colors.buttonBackground, borderColor: colors.border },
          !canStart && styles.startBtnDisabled,
        ]}
      >
        <Text style={[styles.startBtnText, { color: colors.buttonText }]}>Start Game</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 96, alignItems: "stretch" },
  backBtn: { position: "absolute", top: 64, left: 16, padding: 8 },
  backBtnText: { fontSize: 16, fontWeight: "600" },
  title: { fontSize: 32, fontWeight: "800", textAlign: "center" },
  subtitle: { fontSize: 16, textAlign: "center", marginTop: 8, marginBottom: 8 },
  hint: { fontSize: 13, textAlign: "center", marginBottom: 20, fontStyle: "italic" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  removeBtn: { marginLeft: 8, padding: 10 },
  removeBtnText: { fontSize: 18, fontWeight: "700" },
  addBtn: { paddingVertical: 12, alignItems: "center" },
  addBtnText: { fontSize: 16, fontWeight: "600" },
  startBtn: {
    marginTop: 24,
    borderWidth: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  startBtnDisabled: { opacity: 0.4 },
  startBtnText: { fontSize: 18, fontWeight: "700" },
});
