'use client';

import { EngineLimits, getEngineLimits, getInitialEngineLimits } from '@/api';
import {
	BoardSettings,
	GameState,
	getInitialBoardState,
	getInitalBoardSettings,
	Move,
	Player,
	SmallBoard,
	SmallBoardState,
} from '@/board';
import { ActionDispatch, useEffect, useReducer } from 'react';

export type GameActionType =
	| 'makemove'
	| 'undomove'
	| 'reset'
	| 'set-limits'
	| 'change-settings'
	| 'change-gamestate';
export type SettingsInitializer = () => BoardSettings;
export type GameStateInitializer = () => GameState;

export interface GameAction {
	type: GameActionType;
	move?: Move; // only if 'makemove' is the type
	settingsInit?: SettingsInitializer; // will use this function to reset the settings
	limits?: EngineLimits;
	loadingLimits?: boolean;
	newSettings?: BoardSettings;
	newGameState?: GameState;
}

export interface GameLogicState {
	game: GameState;
	settings: BoardSettings;
	limits: EngineLimits;
	loadingLimits: boolean;
}

// Checks if there is a winner in tic tac toe sense on provided board
function checkWinner(board: SmallBoard): null | Player {
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

// returns new small board state, with updated 'winner' and 'isDraw' fields
function updateSmallBoardState(
	board: SmallBoardState['board'],
): SmallBoardState {
	const winner = checkWinner(board);
	const isDraw = !winner && board.every((cell) => cell !== null);
	return { board, winner, isDraw };
}

// Main function to handle moves, returns new state
function handleMakeMove(
	{ game, settings, ...other }: GameLogicState,
	{ boardIndex, cellIndex }: Move,
): GameLogicState {
	// Check if move is valid
	if (
		game.winner ||
		game.isDraw ||
		game.boards[boardIndex].board[cellIndex] !== null ||
		game.boards[boardIndex].winner ||
		game.boards[boardIndex].isDraw ||
		(game.activeBoard !== null && game.activeBoard !== boardIndex)
	) {
		return { game, settings, ...other };
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
	const overallWinner = checkWinner(newBoards.map((v) => v.winner));
	const overallDraw =
		!overallWinner && newBoards.every((b) => b.winner || b.isDraw);

	const newHistory = game.history.concat({
		move: { boardIndex, cellIndex },
		activeBoard: game.activeBoard,
		playerToMove: game.currentPlayer,
	});

	return {
		game: {
			boards: newBoards,
			currentPlayer: game.currentPlayer === 'X' ? 'O' : 'X',
			winner: overallWinner,
			isDraw: overallDraw,
			activeBoard: nextActiveBoard,
			history: newHistory,
			enabled: true,
		},
		settings,
		...other,
	};
}

function handleUndoMove({ game, ...other }: GameLogicState): GameLogicState {
	const prevState = game.history.at(-1);
	if (prevState === undefined) {
		return { game, ...other };
	}

	const newBoards = [...game.boards];
	const newBoard = [...newBoards[prevState.move.boardIndex].board];
	newBoard[prevState.move.cellIndex] = null;
	newBoards[prevState.move.boardIndex] = updateSmallBoardState(newBoard);

	return {
		game: {
			enabled: true,
			winner: null,
			isDraw: false,
			boards: newBoards,
			activeBoard: prevState.activeBoard,
			currentPlayer: prevState.playerToMove,
			history: game.history.slice(0, -1),
		},
		...other,
	};
}

function gameLogicReducer(
	prevstate: GameLogicState,
	action: GameAction,
): GameLogicState {
	switch (action.type) {
		case 'makemove':
			if (action.move !== undefined) {
				return handleMakeMove(prevstate, action.move);
			}
			break;

		case 'undomove':
			return handleUndoMove(prevstate);

		case 'reset':
			return gameLogicInit(
				action.settingsInit === undefined
					? getInitalBoardSettings
					: action.settingsInit,
				getInitialBoardState,
			)();

		case 'set-limits':
			const limits = action.limits || prevstate.limits;
			const loadingLimits =
				action.loadingLimits !== undefined
					? action.loadingLimits
					: prevstate.loadingLimits;
			return {
				...prevstate,
				settings: {
					...prevstate.settings,
					engineDepth: Math.min(
						prevstate.settings.engineDepth,
						limits.depth,
					),
					nThreads: Math.min(
						prevstate.settings.nThreads,
						limits.threads,
					),
					memorySizeMb: Math.min(
						prevstate.settings.memorySizeMb,
						limits.mbsize,
					),
				},
				limits,
				loadingLimits,
			};

		case 'change-settings':
			return {
				...prevstate,
				settings:
					action.newSettings !== undefined
						? action.newSettings
						: prevstate.settings,
			};

		case 'change-gamestate':
			return {
				...prevstate,
				game:
					action.newGameState !== undefined
						? action.newGameState
						: prevstate.game,
			};
	}

	return prevstate;
}

// Initializer function for game logic reducer
function gameLogicInit(
	settingsInit: SettingsInitializer,
	gameStateInit: GameStateInitializer,
): () => GameLogicState {
	return () => ({
		game: gameStateInit(),
		settings: settingsInit(),
		limits: getInitialEngineLimits(),
		loadingLimits: false,
	});
}

// Returns reducer [state, dispatch] for handling the ultimate tic tac toe game state
export function useGameLogic(
	settingsInit: SettingsInitializer | null = null,
	gameStateInit: GameStateInitializer | null = null,
): [GameLogicState, ActionDispatch<[GameAction]>] {
	const [state, dispatch] = useReducer(
		gameLogicReducer,
		settingsInit,
		gameLogicInit(
			settingsInit == null ? getInitalBoardSettings : settingsInit,
			gameStateInit == null ? getInitialBoardState : gameStateInit,
		),
	);

	// Fetch limits
	useEffect(() => {
		dispatch({ type: 'set-limits', loadingLimits: true });
		getEngineLimits()
			.then((limits) => {
				dispatch({ type: 'set-limits', limits: limits });
			})
			.catch((err) => {
				console.error(err);
			})
			.finally(() => {
				// DEBUG
				setTimeout(
					() =>
						dispatch({ type: 'set-limits', loadingLimits: false }),
					1000,
				);
			});
	}, []);

	return [state, dispatch];
}
