# UTTT React

## Chores
- [x] Refactor UTTT game component so that as much code as possible is shared with the 'versus ai' component
  - Used the `useGameLogic` hook as a reducer for the game state.
- [ ] Move to SSE instead of websockets for the analysis page, to allow static export of the app
  - what the fuck is even SSE?
- [ ] Implement error handling for the every engine API 
- [ ] Disable related part of the UI on errors
  - Show a snackbar notification on errors

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
- [ ] Animate main pages:
  - [ ] Home page
  - [x] Pass and play
  - [x] VS AI
  - [ ] Analysis page
    - The menus should appear like in the VS-AI page along with the board
    - If the engine responds in shorter time than ~400ms, then artificially slow down the move making to match the 400ms duration.

## Bug fixes
- [x] Make no engine recommendation when analysis is turned off (after turning it on)
- [x] Don't allow player to play in AI versus mode until the user selects a turn
- [x] Add rate limiting to analysis, when changing the engine settings
- [ ] Fix ddos attack when backend is down (on vs AI mode)
- [x] Fix analysis bug, when hiding the available websocket closes, and falls back to http requests

## Misc
- [ ] Add icon for the app 