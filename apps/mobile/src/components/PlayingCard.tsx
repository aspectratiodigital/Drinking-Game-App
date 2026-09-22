import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Card, RANK_LABEL, SUIT_SYMBOL, isRed } from "@dga/game-engine";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  card: Card | null; // null = face-down / empty slot
  width?: number;
  height?: number;
}

export default function PlayingCard({ card, width = 132, height = 184 }: Props) {
  const { colors } = useTheme();
  const flip = useRef(new Animated.Value(card ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(flip, {
      toValue: card ? 1 : 0,
      useNativeDriver: true,
      speed: 14,
      bounciness: 6,
    }).start();
  }, [card]);

  const frontRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });
  const suitColor = card ? (isRed(card) ? colors.suitRed : colors.suitPrimary) : colors.suitPrimary;

  return (
    <View style={[styles.wrapper, { width, height }]}>
      <Animated.View
        style={[
          styles.card,
          { width, height, backgroundColor: colors.cardBackground, borderColor: colors.border },
          { transform: [{ rotateY: frontRotate }] },
        ]}
      >
        <View style={[styles.backOuter, { borderColor: colors.cardBackDecoration }]}>
          <View style={[styles.backInner, { borderColor: colors.cardBackDecoration }]} />
        </View>
      </Animated.View>
      <Animated.View
        style={[
          styles.card,
          { width, height, backgroundColor: colors.cardBackground, borderColor: colors.border },
          { transform: [{ rotateY: backRotate }] },
        ]}
      >
        {card && (
          <>
            <View style={styles.cornerTopLeft}>
              <Text style={[styles.cornerRank, { color: suitColor }]}>{RANK_LABEL[card.rank]}</Text>
              <Text style={[styles.cornerSuit, { color: suitColor }]}>{SUIT_SYMBOL[card.suit]}</Text>
            </View>
            <Text style={[styles.centerSuit, { color: suitColor }]}>{SUIT_SYMBOL[card.suit]}</Text>
            <View style={styles.cornerBottomRight}>
              <Text style={[styles.cornerRank, { color: suitColor }]}>{RANK_LABEL[card.rank]}</Text>
              <Text style={[styles.cornerSuit, { color: suitColor }]}>{SUIT_SYMBOL[card.suit]}</Text>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  card: {
    position: "absolute",
    borderRadius: 14,
    borderWidth: 3,
    backfaceVisibility: "hidden",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  backOuter: {
    width: "78%",
    height: "82%",
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  backInner: {
    width: "62%",
    height: "56%",
    borderRadius: 8,
    borderWidth: 2,
    transform: [{ rotate: "45deg" }],
  },
  cornerTopLeft: { position: "absolute", top: 10, left: 12, alignItems: "center" },
  cornerBottomRight: { position: "absolute", bottom: 10, right: 12, alignItems: "center", transform: [{ rotate: "180deg" }] },
  cornerRank: { fontSize: 18, fontWeight: "800", lineHeight: 20 },
  cornerSuit: { fontSize: 16, lineHeight: 18 },
  centerSuit: { fontSize: 58 },
});
