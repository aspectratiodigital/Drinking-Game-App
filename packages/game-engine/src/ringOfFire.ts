import { Card, Rank, buildDeck, shuffle } from "./deck";

export interface RingOfFireState {
  players: string[];
  currentPlayerIndex: number;
  deck: Card[];
  revealedCard: Card | null;
  kingsDrawn: number;
  stage: "playing" | "gameOver";
  log: string[];
}

export function createRingOfFireGame(players: string[]): RingOfFireState {
  if (players.length < 2) {
    throw new Error("Ring of Fire needs at least 2 players");
  }
  return {
    players,
    currentPlayerIndex: 0,
    deck: shuffle(buildDeck()),
    revealedCard: null,
    kingsDrawn: 0,
    stage: "playing",
    log: ["Game started"],
  };
}

export const RING_RULES: Record<Rank, string> = {
  2: "You — pick a player to drink",
  3: "Me — you drink",
  4: "Floor — last hand to touch the floor drinks",
  5: "Guys drink",
  6: "Chicks drink",
  7: "Heaven — last hand raised drinks",
  8: "Mate — pick a drinking buddy for the rest of the game; they drink whenever you drink",
  9: "Rhyme — say a word; go round the table rhyming until someone fails and drinks",
  10: "Categories — pick a category; go round the table until someone fails and drinks",
  11: "Never Have I Ever — everyone who's done it drinks",
  12: "Question Master — whoever answers your questions drinks, until the next Queen is drawn",
  13: "Pour into the cup — the 4th King drinks the whole cup!",
  14: "Waterfall — everyone drinks continuously until the person before them stops",
};

/** Reveals the next card for the current player. Pure — returns a new state. */
export function drawRingOfFireCard(state: RingOfFireState): RingOfFireState {
  if (state.stage === "gameOver") {
    throw new Error("Game is already over");
  }
  const deck = state.deck.length > 0 ? state.deck : shuffle(buildDeck());
  const [card, ...rest] = deck;
  const kingsDrawn = state.kingsDrawn + (card.rank === 13 ? 1 : 0);
  const player = state.players[state.currentPlayerIndex];

  return {
    ...state,
    deck: rest,
    revealedCard: card,
    kingsDrawn,
    stage: kingsDrawn >= 4 ? "gameOver" : "playing",
    log: [...state.log, `${player} drew ${card.rank}: ${RING_RULES[card.rank]}`],
  };
}

/** Called once a card's rule has been resolved at the table; advances to the next player's turn. */
export function advanceRingOfFireTurn(state: RingOfFireState): RingOfFireState {
  if (state.stage === "gameOver") {
    throw new Error("Game is already over");
  }
  if (!state.revealedCard) {
    throw new Error("No revealed card to advance from");
  }
  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
  return { ...state, revealedCard: null, currentPlayerIndex: nextPlayerIndex };
}
