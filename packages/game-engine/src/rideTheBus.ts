import { Card, Suit, buildDeck, isRed, shuffle } from "./deck";

export type RoundPhase = "redBlack" | "highLow" | "insideOutside" | "guessSuit";
export type GameStage = RoundPhase | "bus" | "gameOver";

export type Guess =
  | { kind: "redBlack"; value: "red" | "black" }
  | { kind: "highLow"; value: "higher" | "lower" }
  | { kind: "insideOutside"; value: "inside" | "outside" }
  | { kind: "guessSuit"; value: Suit };

export interface Player {
  id: string;
  name: string;
  drinksOwed: number;
  history: Card[]; // cards drawn across rounds 1-4, in order, for comparisons
}

export interface TurnResult {
  playerId: string;
  card: Card;
  guess: Guess;
  correct: boolean;
}

export interface GameState {
  players: Player[];
  stage: GameStage;
  currentPlayerIndex: number;
  deck: Card[];
  pile: Card[]; // cards drawn on wrong guesses, drunk during the bus phase
  lastResult: TurnResult | null; // set after a guess, cleared once the turn is advanced
  busPlayerId: string | null;
  busStreak: number; // consecutive correct answers in the bus phase (0-4 clears it)
  busHistory: Card[]; // bus phase's own comparison history (independent of round history)
  awaitingAdvance: boolean; // true once a card has been revealed; UI must call advanceTurn()
  log: string[];
}

const ROUND_ORDER: RoundPhase[] = ["redBlack", "highLow", "insideOutside", "guessSuit"];

export function createGame(playerNames: string[]): GameState {
  if (playerNames.length < 2) {
    throw new Error("Ride the Bus needs at least 2 players");
  }
  return {
    players: playerNames.map((name, i) => ({
      id: `p${i}`,
      name,
      drinksOwed: 0,
      history: [],
    })),
    stage: "redBlack",
    currentPlayerIndex: 0,
    deck: shuffle(buildDeck()),
    pile: [],
    lastResult: null,
    busPlayerId: null,
    busStreak: 0,
    busHistory: [],
    awaitingAdvance: false,
    log: ["Game started: Red or Black round"],
  };
}

function drawCard(state: GameState): { card: Card; deck: Card[] } {
  const deck = state.deck.length > 0 ? state.deck : shuffle(buildDeck());
  const [card, ...rest] = deck;
  return { card, deck: rest };
}

function evaluateGuess(guess: Guess, card: Card, history: Card[]): boolean {
  switch (guess.kind) {
    case "redBlack":
      return (guess.value === "red") === isRed(card);
    case "highLow": {
      const prev = history[history.length - 1];
      if (!prev || card.rank === prev.rank) return false; // ties lose, matches common house rules
      return guess.value === "higher" ? card.rank > prev.rank : card.rank < prev.rank;
    }
    case "insideOutside": {
      const a = history[history.length - 2];
      const b = history[history.length - 1];
      if (!a || !b) return false;
      const lo = Math.min(a.rank, b.rank);
      const hi = Math.max(a.rank, b.rank);
      if (card.rank === lo || card.rank === hi || lo === hi) return false; // edge/tie loses
      const inside = card.rank > lo && card.rank < hi;
      return guess.value === "inside" ? inside : !inside;
    }
    case "guessSuit":
      return guess.value === card.suit;
  }
}

/** Reveals a card for the current player (or the bus player) against their guess. Pure — returns a new state. */
export function submitGuess(state: GameState, guess: Guess): GameState {
  if (state.awaitingAdvance) {
    throw new Error("A card is already revealed; call advanceTurn() first");
  }
  if (state.stage === "gameOver") {
    throw new Error("Game is already over");
  }

  const { card, deck } = drawCard(state);

  if (state.stage === "bus") {
    return submitBusGuess(state, guess, card, deck);
  }

  const player = state.players[state.currentPlayerIndex];
  const correct = evaluateGuess(guess, card, player.history);

  const players = state.players.map((p) =>
    p.id === player.id ? { ...p, history: [...p.history, card], drinksOwed: p.drinksOwed + (correct ? 0 : 1) } : p
  );

  const pile = correct ? state.pile : [...state.pile, card];

  return {
    ...state,
    deck,
    players,
    pile,
    lastResult: { playerId: player.id, card, guess, correct },
    awaitingAdvance: true,
    log: [...state.log, `${player.name}: ${describeGuess(guess)} -> ${correct ? "correct" : "wrong, drinks!"}`],
  };
}

function submitBusGuess(state: GameState, guess: Guess, card: Card, deck: Card[]): GameState {
  const busPlayer = state.players.find((p) => p.id === state.busPlayerId)!;
  const correct = evaluateGuess(guess, card, state.busHistory);
  const busHistory = [...state.busHistory, card];

  if (!correct) {
    return {
      ...state,
      deck,
      busHistory,
      busStreak: 0,
      pile: [...state.pile, card],
      lastResult: { playerId: busPlayer.id, card, guess, correct: false },
      awaitingAdvance: true,
      log: [...state.log, `${busPlayer.name} is on the bus: ${describeGuess(guess)} -> wrong, streak reset`],
    };
  }

  const busStreak = state.busStreak + 1;
  const cleared = busStreak >= ROUND_ORDER.length;

  return {
    ...state,
    deck,
    busHistory,
    busStreak: cleared ? 0 : busStreak,
    lastResult: { playerId: busPlayer.id, card, guess, correct: true },
    awaitingAdvance: true,
    stage: cleared ? "gameOver" : "bus",
    log: [
      ...state.log,
      cleared
        ? `${busPlayer.name} cleared the bus! Game over.`
        : `${busPlayer.name} is on the bus: ${describeGuess(guess)} -> correct (${busStreak}/${ROUND_ORDER.length})`,
    ],
  };
}

/** Called once the flip animation has finished and the table is ready for the next turn. */
export function advanceTurn(state: GameState): GameState {
  if (!state.awaitingAdvance) {
    throw new Error("No revealed card to advance from");
  }
  if (state.stage === "gameOver") {
    throw new Error("Game is already over");
  }

  const base = { ...state, lastResult: null, awaitingAdvance: false };

  if (state.stage === "bus") {
    return base;
  }

  const nextPlayerIndex = state.currentPlayerIndex + 1;
  if (nextPlayerIndex < state.players.length) {
    return { ...base, currentPlayerIndex: nextPlayerIndex };
  }

  // Round finished — move to next phase, or into the bus phase after guessSuit.
  const currentPhaseIndex = ROUND_ORDER.indexOf(state.stage as RoundPhase);
  const nextPhase = ROUND_ORDER[currentPhaseIndex + 1];

  if (nextPhase) {
    return {
      ...base,
      stage: nextPhase,
      currentPlayerIndex: 0,
      log: [...base.log, `Round complete: starting ${nextPhase}`],
    };
  }

  const busPlayer = pickBusPlayer(state.players);
  return {
    ...base,
    stage: "bus",
    busPlayerId: busPlayer.id,
    busStreak: 0,
    busHistory: [],
    log: [...base.log, `${busPlayer.name} has the most drinks and rides the bus!`],
  };
}

function pickBusPlayer(players: Player[]): Player {
  return players.reduce((worst, p) => (p.drinksOwed > worst.drinksOwed ? p : worst), players[0]);
}

function describeGuess(guess: Guess): string {
  return `${guess.kind}:${guess.value}`;
}

const PHASE_QUESTION: Record<RoundPhase, string> = {
  redBlack: "Red or Black?",
  highLow: "Higher or Lower?",
  insideOutside: "Inside or Outside?",
  guessSuit: "Guess the Suit",
};

export function currentQuestion(state: GameState): string {
  switch (state.stage) {
    case "gameOver":
      return "Game Over";
    case "bus":
      return PHASE_QUESTION[ROUND_ORDER[state.busStreak]];
    default:
      return PHASE_QUESTION[state.stage];
  }
}

export { ROUND_ORDER };
