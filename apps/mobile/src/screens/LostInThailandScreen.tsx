import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  LostInThailandState,
  RANK_LABEL,
  RoadId,
  SUIT_SYMBOL,
  Side,
  bankTurn,
  continueTurn,
  createLostInThailandGame,
  isBankable,
  isRed,
  leftEndCard,
  rightEndCard,
  roadCards,
  roadLength,
  submitLitGuess,
} from "@dga/game-engine";
import { useTheme } from "../theme/ThemeContext";
import { ThemeColors } from "../theme/colors";

interface Props {
  playerNames: string[];
  onExit: () => void;
}

const ROAD_LABEL: Record<RoadId, string> = { top: "Top", middle: "Middle", bottom: "Bottom" };

interface Selection {
  roadId: RoadId;
  side: Side;
}

export default function LostInThailandScreen({ playerNames, onExit }: Props) {
  const { colors } = useTheme();
  const [state, setState] = useState<LostInThailandState>(() => createLostInThailandGame(playerNames));
  const [selection, setSelection] = useState<Selection | null>(null);

  const currentPlayer = state.players[state.currentPlayerIndex];
  const bankable = isBankable(state);

  const handleGuess = (guess: "higher" | "lower") => {
    if (!selection) return;
    setState((s) => submitLitGuess(s, selection.roadId, selection.side, guess));
    setSelection(null);
  };

  const handleResolve = (action: "bank" | "continue") => {
    setState((s) => (action === "bank" ? bankTurn(s) : continueTurn(s)));
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Pressable style={styles.exitBtn} onPress={onExit}>
        <Text style={[styles.exitBtnText, { color: colors.textMuted }]}>✕ End Game</Text>
      </Pressable>

      <Text style={[styles.playerName, { color: colors.text }]}>{currentPlayer}'s turn</Text>
      <Text style={[styles.streakText, { color: colors.textMuted }]}>
        Streak: {state.streak} {state.hitLongestRoadInRun ? "· longest road hit ✓" : ""}
      </Text>

      {(["top", "middle", "bottom"] as RoadId[]).map((roadId) => (
        <RoadView
          key={roadId}
          roadId={roadId}
          road={state.roads[roadId]}
          isLongest={roadLength(state.roads[roadId]) === Math.max(...(["top", "middle", "bottom"] as RoadId[]).map((id) => roadLength(state.roads[id])))}
          colors={colors}
          selection={selection}
          disabled={state.awaitingResolution}
          onSelect={(side) => setSelection({ roadId, side })}
        />
      ))}

      {selection && !state.awaitingResolution && (
        <View style={styles.choiceRow}>
          <Pressable
            style={[styles.choiceBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={() => handleGuess("higher")}
          >
            <Text style={[styles.choiceBtnText, { color: colors.text }]}>Higher</Text>
          </Pressable>
          <Pressable
            style={[styles.choiceBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={() => handleGuess("lower")}
          >
            <Text style={[styles.choiceBtnText, { color: colors.text }]}>Lower</Text>
          </Pressable>
        </View>
      )}

      {state.lastGuess && (
        <View style={styles.resultBlock}>
          <Text style={[styles.result, { color: state.lastGuess.correct ? colors.correct : colors.wrong }]}>
            {state.lastGuess.correct
              ? "Correct!"
              : `Wrong — ${currentPlayer} drinks ${state.lastGuess.drinkAmount}! ${ROAD_LABEL[state.lastGuess.roadId]} road reset.`}
          </Text>
          <View style={styles.choiceRow}>
            {bankable && (
              <Pressable
                style={[styles.primaryBtn, { backgroundColor: colors.buttonBackground, borderColor: colors.border }]}
                onPress={() => handleResolve("bank")}
              >
                <Text style={[styles.primaryBtnText, { color: colors.buttonText }]}>Bank & Pass Turn</Text>
              </Pressable>
            )}
            <Pressable
              style={[
                bankable ? styles.choiceBtn : styles.primaryBtn,
                { backgroundColor: colors.cardBackground, borderColor: colors.border },
              ]}
              onPress={() => handleResolve("continue")}
            >
              <Text style={[styles.choiceBtnText, { color: colors.text }]}>
                {bankable ? "Keep Going" : "Continue"}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function RoadView({
  roadId,
  road,
  isLongest,
  colors,
  selection,
  disabled,
  onSelect,
}: {
  roadId: RoadId;
  road: LostInThailandState["roads"][RoadId];
  isLongest: boolean;
  colors: ThemeColors;
  selection: Selection | null;
  disabled: boolean;
  onSelect: (side: Side) => void;
}) {
  const cards = roadCards(road);
  const length = roadLength(road);
  const sides: Side[] = length === 1 ? ["right"] : ["left", "right"];

  return (
    <View style={styles.roadSection}>
      <Text style={[styles.roadLabel, { color: colors.textMuted }]}>
        {ROAD_LABEL[roadId]} {isLongest ? "🛣️" : ""}
      </Text>
      <View style={styles.roadRow}>
        {cards.map((card, i) => (
          <View
            key={card.id + i}
            style={[styles.miniCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          >
            <Text style={[styles.miniCardText, { color: isRed(card) ? colors.suitRed : colors.suitPrimary }]}>
              {RANK_LABEL[card.rank]}
              {SUIT_SYMBOL[card.suit]}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.roadButtons}>
        {sides.map((side) => {
          const endCard = side === "left" ? leftEndCard(road) : rightEndCard(road);
          const isSelected = selection?.roadId === roadId && selection.side === side;
          return (
            <Pressable
              key={side}
              disabled={disabled}
              onPress={() => onSelect(side)}
              style={[
                styles.endBtn,
                {
                  borderColor: colors.border,
                  backgroundColor: isSelected ? colors.buttonBackground : colors.cardBackground,
                  opacity: disabled ? 0.5 : 1,
                },
              ]}
            >
              <Text style={[styles.endBtnText, { color: isSelected ? colors.buttonText : colors.text }]}>
                Play {side} ({RANK_LABEL[endCard.rank]}
                {SUIT_SYMBOL[endCard.suit]})
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { alignItems: "center", paddingTop: 64, paddingHorizontal: 20, paddingBottom: 48 },
  exitBtn: { position: "absolute", top: 48, right: 16, padding: 8 },
  exitBtnText: {},
  playerName: { fontSize: 22, fontWeight: "700", marginTop: 8 },
  streakText: { fontSize: 14, marginTop: 4, marginBottom: 20 },
  roadSection: { width: "100%", marginBottom: 20, alignItems: "center" },
  roadLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  roadRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6, marginBottom: 8 },
  miniCard: {
    width: 42,
    height: 58,
    borderWidth: 2,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  miniCardText: { fontSize: 14, fontWeight: "700" },
  roadButtons: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  endBtn: { borderWidth: 2, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  endBtnText: { fontSize: 13, fontWeight: "600" },
  choiceRow: { flexDirection: "row", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 8 },
  choiceBtn: { borderWidth: 2, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: "center" },
  choiceBtnText: { fontSize: 15, fontWeight: "600" },
  resultBlock: { width: "100%", alignItems: "center", marginTop: 12 },
  result: { fontSize: 16, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  primaryBtn: { borderWidth: 2, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12 },
  primaryBtnText: { fontSize: 15, fontWeight: "700" },
});
