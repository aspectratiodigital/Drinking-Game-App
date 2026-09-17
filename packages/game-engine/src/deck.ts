export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Rank =
  | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 // Jack
  | 12 // Queen
  | 13 // King
  | 14; // Ace (ranked high)

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const RANKS: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ id: `${rank}-${suit}`, suit, rank });
    }
  }
  return deck;
}

/** Fisher-Yates. Pass a seeded rng for deterministic tests/replays; defaults to Math.random. */
export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function isRed(card: Card): boolean {
  return card.suit === "hearts" || card.suit === "diamonds";
}

export const RANK_LABEL: Record<Rank, string> = {
  2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10",
  11: "J", 12: "Q", 13: "K", 14: "A",
};

export const SUIT_SYMBOL: Record<Suit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};
