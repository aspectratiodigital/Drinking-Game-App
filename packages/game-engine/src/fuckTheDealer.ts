import { Card, buildDeck, shuffle } from "./deck";

export type HighLowGuess = "higher" | "lower";

export interface FtdTurnResult {
  playerId: string;
  card: Card;
  guess: HighLowGuess;
  correct: boolean;
}

export interface FuckTheDealerState {
  dealer: string;
  players: string[]; // non-dealer players, in turn order
  currentPlayerIndex: number;
  deck: Card[];
  referenceCard: Card; // the card being guessed against
  drinksOwed: Record<string, number>;
  lastResult: FtdTurnResult | null;
  awaitingAdvance: boolean;
  stage: "playing" | "gameOver";
  log: string[];
}

export function createFuckTheDealerGame(dealer: string, players: string[]): FuckTheDealerState {
  if (players.length < 1) {
    throw new Error("Fuck the Dealer needs at least 1 player besides the dealer");
  }
  const deck = shuffle(buildDeck());
  const [referenceCard, ...rest] = deck;
  const drinksOwed: Record<string, number> = {};
  for (const p of players) drinksOwed[p] = 0;

  return {
    dealer,
    players,
    currentPlayerIndex: 0,
    deck: rest,
    referenceCard,
    drinksOwed,
    lastResult: null,
    awaitingAdvance: false,
    stage: "playing",
    log: [`${dealer} deals. Reference card revealed.`],
  };
}

/** Current player guesses higher/lower than the reference card. Pure — returns a new state. */
export function submitFtdGuess(state: FuckTheDealerState, guess: HighLowGuess): FuckTheDealerState {
  if (state.awaitingAdvance) {
    throw new Error("A card is already revealed; call advanceFtdTurn() first");
  }
  if (state.stage === "gameOver") {
    throw new Error("Game is already over");
  }

  if (state.deck.length === 0) {
    throw new Error("Deck is exhausted; game should already be over");
  }
  const [card, ...rest] = state.deck;
  const player = state.players[state.currentPlayerIndex];
  const correct =
    card.rank !== state.referenceCard.rank &&
    (guess === "higher" ? card.rank > state.referenceCard.rank : card.rank < state.referenceCard.rank);

  const drinksOwed = correct
    ? state.drinksOwed
    : { ...state.drinksOwed, [player]: state.drinksOwed[player] + 1 };

  const stage = rest.length === 0 ? "gameOver" : "playing";

  return {
    ...state,
    deck: rest,
    referenceCard: card,
    drinksOwed,
    lastResult: { playerId: player, card, guess, correct },
    awaitingAdvance: true,
    stage,
    log: [...state.log, `${player} guessed ${guess}: ${correct ? "correct" : "wrong, drinks!"}`],
  };
}

/** Advances to the next player once a wrong guess has been shown, or once a correct one passes the turn. */
export function advanceFtdTurn(state: FuckTheDealerState): FuckTheDealerState {
  if (!state.awaitingAdvance) {
    throw new Error("No revealed card to advance from");
  }
  if (state.stage === "gameOver") {
    return { ...state, lastResult: null, awaitingAdvance: false };
  }

  const base = { ...state, lastResult: null, awaitingAdvance: false };
  const wasCorrect = state.lastResult?.correct ?? false;

  // A wrong guess keeps the same player guessing again on the new reference card.
  if (!wasCorrect) {
    return base;
  }

  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
  return { ...base, currentPlayerIndex: nextPlayerIndex };
}
