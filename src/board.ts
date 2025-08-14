export type Player = 'X' | 'O' | null;
export type SmallBoard = Player[];
export type BoardIndicator = number | null;

export interface Move {
	boardIndex: number;
	cellIndex: number;
}

export interface SmallBoardState {
	board: SmallBoard;
	winner: Player;
	isDraw: boolean;
}

export interface HistoryState {
	move: Move;
	playerToMove: Player;
	activeBoard: BoardIndicator;
}

export interface GameState {
	boards: SmallBoardState[];
	currentPlayer: Player;
	winner: Player;
	isDraw: boolean;
	activeBoard: BoardIndicator; // Which small board the next player must play in
	history: HistoryState[];
	enabled: boolean;
}

export type BoardSizeOption = 'small' | 'normal' | 'large';

export function getInitalBoardSettings(): BoardSettings {
	return {
		boardSize: 'normal',
		showAnalysis: false,
		engineDepth: 10,
		nThreads: 2,
		memorySizeMb: 12,
		multiPv: 3,
	};
}

export interface BoardSettings {
	boardSize: BoardSizeOption;
	showAnalysis: boolean;
	engineDepth: number;
	nThreads: number;
	memorySizeMb: number;
	multiPv: number;
}

export const getInitialBoardState = (): GameState => {
	const boards: SmallBoardState[] = [];
	for (let i = 0; i < 9; i++) {
		boards.push({
			board: Array(9).fill(null),
			winner: null,
			isDraw: false,
		});
	}

	return {
		boards,
		currentPlayer: 'X',
		winner: null,
		isDraw: false,
		activeBoard: null, // First move can be anywhere
		history: [],
		enabled: true,
	};
};

/**
 * Convert given game state into string notation of the board
 * @param state state of the game
 * @returns string notation, as specified in notation.go
 */
export function ToNotation(state: GameState): string {
	let notation = '';
	let emptyCounter = 0,
		rowIndex = 0;

	// Build the position notation
	for (; rowIndex < 9; rowIndex++) {
		emptyCounter = 0;

		for (let i = 0; i < 9; i++) {
			switch (state.boards[rowIndex].board[i]) {
				case 'O':
				case 'X':
					if (emptyCounter > 0) {
						notation += emptyCounter.toFixed(0);
						emptyCounter = 0;
					}

					notation +=
						state.boards[rowIndex].board[i] == 'X' ? 'x' : 'o';
					break;
				default:
					emptyCounter += 1;
			}
		}

		if (emptyCounter > 0) {
			notation += emptyCounter.toFixed(0);
		}

		if (rowIndex != 8) {
			notation += '/';
		}
	}

	// Add the turn
	notation += ' ';
	notation += state.currentPlayer == 'X' ? 'x' : 'o';

	// Add the active board index
	notation += ' ';
	if (state.activeBoard == null) {
		notation += '-';
	} else {
		notation += state.activeBoard.toFixed(0);
	}

	return notation;
}
