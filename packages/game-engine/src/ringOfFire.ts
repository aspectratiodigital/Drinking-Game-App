import { Card, Rank, buildDeck, shuffle } from "./deck";

export interface RingOfFireState {
  players: string[];
  currentPlayerIndex: number;
  circle: Card[]; // all 52 cards, laid out face-down around the cup in a fixed shuffled order
  revealedIndices: number[]; // circle positions that have been picked up, in the order they were picked
  activeIndex: number | null; // the position just picked up, awaiting acknowledgement via advanceRingOfFireTurn
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
    circle: shuffle(buildDeck()),
    revealedIndices: [],
    activeIndex: null,
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

/** Picks up the card at this position in the circle. Pure — returns a new state. */
export function pickRingOfFireCard(state: RingOfFireState, index: number): RingOfFireState {
  if (state.stage === "gameOver") {
    throw new Error("Game is already over");
  }
  if (state.activeIndex !== null) {
    throw new Error("A card is already picked up; call advanceRingOfFireTurn() first");
  }
  if (index < 0 || index >= state.circle.length) {
    throw new Error("Index out of range");
  }
  if (state.revealedIndices.includes(index)) {
    throw new Error("That card has already been picked up");
  }

  const card = state.circle[index];
  const kingsDrawn = state.kingsDrawn + (card.rank === 13 ? 1 : 0);
  const player = state.players[state.currentPlayerIndex];
  const revealedIndices = [...state.revealedIndices, index];
  const stage = kingsDrawn >= 4 || revealedIndices.length >= state.circle.length ? "gameOver" : "playing";

  return {
    ...state,
    activeIndex: index,
    revealedIndices,
    kingsDrawn,
    stage,
    log: [...state.log, `${player} picked up ${card.rank}: ${RING_RULES[card.rank]}`],
  };
}

/** Called once a card's rule has been resolved at the table; advances to the next player's turn. */
export function advanceRingOfFireTurn(state: RingOfFireState): RingOfFireState {
  if (state.activeIndex === null) {
    throw new Error("No active card to advance from");
  }
  const base = { ...state, activeIndex: null };
  if (state.stage === "gameOver") {
    return base;
  }
  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
  return { ...base, currentPlayerIndex: nextPlayerIndex };
}
