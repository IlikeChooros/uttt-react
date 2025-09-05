'use client';

// react stuff
import { ActionDispatch, useEffect, useReducer } from 'react';

// mine components
import {
	AnalysisActionType,
	AnalysisOptions,
	AnalysisState,
	ENGINE_API_WS_ANALYSIS,
	EngineAPI,
	getInitialAnalysisState,
} from '@/api';

// return value of useAnalysis, state and dispatch
export type Analysis = [AnalysisState, ActionDispatch<[AnalysisAction]>];

export interface AnalysisAction {
	type: AnalysisActionType;
	ws?: WebSocket | null;
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

	// Analyze position
	useEffect(() => {
		// If we aren't analyzing the position AND there is an request
		if (!state.thinking && state.request !== null) {
			console.log('request', state.request);
			// Using web socket for real-time analysis
			if (
				state.useWebSocket &&
				state.ws !== null &&
				state.ws.readyState === WebSocket.OPEN
			) {
				console.log('ws analysis');
				dispatch({ type: 'start-thinking' });
				state.ws.send(JSON.stringify(state.request));
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

	// Requests for connection/disconnection
	useEffect(() => {
		if (!state.useWebSocket || state.wsState === 'null' || state.wsFailed) {
			return;
		}

		if (
			state.shouldConnect &&
			!state.ws &&
			state.wsState === 'request-connection'
		) {
			try {
				// Make sure we're using the correct protocol (ws:// for http, wss:// for https)
				// const protocol =
				// 	window.location.protocol === 'https:' ? 'wss:' : 'ws:';
				const wsUrl = `${ENGINE_API_WS_ANALYSIS}`;
				// const wsUrl = 'ws://127.0.0.1:8080/rt-analysis2';
				console.log(`Connecting to WebSocket at ${wsUrl}`);

				const ws = new WebSocket(wsUrl);

				ws.onopen = (event) => {
					console.log('Connected to websocket', event);
					dispatch({ type: 'set-ws', ws });
				};

				ws.onmessage = (event) => {
					try {
						const response = JSON.parse(event.data);
						console.log('Analysis response:', response);

						if (response.error) {
							console.error('Analysis error:', response.error);
							dispatch({ type: 'stop-thinking' });
							return;
						}

						const bestMoves =
							EngineAPI.parseAnalysisResponse(response);
						dispatch({
							type: 'set-response',
							state: {
								currentEvaluation: bestMoves[0].evaluation,
								absEvaluation: bestMoves[0].abseval,
								thinking: !response.final,
								bestMove: bestMoves[0],
								topMoves: bestMoves,
							},
						});
					} catch (error) {
						console.error(
							'Failed to parse WebSocket message:',
							error,
						);
					}
				};

				ws.onclose = (ev) => {
					console.log('WebSocket closed:', ev);
					if (!state.wsFailed && state.fallbackOnWebSocketError) {
						dispatch({ type: 'fallback' });
					}
				};

				ws.onerror = (error) => {
					console.info('WebSocket error:', error);
				};
			} catch (error) {
				console.error('Failed to create WebSocket:', error);
			}
			dispatch({ type: 'set-ws-state', wsState: 'connecting' });
		} else if (!state.shouldConnect && state.ws) {
			state.ws.close();
			dispatch({ type: 'set-ws', ws: null });
		}
	}, [
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
