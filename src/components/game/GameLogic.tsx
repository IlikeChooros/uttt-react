'use client';

import {
	EngineAPI,
	EngineLimits,
	getEngineLimits,
	getInitialEngineLimits,
} from '@/api';
import {
	BoardSettings,
	GameState,
	getInitialBoardState,
	getInitialBoardSettings,
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
	| 'toggle-settings'
	| 'change-gamestate'
	| 'unavailable';
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
	action: GameActionType | null;
	prevAction: GameActionType | null;
	available?: boolean; // whether the engine is available (backend responds)
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
				return {
					...handleMakeMove(prevstate, action.move),
					action: 'makemove',
					prevAction: prevstate.action,
				};
			}
			break;

		case 'undomove':
			return {
				...handleUndoMove(prevstate),
				action: 'undomove',
				prevAction: prevstate.action,
			};

		case 'reset':
			return {
				...gameLogicInit(
					action.settingsInit === undefined
						? getInitialBoardSettings
						: action.settingsInit,
					getInitialBoardState,
				)(),
				action: 'reset',
				prevAction: prevstate.action,
			};

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
				action: 'set-limits',
				prevAction: prevstate.action,
				available: true,
			};

		case 'change-settings':
			return {
				...prevstate,
				action: 'change-settings',
				prevAction: prevstate.action,
				settings:
					action.newSettings !== undefined
						? action.newSettings
						: prevstate.settings,
			};
		case 'toggle-settings':
			return {
				...prevstate,
				action: 'toggle-settings',
				prevAction: prevstate.action,
				settings: {
					...prevstate.settings,
					showAnalysis: !prevstate.settings.showAnalysis,
				},
			};

		case 'change-gamestate':
			return {
				...prevstate,
				action: 'change-gamestate',
				prevAction: prevstate.action,
				game:
					action.newGameState !== undefined
						? action.newGameState
						: prevstate.game,
			};
		case 'unavailable':
			return {
				...prevstate,
				action: 'unavailable',
				prevAction: prevstate.action,
				loadingLimits: false,
				game: {
					...prevstate.game,
					enabled: false,
				},
				available: false,
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
		action: null,
		prevAction: null,
		available: undefined,
	});
}

interface UseGameLogicParams {
	settingsInit?: SettingsInitializer;
	gameStateInit?: GameStateInitializer;
	local?: boolean; // if true, won't fetch engine limits
}

// Returns reducer [state, dispatch] for handling the ultimate tic tac toe game state
export function useGameLogic({
	settingsInit,
	gameStateInit,
	local = false,
}: UseGameLogicParams = {}): [GameLogicState, ActionDispatch<[GameAction]>] {
	const [state, dispatch] = useReducer(
		gameLogicReducer,
		settingsInit,
		gameLogicInit(
			settingsInit == undefined ? getInitialBoardSettings : settingsInit,
			gameStateInit == undefined ? getInitialBoardState : gameStateInit,
		),
	);

	// Fetch limits
	useEffect(() => {
		if (local) {
			return;
		}

		dispatch({ type: 'set-limits', loadingLimits: true });
		getEngineLimits()
			.then((limits) => {
				dispatch({ type: 'set-limits', limits: limits });
			})
			.catch(() => {
				dispatch({ type: 'unavailable' });
			});
	}, [local]);

	return [state, dispatch];
}
