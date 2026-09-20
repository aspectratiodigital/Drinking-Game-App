import { shuffle } from "./deck";

export const DEFAULT_PROMPTS: string[] = [
  "…gone skinny dipping",
  "…been in a physical fight",
  "…stayed up for more than 24 hours straight",
  "…sent a text to the wrong person and regretted it",
  "…cried during a movie",
  "…lied about my age",
  "…been kicked out of somewhere",
  "…gone on a blind date",
  "…broken a bone",
  "…had a crush on a friend's partner",
  "…forgotten someone's name mid-introduction",
  "…snuck into a party uninvited",
  "…pretended to be sick to skip something",
  "…stalked an ex on social media",
  "…been caught singing/dancing alone",
  "…eaten food off the floor",
  "…gone a week without showering",
  "…fallen asleep in public",
  "…had a one night stand",
  "…cheated on a test",
  "…been fired from a job",
  "…peed in a pool",
  "…ghosted someone",
  "…called in sick to go to an event",
  "…walked in on someone",
  "…been walked in on",
  "…lied to get out of plans",
  "…had a crush on a teacher",
  "…thrown up from drinking",
  "…gotten a tattoo I regret",
];

export interface NeverHaveIEverState {
  players: string[];
  promptPool: string[]; // shuffled, not-yet-used prompts
  usedPrompts: string[];
  currentPrompt: string;
  drinkers: string[]; // player names who've "done it" for the current prompt
  round: number;
}

export function createNeverHaveIEverGame(players: string[], customPrompts: string[] = []): NeverHaveIEverState {
  if (players.length < 2) {
    throw new Error("Never Have I Ever needs at least 2 players");
  }
  const pool = shuffle([...DEFAULT_PROMPTS, ...customPrompts]);
  const [currentPrompt, ...rest] = pool;
  return {
    players,
    promptPool: rest,
    usedPrompts: [currentPrompt],
    currentPrompt,
    drinkers: [],
    round: 1,
  };
}

export function toggleDrinker(state: NeverHaveIEverState, player: string): NeverHaveIEverState {
  const drinkers = state.drinkers.includes(player)
    ? state.drinkers.filter((p) => p !== player)
    : [...state.drinkers, player];
  return { ...state, drinkers };
}

/** Moves to a new prompt, reshuffling in previously-used prompts once the pool runs dry. */
export function nextPrompt(state: NeverHaveIEverState): NeverHaveIEverState {
  let pool = state.promptPool;
  let usedPrompts = state.usedPrompts;
  if (pool.length === 0) {
    pool = shuffle(usedPrompts);
    usedPrompts = [];
  }
  const [currentPrompt, ...rest] = pool;
  return {
    ...state,
    promptPool: rest,
    usedPrompts: [...usedPrompts, currentPrompt],
    currentPrompt,
    drinkers: [],
    round: state.round + 1,
  };
}
