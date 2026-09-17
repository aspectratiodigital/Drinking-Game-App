import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GameDef, RED_SUITS, SUIT_SYMBOL } from "../data/games";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  game: GameDef;
  onBack: () => void;
}

export default function ComingSoonScreen({ game, onBack }: Props) {
  const { colors } = useTheme();
  const suitColor = RED_SUITS.includes(game.suit) ? colors.suitRed : colors.suitPrimary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Pressable onPress={onBack} style={styles.backBtn}>
        <Text style={[styles.backBtnText, { color: colors.text }]}>‹ Back</Text>
      </Pressable>

      <Text style={[styles.symbol, { color: suitColor }]}>{SUIT_SYMBOL[game.suit]}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{game.title}</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  backBtn: { position: "absolute", top: 64, left: 16, padding: 8 },
  backBtnText: { fontSize: 16, fontWeight: "600" },
  symbol: { fontSize: 72, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: "800", textAlign: "center" },
  subtitle: { fontSize: 16, marginTop: 8 },
});
