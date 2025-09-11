'use client';

import React, { use } from 'react';

// mine components
import {
	AnalysisActionType,
	AnalysisError,
	AnalysisOptions,
	AnalysisResponse,
	AnalysisState,
	EngineAPI,
	getInitialAnalysisState,
} from '@/api';

// return value of useAnalysis, state and dispatch
export type Analysis = [AnalysisState, React.ActionDispatch<[AnalysisAction]>];

interface ActionState {
	thinking?: AnalysisState['thinking'];
	currentEvaluation?: AnalysisState['currentEvaluation'];
	bestMove?: AnalysisState['bestMove'];
	topMoves?: AnalysisState['topMoves'];
	request?: AnalysisState['request'];
	absEvaluation?: AnalysisState['absEvaluation'];
	connectionId?: AnalysisState['connectionId'];
	serverBusy?: AnalysisState['serverBusy'];
	freshAnalysis?: AnalysisState['freshAnalysis'];
	rtState?: AnalysisState['rtState'];
	rtFailed?: AnalysisState['rtFailed'];
}

export interface AnalysisAction {
	type: AnalysisActionType;
	ws?: WebSocket | null;
	eventSource?: EventSource | null;
	state?: ActionState;

	error?: AnalysisError;
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
				freshAnalysis: false,
				lastRequest: prev.request,
				request: null,
				action: 'start-thinking',
			};
		case 'stop-thinking':
			return {
				...prev,
				thinking: false,
			};
		case 'set-response':
			// expects: 'bestMove', 'topMoves', 'currentEvaluation'
			return {
				...prev,
				lastRequest: null,
				freshAnalysis: true,
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

		case 'remove-error':
			if (prev.errorStack.length == 0) {
				return prev;
			}

			return {
				...prev,
				errorStack: prev.errorStack.slice(0, -1),
			};

		case 'append-error':
			// append error
			if (action.error === undefined) {
				return prev;
			}

			return {
				...prev,
				thinking: false,
				requestCount: 0,
				errorStack: prev.errorStack.concat(action.error),
				...action.state,
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
			return action.default;

		case 're-analyze':
			if (!prev.request && !prev.lastRequest) {
				return prev;
			}

			return {
				...prev,
				thinking: false,
				request: prev.request ? prev.request : prev.lastRequest,
			};

		case 'force-analyze':
			if (action.state?.request === undefined) {
				return prev;
			}
			return {
				...prev,
				request: action.state.request,
				action: 'force-analyze',
			};

		// make a new request to analyze the position
		case 'analyze':
			if (!action.state?.request || prev.thinking) {
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

export function useAnalysis({
	useRtAnalysis = false,
	fallbackToHttp = true,
	slowDownMs = 700,
}: AnalysisOptions): Analysis {
	const [connectToSse, setConnectToSse] = React.useState<boolean | undefined>(
		useRtAnalysis,
	);
	const [state, dispatch] = React.useReducer(
		analysisReducer,
		undefined,
		getInitialAnalysisState,
	);
	const analysisSlowdown = React.useRef({
		waitTime: slowDownMs,
		startTime: 0,
	});
	const eventSourceRef = React.useRef<EventSource | null>(null);

	React.useEffect(() => {
		// If we aren't analyzing the position AND there is an request
		if (
			state.request &&
			useRtAnalysis &&
			state.rtState === 'connected' &&
			state.connectionId
		) {
			dispatch({ type: 'start-thinking' });
			EngineAPI.analyzeSSE({
				...state.request,
				connId: state.connectionId,
			}).catch((error) => {
				Object.keys(error).forEach((key) => {
					console.error(`Error detail: ${key}: ${error[key]}`);
				});

				// Server is too busy
				if (error.message.includes('NetworkError')) {
					return; // don't show error if network error, could be offline
				}
				console.error('server too busy', error);
				dispatch({
					type: 'append-error',
					error: {
						msg: error.message,
						type: 'rt-analysis-submit',
					},
					state: {
						serverBusy: true,
					},
				});
			});
		}

		// If we aren't analyzing the position AND there is an request
		if (
			state.request &&
			(!useRtAnalysis || (state.rtFailed && fallbackToHttp))
		) {
			analysisSlowdown.current.startTime = Date.now();
			const req = state.request;
			dispatch({ type: 'start-thinking' });
			EngineAPI.analyze(req)
				.then((resp) => {
					const bestMoves = EngineAPI.parseAnalysisResponse(resp);
					const disp = () => {
						dispatch({
							type: 'set-response',
							state: {
								currentEvaluation: bestMoves[0].evaluation,
								absEvaluation: bestMoves[0].abseval,
								bestMove: bestMoves[0],
								topMoves: bestMoves,
								request: null, // infinite analysis
								serverBusy: false,
								thinking: !resp.final,
							},
						});
					};

					// Apply 'slow down' if needed
					const elapsed =
						Date.now() - analysisSlowdown.current.startTime;
					const waitTime = analysisSlowdown.current.waitTime;
					analysisSlowdown.current.startTime = 0;
					if (elapsed < waitTime) {
						setTimeout(() => disp(), waitTime - elapsed);
					} else {
						disp();
					}
				})
				.catch((error: Error) => {
					console.error('analysis error', error);
					if (error.message.includes('NetworkError')) {
						return; // don't show error if network error, could be offline
					}
					dispatch({
						type: 'append-error',
						error: {
							msg: error.message,
							type: 'analysis-submit',
						},
						state: {
							serverBusy: true,
						},
					});
				});
		}
	}, [
		useRtAnalysis,
		fallbackToHttp,
		state.thinking,
		state.request,
		state.rtState,
		state.rtFailed,
		state.connectionId,
	]);

	// Reconnect function to be used externally
	React.useEffect(() => {
		if (state.action === 'request-connection') {
			console.log('Requesting SSE connection');
			// switch between undefined and true to trigger useEffect
			setConnectToSse((prev) => (prev === undefined ? true : undefined));
		}
	}, [useRtAnalysis, state.action, connectToSse]);

	// Setup/teardown of event source connection
	React.useEffect(() => {
		if (connectToSse === false) {
			return;
		}

		console.log('Connecting to SSE for analysis');
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
			});

			eventSource.addEventListener('analysis', (event) => {
				const analysis: AnalysisResponse = JSON.parse(event.data);
				const lines = EngineAPI.parseAnalysisResponse(analysis);

				const disp = () =>
					dispatch({
						type: 'set-response',
						state: {
							currentEvaluation:
								lines.length > 0 ? lines[0].evaluation : '',
							absEvaluation:
								lines.length > 0 ? lines[0].abseval : '',
							bestMove: lines.length > 0 ? lines[0] : null,
							topMoves: lines.length > 0 ? lines : [],
							request: null,
							serverBusy: false,
							thinking: !analysis.final,
						},
					});

				if (analysisSlowdown.current.startTime === 0) {
					analysisSlowdown.current.startTime = Date.now();
				}

				if (!analysis.final) {
					disp();
					return;
				}

				// wait a bit before allowing new analysis
				const now = Date.now();
				const elapsed = now - analysisSlowdown.current.startTime;
				const waitTime = analysisSlowdown.current.waitTime;
				analysisSlowdown.current.startTime = 0;
				if (elapsed < waitTime) {
					setTimeout(() => {
						if (analysisSlowdown.current.startTime === 0) {
							disp();
						}
					}, waitTime - elapsed);
				} else {
					disp();
				}
			});

			eventSource.onopen = () => {
				dispatch({ type: 'set-rt-state', rtState: 'connected' });
			};

			eventSource.onerror = () => {
				eventSource?.close();
				dispatch({ type: 'close' });
				dispatch({
					type: 'append-error',
					error: {
						msg: 'Lost connection to analysis engine',
						type: 'rt-analysis-lost-connection',
					},
				});
			};

			dispatch({
				type: 'set-event-source',
				eventSource,
				rtState: 'connecting',
			});
		} catch (error) {
			console.error('Failed to create EventSource:', error);
			dispatch({
				type: 'append-error',
				error: {
					msg: (error as Error).message,
					type: 'rt-analysis-connect',
				},
				state: { rtFailed: true, rtState: 'failed' },
			});
		}
		eventSourceRef.current = eventSource;

		return () => {
			console.log('Closing SSE connection for analysis');
			if (eventSource && eventSource.readyState !== EventSource.CLOSED) {
				eventSource.close();
			}
			eventSourceRef.current = null;
			dispatch({ type: 'set-rt-state', rtState: 'closed' });
		};
	}, [connectToSse]);

	return [state, dispatch];
}
