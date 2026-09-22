import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
  LostInThailandState,
  RoadId,
  Side,
  bankTurn,
  continueTurn,
  createLostInThailandGame,
  eligibleRoads,
  isBankable,
  leftEndCard,
  longestRoads,
  mustPlayLongestRoad,
  rightEndCard,
  roadCards,
  roadLength,
  submitLitGuess,
} from "@dga/game-engine";
import MiniCard from "../components/MiniCard";
import HigherLowerArrows from "../components/HigherLowerArrows";
import AnimatedPressable from "../components/AnimatedPressable";
import { useTheme } from "../theme/ThemeContext";
import { ThemeColors } from "../theme/colors";

interface Props {
  playerNames: string[];
  onExit: () => void;
}

const ROAD_LABEL: Record<RoadId, string> = { top: "Top", middle: "Middle", bottom: "Bottom" };
const ROADS: RoadId[] = ["top", "middle", "bottom"];

export default function LostInThailandScreen({ playerNames, onExit }: Props) {
  const { colors } = useTheme();
  const [state, setState] = useState<LostInThailandState>(() => createLostInThailandGame(playerNames));

  const currentPlayer = state.players[state.currentPlayerIndex];
  const bankable = isBankable(state);
  const forced = mustPlayLongestRoad(state);
  const eligible = eligibleRoads(state);
  const leaders = longestRoads(state);

  const handleGuess = (roadId: RoadId, side: Side, guess: "higher" | "lower") => {
    setState((s) => submitLitGuess(s, roadId, side, guess));
  };

  const handleResolve = (action: "bank" | "continue") => {
    setState((s) => (action === "bank" ? bankTurn(s) : continueTurn(s)));
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <AnimatedPressable style={styles.exitBtn} onPress={onExit}>
        <Text style={[styles.exitBtnText, { color: colors.textMuted }]}>✕ End Game</Text>
      </AnimatedPressable>

      <Text style={[styles.playerName, { color: colors.text }]}>{currentPlayer}'s turn</Text>
      <Text style={[styles.streakText, { color: colors.textMuted }]}>
        Streak: {state.streak} {state.hitLongestRoadInRun ? "· longest road hit ✓" : ""}
      </Text>
      <View style={[styles.longestBanner, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.longestBannerText, { color: colors.text }]}>
          🛣️ Longest road: {leaders.map((id) => ROAD_LABEL[id]).join(" & ")} ({roadLength(state.roads[leaders[0]])} cards)
        </Text>
      </View>
      {forced && (
        <Text style={[styles.forcedNote, { color: colors.suitRed }]}>
          3rd guess must be played on the longest road!
        </Text>
      )}

      {ROADS.map((roadId) => (
        <RoadView
          key={roadId}
          roadId={roadId}
          road={state.roads[roadId]}
          isLongest={leaders.includes(roadId)}
          isEligible={eligible.includes(roadId)}
          colors={colors}
          disabled={state.awaitingResolution}
          onGuess={(side, guess) => handleGuess(roadId, side, guess)}
        />
      ))}

      {state.lastGuess && (
        <View style={styles.resultBlock}>
          <Text style={[styles.result, { color: state.lastGuess.correct ? colors.correct : colors.wrong }]}>
            {state.lastGuess.correct
              ? "Correct!"
              : `Wrong — ${currentPlayer} drinks ${state.lastGuess.drinkAmount}! ${ROAD_LABEL[state.lastGuess.roadId]} road redealt.`}
          </Text>
          <View style={styles.choiceRow}>
            {bankable && (
              <AnimatedPressable
                style={[styles.primaryBtn, { backgroundColor: colors.buttonBackground, borderColor: colors.border }]}
                onPress={() => handleResolve("bank")}
              >
                <Text style={[styles.primaryBtnText, { color: colors.buttonText }]}>Bank & Pass Turn</Text>
              </AnimatedPressable>
            )}
            <AnimatedPressable
              style={[
                bankable ? styles.choiceBtn : styles.primaryBtn,
                { backgroundColor: colors.cardBackground, borderColor: colors.border },
              ]}
              onPress={() => handleResolve("continue")}
            >
              <Text style={[styles.choiceBtnText, { color: colors.text }]}>{bankable ? "Keep Going" : "Continue"}</Text>
            </AnimatedPressable>
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
  isEligible,
  colors,
  disabled,
  onGuess,
}: {
  roadId: RoadId;
  road: LostInThailandState["roads"][RoadId];
  isLongest: boolean;
  isEligible: boolean;
  colors: ThemeColors;
  disabled: boolean;
  onGuess: (side: Side, guess: "higher" | "lower") => void;
}) {
  const cards = roadCards(road);
  const length = roadLength(road);
  const sides: Side[] = length === 1 ? ["right"] : ["left", "right"];
  const arrowsDisabled = disabled || !isEligible;

  return (
    <View style={[styles.roadSection, isLongest && { borderColor: colors.suitRed, borderWidth: 2 }]}>
      <Text style={[styles.roadLabel, { color: colors.textMuted }]}>
        {ROAD_LABEL[roadId]} {isLongest ? "🛣️" : ""}
      </Text>
      <View style={styles.roadRow}>
        {sides.includes("left") && (
          <HigherLowerArrows
            size="small"
            disabled={arrowsDisabled}
            onHigher={() => onGuess("left", "higher")}
            onLower={() => onGuess("left", "lower")}
          />
        )}

        <View style={styles.cardsRow}>
          {cards.map((card) => (
            <MiniCard key={card.id} card={card} animateIn />
          ))}
        </View>

        <HigherLowerArrows
          size="small"
          disabled={arrowsDisabled}
          onHigher={() => onGuess("right", "higher")}
          onLower={() => onGuess("right", "lower")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { alignItems: "center", paddingTop: 68, paddingHorizontal: 18, paddingBottom: 48 },
  exitBtn: { position: "absolute", top: 52, right: 16, padding: 8 },
  exitBtnText: { fontSize: 15 },
  playerName: { fontSize: 24, fontWeight: "700", marginTop: 8 },
  streakText: { fontSize: 15, marginTop: 4, marginBottom: 10 },
  longestBanner: { borderWidth: 2, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 8 },
  longestBannerText: { fontSize: 13, fontWeight: "700" },
  forcedNote: { fontSize: 13, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  roadSection: { width: "100%", marginTop: 14, marginBottom: 6, alignItems: "center", borderRadius: 16, padding: 10 },
  roadLabel: { fontSize: 14, fontWeight: "700", marginBottom: 10 },
  roadRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  cardsRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6, maxWidth: 190 },
  choiceRow: { flexDirection: "row", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 8 },
  choiceBtn: { borderWidth: 2, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: "center" },
  choiceBtnText: { fontSize: 15, fontWeight: "600" },
  resultBlock: { width: "100%", alignItems: "center", marginTop: 18 },
  result: { fontSize: 17, fontWeight: "700", marginBottom: 14, textAlign: "center" },
  primaryBtn: { borderWidth: 2, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12 },
  primaryBtnText: { fontSize: 15, fontWeight: "700" },
});
