# UTTT React

## Chores
- [x] Refactor UTTT game component so that as much code as possible is shared with the 'versus ai' component
  - Used the `useGameLogic` hook as a reducer for the game state.
- [ ] Move to SSE instead of websockets for the analysis page, to allow static export of the app
  - what the fuck is even SSE?


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

## Bug fixes
- [x] Make no engine recommendation when analysis is turned off (after turning it on)
- [x] Don't allow player to play in AI versus mode until the user selects a turn
- [x] Add rate limiting to analysis, when changing the engine settings
- [ ] Fix ddos attack when backend is down (on vs AI mode)
- [x] Fix analysis bug, when hiding the available websocket closes, and falls back to http requests
- [ ] Analysis bug: when in ws connection and changing the position before the analysis is done, it stops completely current analysis and doesn't start a new one


## Misc
- [ ] Add icon for the app 