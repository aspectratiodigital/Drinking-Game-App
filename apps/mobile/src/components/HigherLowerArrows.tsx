import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import AnimatedPressable from "./AnimatedPressable";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  onHigher: () => void;
  onLower: () => void;
  disabled?: boolean;
  size?: "normal" | "small";
  style?: ViewStyle;
}

/** Stacked green-up / red-down arrows for higher/lower guesses. */
export default function HigherLowerArrows({ onHigher, onLower, disabled, size = "normal", style }: Props) {
  const { colors } = useTheme();
  const dim = size === "small" ? 44 : 60;
  const fontSize = size === "small" ? 22 : 30;

  return (
    <View style={[styles.stack, style]}>
      <AnimatedPressable
        disabled={disabled}
        onPress={onHigher}
        style={[
          styles.arrowBtn,
          { width: dim, height: dim, borderColor: colors.border, backgroundColor: colors.correct, opacity: disabled ? 0.4 : 1 },
        ]}
      >
        <Text style={[styles.arrowText, { fontSize, color: "#ffffff" }]}>▲</Text>
      </AnimatedPressable>
      <AnimatedPressable
        disabled={disabled}
        onPress={onLower}
        style={[
          styles.arrowBtn,
          { width: dim, height: dim, borderColor: colors.border, backgroundColor: colors.wrong, opacity: disabled ? 0.4 : 1 },
        ]}
      >
        <Text style={[styles.arrowText, { fontSize, color: "#ffffff" }]}>▼</Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { alignItems: "center", gap: 8 },
  arrowBtn: {
    borderWidth: 2,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: { fontWeight: "900" },
});
