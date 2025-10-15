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
	getInitialGameState,
	getInitialBoardSettings,
	Move,
	updateSmallBoardState,
	fromNotation,
} from '@/board';
import { handleMakeMove } from '@/game';

import { useSearchParams } from 'next/navigation';
import { ActionDispatch, useEffect, useReducer, useState } from 'react';

export type GameActionType =
	| 'load-query'
	| 'makemove'
	| 'undomove'
	| 'traverse-history'
	| 'reset'
	| 'start-loading-limits'
	| 'request-limits'
	| 'set-limits'
	| 'change-settings'
	| 'toggle-settings'
	| 'change-gamestate'
	| 'load-whole-state'
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
	enabled?: boolean; // only if 'change-gamestate' is the type
	historyIndex?: number; // only if 'traverse-history' is the type
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

function handleUndoMove(
	{ game, ...other }: GameLogicState,
	undoHistory: boolean = true,
): GameLogicState {
	const prevState = game.history[game.historyIndex];
	if (prevState === undefined || prevState.move === null) {
		return { game, ...other };
	}

	const newBoards = [...game.boards];
	const newBoard = [...newBoards[prevState.move.boardIndex].board];
	newBoard[prevState.move.cellIndex] = null;
	newBoards[prevState.move.boardIndex] = updateSmallBoardState(newBoard);
	const newHistory = undoHistory ? game.history.slice(0, -1) : game.history;

	return {
		game: {
			enabled: true,
			winner: null,
			isDraw: false,
			boards: newBoards,
			activeBoard: prevState.activeBoard,
			currentPlayer: prevState.playerToMove,
			history: newHistory,
			historyIndex: Math.max(0, game.historyIndex - 1),
		},
		...other,
	};
}

function loadQuery(defaultState: GameLogicState, params: URLSearchParams) {
	// Otherwise, load from the params
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
		if (isNaN(v) || v <= 0) {
			return defaultValue;
		}
		return Math.min(v, defaultValue);
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

export function traverseHistory(
	prevstate: GameLogicState,
	historyIndex: number,
): GameLogicState {
	if (historyIndex < 0 || historyIndex >= prevstate.game.history.length) {
		return prevstate;
	}

	// Reconstruct the boards up to the target history index
	if (prevstate.game.historyIndex === historyIndex) {
		return prevstate;
	}

	if (prevstate.game.historyIndex < historyIndex) {
		// make moves forward
		let newGameState = { ...prevstate.game };
		for (let i = prevstate.game.historyIndex + 1; i <= historyIndex; i++) {
			const move = prevstate.game.history[i].move;
			if (move) {
				newGameState = handleMakeMove(newGameState, move, true);
			}
		}

		return {
			...prevstate,
			game: {
				...newGameState,
				historyIndex,
			},
		};
	} else {
		// undo moves backward
		let newState = { ...prevstate };
		for (let i = prevstate.game.historyIndex; i > historyIndex; i--) {
			newState = handleUndoMove(newState, false);
		}

		return {
			...newState,
			game: {
				...newState.game,
				historyIndex,
			},
		};
	}
}

function gameLogicReducer(
	prevstate: GameLogicState,
	action: GameAction,
): GameLogicState {
	switch (action.type) {
		case 'load-query':
			if (!action.queryParams) {
				return prevstate;
			}
			// Probably to fix, use 'defaultState' instead of 'prevstate'
			return loadQuery(prevstate, action.queryParams);

		case 'traverse-history':
			if (
				action.historyIndex === undefined ||
				action.historyIndex === prevstate.game.historyIndex
			) {
				return prevstate;
			}

			return traverseHistory(prevstate, action.historyIndex);

		case 'makemove':
			if (action.move !== undefined) {
				return {
					...prevstate,
					game: handleMakeMove(prevstate.game, action.move),
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
					gameStateInit: getInitialGameState,
				}),
				available: prevstate.available,
				action: 'reset',
				prevAction: prevstate.action,
			};

		case 'request-limits':
			return {
				...prevstate,
				action: 'request-limits',
				prevAction: prevstate.action,
				loadingLimits: true,
				available: undefined,
			};

		case 'start-loading-limits':
			return {
				...prevstate,
				loadingLimits: true,
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

		case 'load-whole-state':
			return {
				...prevstate,
				settings: action.newSettings || prevstate.settings,
				game: action.newGameState || prevstate.game,
				action: 'load-whole-state',
				prevAction: prevstate.action,
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
				available: false,
			};
	}

	return prevstate;
}

interface GameLogicInitParams {
	settingsInit: SettingsInitializer;
	gameStateInit: GameStateInitializer;
}

// Initializer function for game logic reducer
function gameLogicInit({
	settingsInit,
	gameStateInit,
}: GameLogicInitParams): GameLogicState {
	return {
		game: gameStateInit(),
		settings: settingsInit(),
		limits: getInitialEngineLimits(),
		loadingLimits: false,
		action: null,
		prevAction: null,
		available: undefined,
	};
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
	const searchParams = useSearchParams();
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchLimits, setFetchLimits] = useState<boolean | undefined>(!local);
	const [state, dispatch] = useReducer(
		gameLogicReducer,
		{
			settingsInit: settingsInit || getInitialBoardSettings,
			gameStateInit: gameStateInit || getInitialGameState,
		},
		gameLogicInit,
	);

	// Update URL search params to reflect game state
	useEffect(() => {
		if (!useQuery) {
			return;
		}

		// Update URL search params to reflect game state
		if (typeof window === 'undefined') {
			return;
		}

		if (firstLoad) {
			// On first load, if there are query params, load from them
			if (searchParams.toString().length > 0) {
				dispatch({
					type: 'load-query',
					queryParams: searchParams,
				});
			}
			setFirstLoad(false);
			return;
		}

		// If there are already other params in the URL, preserve them
		const params = new URLSearchParams(searchParams);
		if (searchParams.toString().length > 0) {
			params.forEach((value, key) => {
				params.set(key, value);
			});
		}

		const currentAnalysisData = analysisToQuery(
			toAnalysisRequest(state.settings, state.game),
		);

		currentAnalysisData.forEach((value, key) => {
			params.set(key, value);
		});

		const url = new URL(window.location.href);
		url.search = params.toString();
		window.history.replaceState({}, '', url.toString());
	}, [state.game, state.settings, useQuery, firstLoad, searchParams]);

	useEffect(() => {
		if (state.action === 'request-limits') {
			// Toggle fetchLimits to trigger useEffect below
			setFetchLimits((prev) => (prev === undefined ? true : undefined));
		}
	}, [state.action]);

	// Fetch limits
	useEffect(() => {
		if (fetchLimits === false) {
			return;
		}

		dispatch({ type: 'start-loading-limits' });
		getEngineLimits()
			.then((limits) => {
				dispatch({ type: 'set-limits', limits: limits });
			})
			.catch((e) => {
				console.error('Failed to fetch engine limits:', e);
				dispatch({ type: 'unavailable' });
			});
	}, [fetchLimits]);

	return [state, dispatch];
}
