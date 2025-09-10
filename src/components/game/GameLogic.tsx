'use client';

import {
	analysisToQuery,
	EngineLimits,
	getEngineLimits,
	getInitialEngineLimits,
	toAnalysisRequest,
} from '@/api';
import {
	BoardSettings,
	GameState,
	getInitialBoardState,
	getInitialBoardSettings,
	Move,
	updateSmallBoardState,
	checkTerminalState,
	fromNotation,
} from '@/board';
import { ActionDispatch, useEffect, useReducer } from 'react';

export type GameActionType =
	| 'load-query'
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
	queryParams?: URLSearchParams; // if provided, will load game state from these params
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
	const [overallDraw, overallWinner] = checkTerminalState(newBoards);

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

function loadQuery(defaultState: GameLogicState, params: URLSearchParams) {
	let gameState = defaultState.game;
	const pos = params.get('position');
	if (pos !== null) {
		try {
			gameState = fromNotation(
				pos.replaceAll('n', '/').replaceAll('_', ' '),
			);
		} catch (e) {
			console.error('Failed to parse position from query:', e);
		}
	}

	function parseIntParam(param: string | null, defaultValue: number): number {
		if (param === null) {
			return defaultValue;
		}
		const v = parseInt(param, 10);
		if (isNaN(v)) {
			return defaultValue;
		}
		return v;
	}

	let settings = defaultState.settings;
	settings = {
		...settings,
		engineDepth: parseIntParam(params.get('depth'), settings.engineDepth),
		nThreads: parseIntParam(params.get('threads'), settings.nThreads),
		memorySizeMb: parseIntParam(
			params.get('sizemb'),
			settings.memorySizeMb,
		),
		multiPv: parseIntParam(params.get('multipv'), settings.multiPv),
	};

	return {
		...defaultState,
		game: gameState,
		settings,
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
				...gameLogicInit({
					settingsInit:
						action.settingsInit || getInitialBoardSettings,
					gameStateInit: getInitialBoardState,
				}),
				available: prevstate.available,
				action: 'reset',
				prevAction: prevstate.action,
			};

		case 'set-limits':
			const limits = action.limits || prevstate.limits;
			const loadingLimits =
				action.loadingLimits !== undefined
					? action.loadingLimits
					: false;
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

interface GameLogicInitParams {
	settingsInit: SettingsInitializer;
	gameStateInit: GameStateInitializer;
	loadQueryParams?: boolean; // if true, will load game state from URL query params
}

// Initializer function for game logic reducer
function gameLogicInit({
	settingsInit,
	gameStateInit,
	loadQueryParams,
}: GameLogicInitParams): GameLogicState {
	const defaultState: GameLogicState = {
		game: gameStateInit(),
		settings: settingsInit(),
		limits: getInitialEngineLimits(),
		loadingLimits: false,
		action: null,
		prevAction: null,
		available: undefined,
	};

	if (loadQueryParams) {
		if (typeof window === 'undefined') {
			return defaultState;
		}

		return loadQuery(
			defaultState,
			new URLSearchParams(window.location.search),
		);
	}

	return defaultState;
}

interface UseGameLogicParams {
	settingsInit?: SettingsInitializer;
	gameStateInit?: GameStateInitializer;
	local?: boolean; // if true, won't fetch engine limits
	useQuery?: boolean; // if true, will update URL search params on game state change
}

// Returns reducer [state, dispatch] for handling the ultimate tic tac toe game state
export function useGameLogic({
	settingsInit,
	gameStateInit,
	local = false,
	useQuery = false,
}: UseGameLogicParams = {}): [GameLogicState, ActionDispatch<[GameAction]>] {
	const [state, dispatch] = useReducer(
		gameLogicReducer,
		{
			settingsInit: settingsInit || getInitialBoardSettings,
			gameStateInit: gameStateInit || getInitialBoardState,
			loadQueryParams: useQuery,
		},
		gameLogicInit,
	);

	// Update URL search params to reflect game state
	useEffect(() => {
		if (!useQuery) {
			return;
		}

		// Update URL search params to reflect game state
		const url = new URL(window.location.href);
		const params = analysisToQuery(
			toAnalysisRequest(state.settings, state.game),
		);

		url.search = params.toString();
		window.history.replaceState({}, '', url.toString());
	}, [state.game, state.settings, useQuery]);

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
