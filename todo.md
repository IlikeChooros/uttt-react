# UTTT React

## Chores
- [x] Refactor UTTT game component so that as much code as possible is shared with the 'versus ai' component
  - Used the `useGameLogic` hook as a reducer for the game state.

## UI
- [ ] Use 'Material Design 3' recommended practices for the UI
  - [x] Home Page
  - [ ] Pass and play
  - [ ] VS AI
  - [x] Analysis page

## Features
- [x] Add websocket support for real-time analysis
- [x] Add support for lack of websocket connection - fallback to simple HTTP requests for analysis
- [ ] Add 'notation' string to load the game state
- [x] Add more top moves (multipv) to the analysis
- [x] Make the navbar responsive, especially on mobile:
  - Add a drawer for the menu

## Bug fixes
- [x] Make no engine recommendation when analysis is turned off (after turning it on)
- [x] Don't allow player to play in AI versus mode until the user selects a turn
- [ ] Add rate limiting to analysis, when changing the engine settings
- [ ] Fix ddos attack when backend is down (on vs AI mode)
- [ ] Fix analysis bug, when hiding the available websocket closes, and falls back to http requests
