# UTTT React

## Chores
- [x] Refactor UTTT game component so that as much code as possible is shared with the 'versus ai' component
  - Used the `useGameLogic` hook as a reducer for the game state.

## Features
- [x] Add websocket support for real-time analysis
- [ ] Add support for lack of websocket connection - fallback to simple HTTP requests for analysis

## Bug fixes
- [x] Make no engine recommendation when analysis is turned off (after turning it on)
- [x] Don't allow player to play in AI versus mode until the user selects a turn
- [ ] Add rate limiting to analysis, when changing the engine settings
- [ ] Fix ddos attack when backend is down (on vs AI mode)
