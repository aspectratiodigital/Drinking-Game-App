import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GameDef, RED_SUITS, SUIT_SYMBOL } from "../data/games";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  game: GameDef;
  width: number;
  onPress: () => void;
}

export default function GameCard({ game, width, onPress }: Props) {
  const { colors } = useTheme();
  const suitColor = RED_SUITS.includes(game.suit) ? colors.suitRed : colors.suitPrimary;
  const symbol = SUIT_SYMBOL[game.suit];

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          width,
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.cornerSymbol, styles.cornerTopLeft, { color: suitColor }]}>{symbol}</Text>
      <Text style={[styles.cornerSymbol, styles.cornerBottomRight, { color: suitColor }]}>{symbol}</Text>

      <Text style={[styles.bigSymbol, { color: suitColor }]}>{symbol}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{game.title}</Text>

      {!game.available && (
        <View style={[styles.badge, { borderColor: colors.border }]}>
          <Text style={[styles.badgeText, { color: colors.textMuted }]}>Coming Soon</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 0.68,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  cornerSymbol: {
    position: "absolute",
    fontSize: 22,
    fontWeight: "700",
  },
  cornerTopLeft: { top: 14, left: 16 },
  cornerBottomRight: { bottom: 14, right: 16, transform: [{ rotate: "180deg" }] },
  bigSymbol: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  badge: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
});
