# Drinking Game App

A party-game app that collates multiple drinking/card games into one app, playable either
pass-and-play on a single phone, or synced live across multiple connected phones.

## Structure

This is an npm workspaces monorepo:

- `packages/game-engine` — pure TypeScript game logic (deck, rules, state machines). No
  dependency on React, React Native, or Supabase — this is the part we can port to a
  different backend later without touching game rules.
- `apps/mobile` — the Expo (React Native) app. Currently implements **Ride the Bus**
  in single-device (pass-and-play) mode.

Multiplayer sync (Supabase realtime) and additional games will be added as further
modules on top of the same `game-engine` reducer pattern.

## Getting started

```bash
npm install
cd apps/mobile
npm run start   # then press w for web, or scan the QR code with Expo Go
```

## Ride the Bus rules (as implemented)

1. **Red or Black** — each player guesses red/black for their card.
2. **Higher or Lower** — guess vs. their own previous card.
3. **Inside or Outside** — guess vs. the range of their previous two cards.
4. **Guess the Suit** — guess the suit of the next card.

Wrong guesses = drink, and the card goes into the central pile. Whoever has the most
drinks after all four rounds "rides the bus": they draw one card at a time and must
clear all four categories in a row (red/black → higher/lower → inside/outside → suit)
without a miss, restarting the sequence on any wrong guess, until they clear it.

## Roadmap

- [ ] Multiplayer mode: Supabase-backed rooms, one host + N connected phones, each
      player's card synced live to their own device.
- [ ] Additional games sharing the same room/player framework (Kings Cup, Never Have I
      Ever, etc).
