import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

interface Props {
  onStart: (playerNames: string[]) => void;
}

export default function SetupScreen({ onStart }: Props) {
  const [names, setNames] = useState<string[]>(["Player 1", "Player 2"]);

  const updateName = (index: number, value: string) => {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  };

  const addPlayer = () => setNames((prev) => [...prev, `Player ${prev.length + 1}`]);
  const removePlayer = (index: number) =>
    setNames((prev) => (prev.length > 2 ? prev.filter((_, i) => i !== index) : prev));

  const canStart = names.every((n) => n.trim().length > 0) && names.length >= 2;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Ride the Bus</Text>
      <Text style={styles.subtitle}>Who's playing?</Text>

      {names.map((name, i) => (
        <View key={i} style={styles.row}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(v) => updateName(i, v)}
            placeholder={`Player ${i + 1}`}
            placeholderTextColor="#888"
          />
          {names.length > 2 && (
            <Pressable onPress={() => removePlayer(i)} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>✕</Text>
            </Pressable>
          )}
        </View>
      ))}

      <Pressable onPress={addPlayer} style={styles.addBtn}>
        <Text style={styles.addBtnText}>+ Add Player</Text>
      </Pressable>

      <Pressable
        disabled={!canStart}
        onPress={() => onStart(names.map((n) => n.trim()))}
        style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
      >
        <Text style={styles.startBtnText}>Start Game</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 24, paddingTop: 72, alignItems: "stretch" },
  title: { fontSize: 32, fontWeight: "800", color: "#fff", textAlign: "center" },
  subtitle: { fontSize: 16, color: "#94a3b8", textAlign: "center", marginTop: 8, marginBottom: 24 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: "#1e293b",
    color: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  removeBtn: { marginLeft: 8, padding: 10 },
  removeBtnText: { color: "#f87171", fontSize: 18 },
  addBtn: { paddingVertical: 12, alignItems: "center" },
  addBtnText: { color: "#60a5fa", fontSize: 16, fontWeight: "600" },
  startBtn: {
    marginTop: 24,
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  startBtnDisabled: { backgroundColor: "#334155" },
  startBtnText: { color: "#052e16", fontSize: 18, fontWeight: "700" },
});
