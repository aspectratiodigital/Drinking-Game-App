import React, { useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import {
  Card,
  FuckTheDealerState,
  RANK_LABEL,
  SUIT_SYMBOL,
  createFuckTheDealerGame,
  isRed,
  placePendingCard,
  revealPendingCard,
  tableByRank,
} from "@dga/game-engine";
import PlayingCard from "../components/PlayingCard";
import MiniCard from "../components/MiniCard";
import AnimatedPressable from "../components/AnimatedPressable";
import { useTheme } from "../theme/ThemeContext";
import { ThemeColors } from "../theme/colors";

interface Props {
  playerNames: string[]; // first entry is the dealer
  onExit: () => void;
}

export default function FuckTheDealerScreen({ playerNames, onExit }: Props) {
  const { colors } = useTheme();
  const [dealer] = useState(playerNames[0]);
  const [players] = useState(playerNames.slice(1));
  const [state, setState] = useState<FuckTheDealerState>(() => createFuckTheDealerGame(dealer, players));
  const [peeking, setPeeking] = useState(false);
  const [placing, setPlacing] = useState(false);

  const placeAnim = useRef(new Animated.Value(0)).current;

  const currentPlayer = players[state.currentPlayerIndex];

  const handleTapCard = () => {
    if (placing) return;
    if (!state.revealed) {
      setState((s) => revealPendingCard(s));
      return;
    }
    setPlacing(true);
    Animated.timing(placeAnim, { toValue: 1, duration: 320, useNativeDriver: true }).start(() => {
      setState((s) => placePendingCard(s));
      placeAnim.setValue(0);
      setPlacing(false);
    });
  };

  const cardScale = placeAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.25] });
  const cardTranslateY = placeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 160] });
  const cardOpacity = placeAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AnimatedPressable style={styles.exitBtn} onPress={onExit}>
        <Text style={[styles.exitBtnText, { color: colors.textMuted }]}>✕ End Game</Text>
      </AnimatedPressable>

      <Text style={[styles.dealerLabel, { color: colors.textMuted }]}>Dealer: {dealer}</Text>
      <Text style={[styles.playerName, { color: colors.text }]}>{currentPlayer}'s turn</Text>
      <Text style={[styles.instruction, { color: colors.textMuted }]}>
        {peeking
          ? `Table — ${state.table.length} played`
          : !state.revealed
          ? "Tap to reveal (don't show the guesser!)"
          : "Show the guesser, then tap to place"}
      </Text>

      <View style={[styles.stage, { borderColor: colors.border }]}>
        <View style={styles.tableLayer}>
          <TableGrid table={state.table} colors={colors} />
        </View>

        {!peeking && (
          <View style={[StyleSheet.absoluteFill, styles.blurScrim, { backgroundColor: colors.background }]} />
        )}

        {!peeking && (
          <AnimatedPressable
            testID="ftd-pending-card"
            style={[
              styles.cardWrap,
              { transform: [{ scale: cardScale }, { translateY: cardTranslateY }], opacity: cardOpacity },
            ]}
            onPress={handleTapCard}
            disabled={placing}
          >
            <PlayingCard card={state.revealed ? state.pendingCard : null} />
          </AnimatedPressable>
        )}

      </View>

      <AnimatedPressable
        style={[styles.eyeBtn, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}
        onPressIn={() => setPeeking(true)}
        onPressOut={() => setPeeking(false)}
      >
        <Text style={styles.eyeIcon}>👁</Text>
        <Text style={[styles.eyeLabel, { color: colors.text }]}>Hold to review table</Text>
      </AnimatedPressable>
    </View>
  );
}

function TableGrid({ table, colors }: { table: Card[]; colors: ThemeColors }) {
  const piles = tableByRank(table).filter((p) => p.cards.length > 0);
  if (piles.length === 0) {
    return <Text style={[styles.emptyTable, { color: colors.textMuted }]}>No cards played yet</Text>;
  }
  return (
    <View style={styles.grid}>
      {piles.map(({ rank, cards }) => (
        <View key={rank} style={styles.pile}>
          <Text style={[styles.pileLabel, { color: colors.textMuted }]}>
            {RANK_LABEL[rank]} ({cards.length})
          </Text>
          <View style={styles.pileStack}>
            {cards.slice(-3).map((c, i) => (
              <View key={c.id + i} style={[styles.pileCardOffset, { left: i * 4 }]}>
                <MiniCard card={c} width={34} height={48} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 60, paddingHorizontal: 20 },
  exitBtn: { position: "absolute", top: 48, right: 16, padding: 8 },
  exitBtnText: { fontSize: 15 },
  dealerLabel: { fontSize: 14, marginBottom: 4 },
  playerName: { fontSize: 23, fontWeight: "700", marginTop: 6 },
  instruction: { fontSize: 14, marginTop: 6, marginBottom: 18, textAlign: "center" },
  stage: {
    width: "100%",
    flex: 1,
    maxHeight: 460,
    borderWidth: 3,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  tableLayer: { flex: 1, padding: 14 },
  blurScrim: { opacity: 0.93 },
  cardWrap: { position: "absolute", top: "50%", left: "50%", marginLeft: -66, marginTop: -92 },
  emptyTable: { textAlign: "center", marginTop: 40, fontSize: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  pile: { width: 70, alignItems: "center", marginBottom: 10 },
  pileLabel: { fontSize: 11, fontWeight: "700", marginBottom: 4 },
  pileStack: { width: 44, height: 48 },
  pileCardOffset: { position: "absolute", top: 0 },
  eyeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 18,
    marginBottom: 20,
  },
  eyeIcon: { fontSize: 18 },
  eyeLabel: { fontSize: 14, fontWeight: "600" },
});
