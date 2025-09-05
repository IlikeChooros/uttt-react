'use client';

// react stuff
import { ActionDispatch, useEffect, useReducer } from 'react';

// mine components
import {
	AnalysisActionType,
	AnalysisOptions,
	AnalysisResponse,
	AnalysisState,
	analysisToQuery,
	ENGINE_API_RT_ANALYSIS,
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
				wsState: action.eventSource ? 'connected' : 'disconnected',
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
			if (state.ws && state.ws.readyState !== WebSocket.CLOSED) {
				dispatch({ type: 'close' });
			}
		};
	}, [state.ws]);

	const rtAnalysis = () => {
		if (
			state.eventSource &&
			state.eventSource.readyState !== EventSource.CLOSED
		) {
			state.eventSource.close();
		}

		// Open SSE connection with analysis params
		const params = analysisToQuery(state.request!);
		const url = `${ENGINE_API_RT_ANALYSIS}?${params}`;
		console.log('Opening EventSource connection to ', url);
		state.eventSource = new EventSource(url);
		state.eventSource.onmessage = (event) => {
			const data = JSON.parse(event.data);
			const valid = EngineAPI.isAnalysisResponse(data);
			if (!valid) {
				console.error('Invalid analysis response', data);
				return;
			}

			const bestMoves = EngineAPI.parseAnalysisResponse(data);
			dispatch({
				type: 'set-response',
				state: {
					currentEvaluation: bestMoves[0].evaluation,
					absEvaluation: bestMoves[0].abseval,
					thinking: !data.final,
					bestMove: bestMoves[0],
					topMoves: bestMoves,
				},
			});
		};
		state.eventSource.onerror = (error) => {
			console.error('EventSource failed:', error);
			dispatch({ type: 'close' });
		};
		dispatch({ type: 'set-event-source', eventSource: state.eventSource });
	};

	useEffect(() => {
		// If we aren't analyzing the position AND there is an request
		if (!state.thinking && state.request !== null) {
			console.log('request', state.request);
			// Using web socket for real-time analysis
			if (state.useWebSocket && !state.wsFailed) {
				console.log('sse analysis');
				dispatch({ type: 'start-thinking' });
				rtAnalysis();
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
	]);

	useEffect(() => {}, [
		state.ws,
		state.wsFailed,
		state.wsState,
		state.shouldConnect,
		state.useWebSocket,
		state.fallbackOnWebSocketError,
		state.lastRequest,
		state.request,
	]);

	return [state, dispatch];
}
