'use client';

// react stuff
import { act, ActionDispatch, useEffect, useReducer } from 'react';

// mine components
import {
	AnalysisActionType,
	AnalysisOptions,
	AnalysisResponse,
	AnalysisState,
	EngineAPI,
	getInitialAnalysisState,
} from '@/api';

// return value of useAnalysis, state and dispatch
export type Analysis = [AnalysisState, ActionDispatch<[AnalysisAction]>];

export interface AnalysisAction {
	type: AnalysisActionType;
	ws?: WebSocket | null;
	eventSource?: EventSource | null;
	state?: {
		thinking?: AnalysisState['thinking'];
		currentEvaluation?: AnalysisState['currentEvaluation'];
		bestMove?: AnalysisState['bestMove'];
		topMoves?: AnalysisState['topMoves'];
		request?: AnalysisState['request'];
		absEvaluation?: AnalysisState['absEvaluation'];
		connectionId?: string;
	};

	default?: AnalysisState;
	rtState?: AnalysisState['rtState'];
	options?: AnalysisOptions;
}

// main reducer function for handling analysis state
function analysisReducer(
	prev: AnalysisState,
	action: AnalysisAction,
): AnalysisState {
	switch (action.type) {
		case 'set-event-source':
			if (action.eventSource === undefined) {
				return prev;
			}
			return {
				...prev,
				rtState: action.rtState || 'connected',
				action: 'set-event-source',
			};
		case 'set-rt-state':
			if (action.rtState === undefined) {
				return prev;
			}
			return { ...prev, rtState: action.rtState, action: 'set-rt-state' };
		case 'start-thinking':
			return {
				...prev,
				thinking: true,
				lastRequest: prev.request,
				request: null,
				action: 'start-thinking',
			};
		case 'stop-thinking':
			return { ...prev, thinking: false };
		case 'set-response':
			// expects: 'bestMove', 'topMoves', 'currentEvaluation'
			return {
				...prev,
				lastRequest: null,
				thinking: false,
				action: 'set-response',
				...action.state,
			};

		// 'public' api
		case 'set-options':
			if (action.options === undefined) {
				return prev;
			}
			return { ...prev, ...action.options, action: 'set-options' };
		case 'fallback': // used if 'fallbackToHttp' is true and we got an error in web socket
			return {
				...prev,
				lastRequest: null,
				request: prev.request,
				rtFailed: true,
				thinking: false,
				rtState: 'failed',
				action: 'fallback',
			};

		case 'sse-connected':
			if (action.state?.connectionId === undefined) {
				return prev;
			}
			return {
				...prev,
				connectionId: action.state.connectionId,
				rtState: 'connected',
				action: 'sse-connected',
			};

		// simply close the the connection
		case 'close':
			return {
				...prev,
				request: null,
				thinking: false,
				rtState: 'closed',
				action: 'close',
				eventSource: null,
				connectionId: undefined,
			};
		case 'cleanup':
			if (action.default === undefined) {
				return prev;
			}
			console.log('Closing event source on cleanup');
			return action.default;

		// make a new request to analyze the position only if we aren't currenlty
		// analyzing other position
		case 'analyze':
			if (action.state?.request === undefined || prev.thinking) {
				return prev;
			}
			return {
				...prev,
				request: action.state.request,
				action: 'analyze',
			};
		// requests websocket connection
		case 'request-connection':
			return {
				...prev,
				request: null,
				rtState: 'request-connection',
				action: 'request-connection',
			};
		// requests websocket disconnection
		case 'request-disconnection':
			return {
				...prev,
				request: null,
				rtState: 'request-disconnection',
				action: 'request-disconnection',
			};
		default:
			break;
	}
	return prev;
}

export function useAnalysis(
	options: AnalysisOptions = { useRtAnalysis: false, fallbackToHttp: false },
): Analysis {
	const [state, dispatch] = useReducer(
		analysisReducer,
		undefined,
		getInitialAnalysisState,
	);

	useEffect(() => {
		// If we aren't analyzing the position AND there is an request

		if (
			state.request &&
			options.useRtAnalysis &&
			!state.rtFailed &&
			state.connectionId
		) {
			console.log('sse analysis', state.request);
			dispatch({ type: 'start-thinking' });
			EngineAPI.analyzeSSE({
				...state.request,
				connId: state.connectionId || '',
			}).catch((error) => {
				console.error(error);
			});
		}

		// If we aren't analyzing the position AND there is an request
		if (
			state.request &&
			!state.thinking &&
			(!options.useRtAnalysis ||
				(state.rtFailed && options.fallbackToHttp))
		) {
			console.log('request', state.request);
			dispatch({ type: 'start-thinking' });
			EngineAPI.analyze(state.request)
				.then((bestMoves) => {
					dispatch({
						type: 'set-response',
						state: {
							currentEvaluation: bestMoves[0].evaluation,
							absEvaluation: bestMoves[0].abseval,
							bestMove: bestMoves[0],
							topMoves: bestMoves,
						},
					});
				})
				.catch((error) => {
					console.error(error);
				});
		}
	}, [
		options.useRtAnalysis,
		options.fallbackToHttp,
		state.thinking,
		state.request,
		state.rtFailed,
		state.connectionId,
	]);

	// Setup/teardown of event source connection
	useEffect(() => {
		if (!options.useRtAnalysis) {
			return;
		}

		let eventSource: EventSource | null = null;
		try {
			// Open the event source connection
			eventSource = EngineAPI.createEventSource();

			// Set connection id on connection event
			eventSource.addEventListener('connected', (event) => {
				if (typeof event.data !== 'string') {
					console.error('Invalid connection event data:', event.data);
					return;
				}
				const { connId } = JSON.parse(event.data);
				dispatch({
					type: 'sse-connected',
					state: { connectionId: connId },
				});
				console.log('connection', event);
			});

			eventSource.addEventListener('analysis', (event) => {
				const analysis: AnalysisResponse = JSON.parse(event.data);
				const lines = EngineAPI.parseAnalysisResponse(analysis);
				dispatch({
					type: 'set-response',
					state: {
						currentEvaluation: lines[0].evaluation,
						absEvaluation: lines[0].abseval,
						bestMove: lines[0],
						topMoves: lines,
						thinking: !analysis.final,
					},
				});
			});

			eventSource.onopen = (event) => {
				console.log('Connected to event source', event);
				dispatch({ type: 'set-rt-state', rtState: 'connected' });
			};

			eventSource.onerror = () => {
				eventSource?.close();
				dispatch({ type: 'close' });
			};

			dispatch({
				type: 'set-event-source',
				eventSource,
				rtState: 'connecting',
			});
		} catch (error) {
			console.error('Failed to create EventSource:', error);
		}

		return () => {
			eventSource?.close();
			dispatch({
				type: 'cleanup',
				default: getInitialAnalysisState(),
			});
		};
	}, [options.useRtAnalysis]);

	return [state, dispatch];
}
