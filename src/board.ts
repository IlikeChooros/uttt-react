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

export function getInitialBoardSettings(): BoardSettings {
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

// Checks if there is a winner in tic tac toe sense on provided board
export function checkWinner(board: SmallBoard): null | Player {
	const patterns = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[2, 4, 6],
		[0, 4, 8],
	];

	for (const [a, b, c] of patterns) {
		if (board[a] && board[a] === board[b] && board[b] === board[c]) {
			return board[a];
		}
	}
	return null;
}

// Returns [isDraw, winner]
export function checkTerminalState(
	boards: GameState['boards'],
): [boolean, Player | null] {
	const overallWinner = checkWinner(boards.map((v) => v.winner));
	const overallDraw =
		!overallWinner && boards.every((b) => b.winner || b.isDraw);
	return [overallWinner !== null || overallDraw, overallWinner];
}

// returns new small board state, with updated 'winner' and 'isDraw' fields
export function updateSmallBoardState(
	board: SmallBoardState['board'],
): SmallBoardState {
	const winner = checkWinner(board);
	const isDraw = !winner && board.every((cell) => cell !== null);
	return { board, winner, isDraw };
}

/**
 * Convert given game state into string notation of the board
 * @param state state of the game
 * @returns string notation, as specified in notation.go
 */
export function toNotation(state: GameState): string {
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

export function fromNotation(notation: string): GameState {
	const parts = notation.split(' ');
	if (parts.length < 3) {
		throw new Error(
			'Invalid notation, expected 3 parts, got ' + parts.length,
		);
	}

	const boards: SmallBoardState[] = [];
	const rows = parts[0].split('/');
	if (rows.length != 9) {
		throw new Error(
			'Invalid notation, expected 9 rows, got ' + rows.length,
		);
	}

	for (let i = 0; i < 9; i++) {
		const row = rows[i];
		const board: SmallBoard = Array(9).fill(null);
		let cellIndex = 0;

		for (let j = 0; j < row.length; j++) {
			const char = row[j];
			switch (row[j]) {
				case 'X':
				case 'x':
				case 'O':
				case 'o':
					if (cellIndex >= 9) {
						throw new Error(
							'Invalid notation, too many cells in board ' +
								i.toString(),
						);
					}
					board[cellIndex] = char.toUpperCase() === 'X' ? 'X' : 'O';
					cellIndex += 1;
					break;
				default:
					// Should be a number
					const n = parseInt(char, 10);
					if (isNaN(n) || n < 1 || n > 9) {
						throw new Error(
							'Invalid notation, expected digit 1-9, got ' + char,
						);
					}
					if (cellIndex + n > 9) {
						throw new Error(
							'Invalid notation, too many cells in board ' +
								i.toString(),
						);
					}
					cellIndex += n;
					break;
			}
		}

		boards.push(updateSmallBoardState(board));
	}

	return {
		boards,
		currentPlayer: parts[1] === 'x' ? 'X' : 'O',
		winner: null,
		isDraw: false,
		activeBoard: parts[2] === '-' ? null : parseInt(parts[2], 10),
		history: [],
		enabled: true,
	};
}
