import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Card, RANK_LABEL, SUIT_SYMBOL, isRed } from "@dga/game-engine";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  card: Card | null; // null = face-down / empty slot
}

export default function PlayingCard({ card }: Props) {
  const { colors } = useTheme();
  const flip = useRef(new Animated.Value(card ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(flip, {
      toValue: card ? 1 : 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [card]);

  const frontRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: colors.cardBackground, borderColor: colors.border },
          { transform: [{ rotateY: frontRotate }] },
        ]}
      >
        <View style={[styles.backPattern, { borderColor: colors.cardBackDecoration }]} />
      </Animated.View>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: colors.cardBackground, borderColor: colors.border },
          { transform: [{ rotateY: backRotate }] },
        ]}
      >
        {card && (
          <Text style={[styles.rank, { color: isRed(card) ? colors.suitRed : colors.suitPrimary }]}>
            {RANK_LABEL[card.rank]}
            {"\n"}
            {SUIT_SYMBOL[card.suit]}
          </Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 120,
    height: 168,
  },
  card: {
    position: "absolute",
    width: 120,
    height: 168,
    borderRadius: 12,
    borderWidth: 3,
    backfaceVisibility: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  backPattern: {
    width: 90,
    height: 138,
    borderRadius: 8,
    borderWidth: 2,
  },
  rank: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
  },
});
