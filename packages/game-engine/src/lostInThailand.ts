import { Card, buildDeck, shuffle } from "./deck";

export type RoadId = "top" | "middle" | "bottom";
export type Side = "left" | "right";

const BASE_LENGTH: Record<RoadId, number> = { top: 1, middle: 3, bottom: 1 };
const ROAD_ORDER: RoadId[] = ["top", "middle", "bottom"];

export interface Road {
  base: Card[]; // fixed, dealt at game start (or after a reset) — never changes shape
  leftExtension: Card[]; // nearest-to-base card first; last entry is the current left end
  rightExtension: Card[]; // nearest-to-base card first; last entry is the current right end
}

export function roadLength(road: Road): number {
  return road.base.length + road.leftExtension.length + road.rightExtension.length;
}

export function roadCards(road: Road): Card[] {
  return [...[...road.leftExtension].reverse(), ...road.base, ...road.rightExtension];
}

export function leftEndCard(road: Road): Card {
  return road.leftExtension.length ? road.leftExtension[road.leftExtension.length - 1] : road.base[0];
}

export function rightEndCard(road: Road): Card {
  return road.rightExtension.length
    ? road.rightExtension[road.rightExtension.length - 1]
    : road.base[road.base.length - 1];
}

/** A single card counts as one playable end; a longer road has two distinct playable ends. */
export function playableSides(road: Road): Side[] {
  return roadLength(road) === 1 ? ["right"] : ["left", "right"];
}

export interface LitGuessResult {
  roadId: RoadId;
  side: Side;
  endCard: Card;
  guess: "higher" | "lower";
  drawnCard: Card;
  correct: boolean;
  wasLongestRoad: boolean;
  drinkAmount: number; // only meaningful when !correct
}

export interface LostInThailandState {
  players: string[];
  currentPlayerIndex: number;
  deck: Card[];
  roads: Record<RoadId, Road>;
  streak: number;
  hitLongestRoadInRun: boolean;
  lastGuess: LitGuessResult | null;
  awaitingResolution: boolean; // a card has been revealed; UI must call bankTurn() or continueTurn()
  log: string[];
}

export function createLostInThailandGame(players: string[]): LostInThailandState {
  if (players.length < 2) {
    throw new Error("Lost in Thailand needs at least 2 players");
  }
  const deck = shuffle(buildDeck());
  const roads = {} as Record<RoadId, Road>;
  let rest = deck;
  for (const id of ROAD_ORDER) {
    const base = rest.slice(0, BASE_LENGTH[id]);
    rest = rest.slice(BASE_LENGTH[id]);
    roads[id] = { base, leftExtension: [], rightExtension: [] };
  }

  return {
    players,
    currentPlayerIndex: 0,
    deck: rest,
    roads,
    streak: 0,
    hitLongestRoadInRun: false,
    lastGuess: null,
    awaitingResolution: false,
    log: ["Game started"],
  };
}

function longestRoadLength(roads: Record<RoadId, Road>): number {
  return Math.max(...ROAD_ORDER.map((id) => roadLength(roads[id])));
}

export function isBankable(state: LostInThailandState): boolean {
  return state.streak >= 3 && state.hitLongestRoadInRun;
}

/** Current player guesses higher/lower against one end of a road. Pure — returns a new state. */
export function submitLitGuess(
  state: LostInThailandState,
  roadId: RoadId,
  side: Side,
  guess: "higher" | "lower"
): LostInThailandState {
  if (state.awaitingResolution) {
    throw new Error("A card is already revealed; call bankTurn() or continueTurn() first");
  }

  const road = state.roads[roadId];
  const endCard: Card = side === "left" ? leftEndCard(road) : rightEndCard(road);
  const isLongestRoadPlay = roadLength(road) === longestRoadLength(state.roads);

  const deck = state.deck.length > 0 ? state.deck : shuffle(buildDeck());
  const [drawnCard, ...rest] = deck;
  const correct: boolean =
    drawnCard.rank !== endCard.rank &&
    (guess === "higher" ? drawnCard.rank > endCard.rank : drawnCard.rank < endCard.rank);

  const player = state.players[state.currentPlayerIndex];

  if (correct) {
    const updatedRoad: Road =
      side === "left"
        ? { ...road, leftExtension: [...road.leftExtension, drawnCard] }
        : { ...road, rightExtension: [...road.rightExtension, drawnCard] };

    return {
      ...state,
      deck: rest,
      roads: { ...state.roads, [roadId]: updatedRoad },
      streak: state.streak + 1,
      hitLongestRoadInRun: state.hitLongestRoadInRun || isLongestRoadPlay,
      lastGuess: { roadId, side, endCard, guess, drawnCard, correct: true, wasLongestRoad: isLongestRoadPlay, drinkAmount: 0 },
      awaitingResolution: true,
      log: [...state.log, `${player} guessed ${guess} on ${roadId}: correct (streak ${state.streak + 1})`],
    };
  }

  const drinkAmount = roadLength(road);
  const resetRoad: Road = { base: road.base, leftExtension: [], rightExtension: [] };

  return {
    ...state,
    deck: rest,
    roads: { ...state.roads, [roadId]: resetRoad },
    streak: 0,
    hitLongestRoadInRun: false,
    lastGuess: { roadId, side, endCard, guess, drawnCard, correct: false, wasLongestRoad: isLongestRoadPlay, drinkAmount },
    awaitingResolution: true,
    log: [...state.log, `${player} guessed ${guess} on ${roadId}: wrong, drinks ${drinkAmount}, road reset`],
  };
}

/** Ends the current player's turn — only valid once bankable (streak >= 3 with a longest-road play). */
export function bankTurn(state: LostInThailandState): LostInThailandState {
  if (!state.awaitingResolution) {
    throw new Error("No revealed guess to resolve");
  }
  if (!isBankable(state)) {
    throw new Error("Cannot bank yet: need 3 in a row including a play on the longest road");
  }
  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
  return {
    ...state,
    lastGuess: null,
    awaitingResolution: false,
    streak: 0,
    hitLongestRoadInRun: false,
    currentPlayerIndex: nextPlayerIndex,
  };
}

/** Keeps the same player guessing — either to retry after a miss, or to push their streak further. */
export function continueTurn(state: LostInThailandState): LostInThailandState {
  if (!state.awaitingResolution) {
    throw new Error("No revealed guess to resolve");
  }
  return { ...state, lastGuess: null, awaitingResolution: false };
}

export { ROAD_ORDER, BASE_LENGTH };
