export type Suit = "spades" | "hearts" | "clubs" | "diamonds";

export interface GameDef {
  id: string;
  title: string;
  suit: Suit;
  available: boolean;
}

export const GAMES: GameDef[] = [
  { id: "ring-of-fire", title: "Ring of Fire", suit: "spades", available: true },
  { id: "lost-in-thailand", title: "Lost in Thailand", suit: "hearts", available: true },
  { id: "ride-the-bus", title: "Ride the Bus", suit: "clubs", available: true },
  { id: "fuck-the-dealer", title: "Fuck the Dealer", suit: "diamonds", available: true },
  { id: "never-have-i-ever", title: "Never Have I Ever", suit: "spades", available: true },
];

export const SUIT_SYMBOL: Record<Suit, string> = {
  spades: "♠",
  clubs: "♣",
  hearts: "♥",
  diamonds: "♦",
};

export const RED_SUITS: Suit[] = ["hearts", "diamonds"];
