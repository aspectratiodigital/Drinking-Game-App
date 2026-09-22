import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import {
  RingOfFireState,
  RING_RULES,
  advanceRingOfFireTurn,
  createRingOfFireGame,
  isRed,
  pickRingOfFireCard,
} from "@dga/game-engine";
import { RANK_LABEL, SUIT_SYMBOL } from "@dga/game-engine";
import AnimatedPressable from "../components/AnimatedPressable";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  playerNames: string[];
  onExit: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CIRCLE_SIZE = Math.min(SCREEN_WIDTH - 48, 340);
const CARD_W = 16;
const CARD_H = 23;
const RADIUS = CIRCLE_SIZE / 2 - CARD_H;
const CENTER = CIRCLE_SIZE / 2;
const CUP_SIZE = 84;

export default function RingOfFireScreen({ playerNames, onExit }: Props) {
  const { colors } = useTheme();
  const [state, setState] = React.useState<RingOfFireState>(() => createRingOfFireGame(playerNames));

  if (state.stage === "gameOver" && state.activeIndex === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Game Over</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          The 4th King has been drawn — drink the cup!
        </Text>
        <AnimatedPressable
          style={[styles.primaryBtn, { backgroundColor: colors.buttonBackground, borderColor: colors.border }]}
          onPress={onExit}
        >
          <Text style={[styles.primaryBtnText, { color: colors.buttonText }]}>New Game</Text>
        </AnimatedPressable>
      </View>
    );
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  const activeCard = state.activeIndex !== null ? state.circle[state.activeIndex] : null;
  const rule = activeCard ? RING_RULES[activeCard.rank] : null;

  const handlePick = (index: number) => {
    if (state.activeIndex !== null || state.revealedIndices.includes(index)) return;
    setState((s) => pickRingOfFireCard(s, index));
  };

  const handleNext = () => setState((s) => advanceRingOfFireTurn(s));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AnimatedPressable style={styles.exitBtn} onPress={onExit}>
        <Text style={[styles.exitBtnText, { color: colors.textMuted }]}>✕ End Game</Text>
      </AnimatedPressable>

      <Text style={[styles.kingsTracker, { color: colors.suitRed }]}>
        {Array.from({ length: 4 }, (_, i) => (i < state.kingsDrawn ? "♔" : "○")).join(" ")}
      </Text>
      <Text style={[styles.playerName, { color: colors.text }]}>{currentPlayer}'s turn</Text>

      <View style={[styles.circleArea, { width: CIRCLE_SIZE, height: CIRCLE_SIZE }]}>
        <View
          style={[
            styles.cup,
            {
              width: CUP_SIZE,
              height: CUP_SIZE,
              left: CENTER - CUP_SIZE / 2,
              top: CENTER - CUP_SIZE / 2,
              borderColor: colors.border,
              backgroundColor: colors.cardBackground,
            },
          ]}
        >
          <Text style={styles.cupEmoji}>🍺</Text>
        </View>

        {state.circle.map((card, i) => {
          const angle = (i / state.circle.length) * 2 * Math.PI - Math.PI / 2;
          const x = CENTER + RADIUS * Math.cos(angle) - CARD_W / 2;
          const y = CENTER + RADIUS * Math.sin(angle) - CARD_H / 2;
          const revealed = state.revealedIndices.includes(i);
          const isActive = state.activeIndex === i;

          return (
            <AnimatedPressable
              key={card.id}
              disabled={revealed}
              onPress={() => handlePick(i)}
              style={[
                styles.circleCard,
                {
                  width: CARD_W,
                  height: CARD_H,
                  left: x,
                  top: y,
                  transform: [{ rotate: `${(angle * 180) / Math.PI + 90}deg` }],
                  backgroundColor: revealed ? "transparent" : colors.cardBackDecoration,
                  borderColor: isActive ? colors.suitRed : colors.border,
                  borderWidth: isActive ? 2 : 1,
                  opacity: revealed && !isActive ? 0.15 : 1,
                },
              ]}
            >
              <></>
            </AnimatedPressable>
          );
        })}
      </View>

      {activeCard && rule && (
        <View style={styles.revealBlock}>
          <Text style={[styles.revealedCardText, { color: isRed(activeCard) ? colors.suitRed : colors.suitPrimary }]}>
            {RANK_LABEL[activeCard.rank]}
            {SUIT_SYMBOL[activeCard.suit]}
          </Text>
          <Text style={[styles.rule, { color: colors.text, borderColor: colors.border }]}>{rule}</Text>
          <AnimatedPressable
            style={[styles.primaryBtn, { backgroundColor: colors.buttonBackground, borderColor: colors.border }]}
            onPress={handleNext}
          >
            <Text style={[styles.primaryBtnText, { color: colors.buttonText }]}>
              {state.stage === "gameOver" ? "Finish" : "Next Player"}
            </Text>
          </AnimatedPressable>
        </View>
      )}

      {!activeCard && (
        <Text style={[styles.hint, { color: colors.textMuted }]}>Tap any card to pick it up</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 60, paddingHorizontal: 24 },
  exitBtn: { position: "absolute", top: 48, right: 16, padding: 8 },
  exitBtnText: { fontSize: 15 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 8, marginTop: 120 },
  subtitle: { fontSize: 16, marginBottom: 24, textAlign: "center" },
  kingsTracker: { fontSize: 14, letterSpacing: 2, marginBottom: 4 },
  playerName: { fontSize: 21, fontWeight: "700", marginBottom: 14 },
  circleArea: { position: "relative", alignItems: "center", justifyContent: "center" },
  cup: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  cupEmoji: { fontSize: 36 },
  circleCard: { position: "absolute", borderRadius: 3 },
  hint: { fontSize: 14, marginTop: 18 },
  revealBlock: { alignItems: "center", marginTop: 14, width: "100%" },
  revealedCardText: { fontSize: 30, fontWeight: "800", marginBottom: 10 },
  rule: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 18,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryBtn: { borderWidth: 2, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 14 },
  primaryBtnText: { fontSize: 18, fontWeight: "700" },
});
