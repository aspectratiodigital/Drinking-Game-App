import { Card, Rank, buildDeck, shuffle } from "./deck";

export interface FuckTheDealerState {
  dealer: string;
  players: string[]; // non-dealer players, in turn order
  currentPlayerIndex: number;
  deck: Card[];
  table: Card[]; // every card ever placed, in play order — the permanent, ever-growing history the guesser reads
  pendingCard: Card; // the card currently being revealed/placed
  revealed: boolean; // has pendingCard been flipped face-up yet
  log: string[];
}

function drawNextCard(deck: Card[], table: Card[]): { card: Card; deck: Card[] } {
  if (deck.length > 0) {
    const [card, ...rest] = deck;
    return { card, deck: rest };
  }
  // The deck only runs out after every card has already been played onto the table. Reshuffle
  // that same 52-card set back into a fresh deck so play can keep going — the table display
  // (the guessing aid) is never cleared, it just keeps growing across "shoes".
  const [card, ...rest] = shuffle(table);
  return { card, deck: rest };
}

export function createFuckTheDealerGame(dealer: string, players: string[]): FuckTheDealerState {
  if (players.length < 1) {
    throw new Error("Fuck the Dealer needs at least 1 player besides the dealer");
  }
  const deck = shuffle(buildDeck());
  const [pendingCard, ...rest] = deck;

  return {
    dealer,
    players,
    currentPlayerIndex: 0,
    deck: rest,
    table: [],
    pendingCard,
    revealed: false,
    log: [`${dealer} deals. First card ready.`],
  };
}

/** Flips the pending card face-up so the card-holder (not the guesser) can see it. */
export function revealPendingCard(state: FuckTheDealerState): FuckTheDealerState {
  if (state.revealed) {
    throw new Error("Card is already revealed");
  }
  return { ...state, revealed: true };
}

/** Places the revealed card onto the table and draws the next (face-down) card for the next player. */
export function placePendingCard(state: FuckTheDealerState): FuckTheDealerState {
  if (!state.revealed) {
    throw new Error("Card must be revealed before it can be placed on the table");
  }
  const table = [...state.table, state.pendingCard];
  const { card: nextCard, deck } = drawNextCard(state.deck, table);
  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

  return {
    ...state,
    table,
    deck,
    pendingCard: nextCard,
    revealed: false,
    currentPlayerIndex: nextPlayerIndex,
    log: [...state.log, `${state.pendingCard.rank} placed on the table`],
  };
}

/** Groups the table history by rank, ascending, for the pile-by-number display. */
export function tableByRank(table: Card[]): { rank: Rank; cards: Card[] }[] {
  const ranks: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  return ranks.map((rank) => ({ rank, cards: table.filter((c) => c.rank === rank) }));
}
