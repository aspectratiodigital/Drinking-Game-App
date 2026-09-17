import React, { useRef, useState } from "react";
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import GameCard from "../components/GameCard";
import { GAMES, GameDef } from "../data/games";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  onSelectGame: (game: GameDef) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(260, SCREEN_WIDTH * 0.62);
const CARD_SPACING = 16;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;
const SIDE_INSET = (SCREEN_WIDTH - CARD_WIDTH) / 2;

export default function HomeScreen({ onSelectGame }: Props) {
  const { colors, preference, cyclePreference } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<GameDef>>(null);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Drinking Games</Text>
        <Pressable
          onPress={cyclePreference}
          style={[styles.themeToggle, { borderColor: colors.border }]}
        >
          <Text style={[styles.themeToggleText, { color: colors.text }]}>
            {preference === "system" ? "Auto" : preference === "light" ? "☀︎ Light" : "☾ Dark"}
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Swipe to pick a game</Text>

      <FlatList
        ref={listRef}
        data={GAMES}
        keyExtractor={(g) => g.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: SIDE_INSET }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
          setActiveIndex(Math.max(0, Math.min(GAMES.length - 1, index)));
        }}
        renderItem={({ item, index }) => (
          <View style={{ width: CARD_WIDTH, marginRight: CARD_SPACING, opacity: index === activeIndex ? 1 : 0.5 }}>
            <GameCard game={item} width={CARD_WIDTH} onPress={() => onSelectGame(item)} />
          </View>
        )}
        style={styles.carousel}
      />

      <View style={styles.dots}>
        {GAMES.map((g, i) => (
          <View
            key={g.id}
            style={[
              styles.dot,
              {
                backgroundColor: i === activeIndex ? colors.text : "transparent",
                borderColor: colors.border,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 64 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: { fontSize: 28, fontWeight: "800" },
  themeToggle: {
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  themeToggleText: { fontSize: 13, fontWeight: "700" },
  subtitle: { fontSize: 15, textAlign: "center", marginTop: 8, marginBottom: 28 },
  carousel: { flexGrow: 0 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 24 },
  dot: { width: 9, height: 9, borderRadius: 5, borderWidth: 1.5 },
});
