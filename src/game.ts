import {
	checkTerminalState,
	fromNotation,
	GameState,
	getInitialGameState,
	INITIAL_POSITION,
	Move,
	moveNotation,
	parseMoveNotation,
	updateSmallBoardState,
} from '@/board';

export type ExportFieldNames =
	| 'Event'
	| 'Date'
	| 'Round'
	| 'X'
	| 'O'
	| 'Result'
	| 'Setup'
	| 'Position'
	| 'BoardState';

export type ExportField = [ExportFieldNames, value: string];

export interface ExportOptions {
	includeFields: ExportField[];
	includeResult: boolean;
}

export interface ExportedGame {
	headers: ExportField[];
	moves: string[];
	result: string;
}

export function exportedGameString(exported: ExportedGame): string {
	let result = '';
	for (const [name, value] of exported.headers) {
		result += `[${name} "${value}"]\n`;
	}
	if (exported.moves.length > 0) {
		// Moves are 1-indexed for display purposes
		let moveNumber = 1;
		for (let i = 1; i < exported.moves.length; i += 2) {
			result += `${moveNumber}. ${exported.moves[i]} `;
			if (i + 1 < exported.moves.length) {
				result += `${exported.moves[i + 1]} `;
			}
			moveNumber += 1;
		}
		result = result.trim();
	}

	if (exported.result) {
		result += `\n${exported.result}`;
	}

	return result + '\n';
}

export function exportGameState(
	state: GameState,
	options: ExportOptions = { includeFields: [], includeResult: true },
): ExportedGame {
	const exported: ExportedGame = {
		headers: [],
		moves: [],
		result: '',
	};
	// This is similar to PGN, but adapted for Ultimate Tic Tac Toe
	const defaultFields: ExportField[] = [
		['Event', 'Casual Game'],
		['Date', new Date().toISOString().split('T')[0]],
		['Round', '1'],
		['X', 'Player X'],
		['O', 'Player O'],
	];

	if (
		state.history[0].position &&
		state.history[0].position !== INITIAL_POSITION
	) {
		defaultFields.push(['Setup', '1']);
		defaultFields.push(['Position', state.history[0].position]);
	}

	// Merge and deduplicate fields, preserving order (options fields override defaults)
	const mergedFields = new Map<ExportFieldNames, string>();
	for (const [name, value] of [...defaultFields, ...options.includeFields]) {
		mergedFields.set(name, value);
	}

	const fields = [...mergedFields.entries()];

	if (options.includeResult) {
		let result = '*';
		if (state.winner === 'X') result = '1-0';
		else if (state.winner === 'O') result = '0-1';
		else if (state.isDraw) result = '1/2-1/2';

		if (!fields.some(([n]) => n === 'Result')) {
			fields.push(['Result', result]);
		}
	}

	const moves: string[] = new Array(state.history.length);
	moves[0] = '...'; // Placeholder for 1-based indexing
	for (let i = 1; i < state.history.length; i++) {
		const move = state.history[i].move;
		if (move) {
			moves[i] = moveNotation(move);
		}
	}

	exported.moves = moves;
	exported.headers = fields;
	exported.result = fields.find(([n]) => n === 'Result')?.[1] || '';

	return exported;
}

export function importGameState(exported: ExportedGame): GameState {
	if (exported.moves.length === 0) {
		throw new Error('No moves in exported game');
	}

	// Start from initial state
	let game = getInitialGameState();
	const headerObj = Object.fromEntries(exported.headers);

	// Setup position if provided
	if (headerObj['Setup'] === '1' && headerObj['Position']) {
		const position = headerObj['Position'];
		try {
			game = fromNotation(position);
		} catch (error) {
			throw new Error(`Invalid position notation: ${error}`);
		}
	}

	// Apply all moves
	for (let i = 1; i < exported.moves.length; i++) {
		const moveStr = exported.moves[i];
		const move = parseMoveNotation(moveStr);
		if (!move) {
			throw new Error('Invalid move notation: ' + moveStr);
		}

		// Apply the move
		const currentBoard = game.boards[move.boardIndex];
		if (currentBoard.winner || currentBoard.isDraw) {
			throw new Error(
				'Cannot play in a finished small board: ' +
					move.boardIndex.toString(),
			);
		}
		if (game.activeBoard !== null && game.activeBoard !== move.boardIndex) {
			throw new Error(
				'Must play in the active board: ' + game.activeBoard.toString(),
			);
		}
		if (currentBoard.board[move.cellIndex] !== null) {
			throw new Error(
				'Cell already occupied in board ' +
					move.boardIndex.toString() +
					', cell ' +
					move.cellIndex.toString(),
			);
		}
		// Apply the move
		try {
			game = handleMakeMove(game, move, false, true);
		} catch (error) {
			throw new Error('Failed to apply move: ' + error);
		}
	}

	return game;
}

export function parseExportedGame(text: string): ExportedGame {
	const lines = text.split('\n');
	const headers: ExportField[] = [];
	const moves: string[] = [];
	let result = '';

	let inHeader = true;
	for (const line of lines) {
		const trimmed = line.trim();
		if (inHeader && trimmed.startsWith('[') && trimmed.endsWith(']')) {
			const match = trimmed.match(/^\[(\w+)\s+"(.*)"\]$/);
			if (match) {
				const [, name, value] = match;
				headers.push([name as ExportFieldNames, value]);
			}
		} else {
			inHeader = false;
			if (trimmed === '') continue;
			const parts = trimmed.split(/\s+/);
			for (const part of parts) {
				// Results are not moves
				if (
					part === '1-0' ||
					part === '0-1' ||
					part === '1/2-1/2' ||
					part === '*'
				) {
					result = part;
				}
				// Ignore move numbers
				else if (!part.match(/^\d+\.$/)) {
					moves.push(part);
				}
			}
		}
	}

	return { headers, moves: ['...'].concat(moves), result }; // Prepend empty string for 1-based indexing
}
// Main function to handle moves, returns new state
export function handleMakeMove(
	game: GameState,
	{ boardIndex, cellIndex }: Move,
	traverse: boolean = false,
	throwErrors: boolean = false,
): GameState {
	// Check if move is valid
	if (
		game.winner ||
		game.isDraw ||
		game.boards[boardIndex].board[cellIndex] !== null ||
		game.boards[boardIndex].winner ||
		game.boards[boardIndex].isDraw ||
		(game.activeBoard !== null && game.activeBoard !== boardIndex)
	) {
		if (throwErrors) {
			throw new Error(
				`Invalid move: ${moveNotation({ boardIndex, cellIndex })}`,
			);
		}

		return game; // Invalid move, return current state
	}

	// Make the move
	const newBoards = [...game.boards];
	const newBoard = [...newBoards[boardIndex].board];
	newBoard[cellIndex] = game.currentPlayer;

	// Update the small board state
	newBoards[boardIndex] = updateSmallBoardState(newBoard);

	// Determine next active board
	const nextActiveBoard =
		newBoards[cellIndex].winner || newBoards[cellIndex].isDraw
			? null // Can play anywhere if target board is complete
			: cellIndex;

	// Check for overall winner
	const [overallDraw, overallWinner] = checkTerminalState(newBoards);
	let prevGame = game;
	let newHistory = prevGame.history;

	if (!traverse) {
		// If we are not at the end of history, truncate the history
		if (game.historyIndex < game.history.length - 1) {
			prevGame = {
				...prevGame,
				history: prevGame.history.slice(0, prevGame.historyIndex + 1),
			};
		}

		newHistory = prevGame.history.concat({
			move: { boardIndex, cellIndex },
			activeBoard: game.activeBoard,
			playerToMove: game.currentPlayer,
		});
	}

	return {
		boards: newBoards,
		currentPlayer: game.currentPlayer === 'X' ? 'O' : 'X',
		winner: overallWinner,
		isDraw: overallDraw,
		activeBoard: nextActiveBoard,
		history: newHistory,
		enabled: true,
		historyIndex: newHistory.length - 1,
	};
}
