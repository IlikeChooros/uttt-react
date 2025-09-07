'use client';

// react stuff
import { ActionDispatch, useEffect, useReducer } from 'react';

// mine components
import {
	AnalysisActionType,
	AnalysisOptions,
	AnalysisRequest,
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

	wsState?: AnalysisState['wsState'];
	options?: AnalysisOptions;
}

// main reducer function for handling analysis state
function analysisReducer(
	prev: AnalysisState,
	action: AnalysisAction,
): AnalysisState {
	switch (action.type) {
		case 'set-ws':
			if (action.ws === undefined) {
				return prev;
			}
			return {
				...prev,
				ws: action.ws,
				wsState: action.ws ? 'connected' : 'disconnected',
				action: 'set-ws',
			};
		case 'set-event-source':
			if (action.eventSource === undefined) {
				return prev;
			}
			return {
				...prev,
				ws: null,
				wsState: action.wsState || 'connected',
				action: 'set-event-source',
			};
		case 'set-ws-state':
			if (action.wsState === undefined) {
				return prev;
			}
			return { ...prev, wsState: action.wsState, action: 'set-ws-state' };
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
			console.log('set response', prev);
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
		case 'fallback': // used if 'fallbackOnWebSocketError' is true and we got an error in web socket
			console.log('fallback', prev);
			return {
				...prev,
				lastRequest: null,
				request: prev.request,
				useWebSocket: false,
				shouldConnect: false,
				wsFailed: true,
				thinking: false,
				ws: null,
				wsState: 'failed',
				action: 'fallback',
			};

		case 'sse-connected':
			if (action.state?.connectionId === undefined) {
				return prev;
			}
			return {
				...prev,
				connectionId: action.state.connectionId,
				wsState: 'connected',
				action: 'sse-connected',
			};

		// simply close the the connection
		case 'close':
			console.log('closing', prev);
			return {
				...prev,
				request: null,
				useWebSocket: false,
				shouldConnect: false,
				thinking: false,
				ws: null,
				wsState: 'closed',
				action: 'close',
				eventSource: null,
				connectionId: undefined,
			};

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
				useWebSocket: true,
				shouldConnect: true,
				request: null,
				wsState: 'request-connection',
				action: 'request-connection',
			};
		// requests websocket disconnection
		case 'request-disconnection':
			return {
				...prev,
				useWebSocket: false,
				shouldConnect: false,
				request: null,
				wsState: 'request-disconnection',
				action: 'request-disconnection',
			};
		default:
			break;
	}
	return prev;
}

export function useAnalysis(
	options: AnalysisOptions | undefined = undefined,
): Analysis {
	const [state, dispatch] = useReducer(
		analysisReducer,
		options,
		getInitialAnalysisState,
	);

	// Close on unmount
	useEffect(() => {
		return () => {
			dispatch({ type: 'close' });
		};
	}, [state.ws]);

	useEffect(() => {
		// If we aren't analyzing the position AND there is an request
		if (!state.thinking && state.request !== null) {
			console.log('request', state.request);
			// Using web socket for real-time analysis
			if (
				state.useWebSocket &&
				!state.wsFailed &&
				state.connectionId !== undefined
			) {
				console.log('sse analysis');
				dispatch({ type: 'start-thinking' });
				EngineAPI.analyzeSSE({
					...state.request,
					connId: state.connectionId || '',
				}).catch((error) => {
					console.error(error);
				});
			}

			// Just a one-time request
			else if (!state.useWebSocket || state.wsFailed) {
				console.log('http request analysis');
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
		}
	}, [
		state.useWebSocket,
		state.ws,
		state.thinking,
		state.request,
		state.wsFailed,
		state.connectionId,
	]);

	// Requests for connection/disconnection
	useEffect(() => {
		if (!state.useWebSocket || state.wsState === 'null') {
			return;
		}

		if (
			state.shouldConnect &&
			!state.connectionId &&
			!state.eventSource &&
			state.wsState === 'request-connection'
		) {
			try {
				// Open the event source connection
				const eventSource = EngineAPI.createEventSource();

				// Set connection id on connection event
				eventSource.addEventListener('connected', (event) => {
					if (typeof event.data !== 'string') {
						console.error(
							'Invalid connection event data:',
							event.data,
						);
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
					console.log('analysis', event);
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

				eventSource.addEventListener('ping', (event) => {
					console.log('ping', event);
				});

				eventSource.onopen = (event) => {
					console.log('Connected to event source', event);
					dispatch({ type: 'set-ws-state', wsState: 'connected' });
				};

				eventSource.onerror = (error) => {
					eventSource.close();
					console.error('EventSource error:', error);
					dispatch({ type: 'close' });
				};

				dispatch({
					type: 'set-event-source',
					eventSource,
					wsState: 'connecting',
				});
			} catch (error) {
				console.error('Failed to create EventSource:', error);
			}
			dispatch({ type: 'set-ws-state', wsState: 'connecting' });
		} else if (!state.shouldConnect && state.ws) {
			state.ws.close();
			dispatch({ type: 'set-ws', ws: null });
		}
	}, [state]);

	return [state, dispatch];
}
