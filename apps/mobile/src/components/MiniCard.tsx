import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Card, RANK_LABEL, SUIT_SYMBOL, isRed } from "@dga/game-engine";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  card: Card;
  width?: number;
  height?: number;
  animateIn?: boolean;
  highlight?: boolean;
}

export default function MiniCard({ card, width = 48, height = 68, animateIn = false, highlight = false }: Props) {
  const { colors } = useTheme();
  const pop = useRef(new Animated.Value(animateIn ? 0 : 1)).current;

  useEffect(() => {
    if (animateIn) {
      pop.setValue(0);
      Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 10 }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.id]);

  const suitColor = isRed(card) ? colors.suitRed : colors.suitPrimary;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          width,
          height,
          backgroundColor: colors.cardBackground,
          borderColor: highlight ? colors.suitRed : colors.border,
          transform: [{ scale: pop }],
        },
      ]}
    >
      <Text style={[styles.rank, { color: suitColor, fontSize: Math.max(11, width * 0.28) }]}>
        {RANK_LABEL[card.rank]}
      </Text>
      <Text style={[styles.suit, { color: suitColor, fontSize: Math.max(12, width * 0.32) }]}>
        {SUIT_SYMBOL[card.suit]}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rank: { fontWeight: "800", lineHeight: undefined },
  suit: { marginTop: -2 },
});
