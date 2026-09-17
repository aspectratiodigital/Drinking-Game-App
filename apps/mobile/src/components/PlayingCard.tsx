import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Card, RANK_LABEL, SUIT_SYMBOL, isRed } from "@dga/game-engine";

interface Props {
  card: Card | null; // null = face-down / empty slot
}

export default function PlayingCard({ card }: Props) {
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
      <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: frontRotate }] }]}>
        <View style={styles.backPattern} />
      </Animated.View>
      <Animated.View style={[styles.card, styles.cardFront, { transform: [{ rotateY: backRotate }] }]}>
        {card && (
          <Text style={[styles.rank, { color: isRed(card) ? "#d81b3f" : "#1a1a1a" }]}>
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
    backfaceVisibility: "hidden",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardBack: {
    backgroundColor: "#1e3a8a",
  },
  backPattern: {
    width: 90,
    height: 138,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#3b5fc9",
  },
  cardFront: {
    backgroundColor: "#ffffff",
  },
  rank: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
  },
});
