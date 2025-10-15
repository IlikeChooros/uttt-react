import {
	toNotation,
	Move,
	BoardSettings,
	GameState,
	indexMapper,
} from '@/board';

type BuildType = 'development' | 'production' | 'test';

export const BUILD: BuildType = process.env.NODE_ENV as BuildType;

// Public override (available in client bundle)
const PUBLIC_HOST = process.env.NEXT_PUBLIC_PROD_HOST || '';

// Dev-only host (only available server-side since no NEXT_PUBLIC_ prefix).
// Will be undefined in the client bundle if this file ever gets client-side imported.
const DEV_HOST = process.env.NEXT_PUBLIC_DEV_HOST || 'localhost:8000';

// Choose base host:
// 1. If a public override provided, use it.
// 2. Else if dev mode and DEV_HOST defined, use that.
// 3. Else same-origin (empty string so we build relative URLs).
const baseHost =
	PUBLIC_HOST !== '' ? PUBLIC_HOST : BUILD === 'development' ? DEV_HOST : '';

// Backend server URLs
export const SERVER_URL_HTTP = baseHost !== '' ? `http://${baseHost}` : '';

export const ENGINE_API_ANALYSIS = `${SERVER_URL_HTTP}/api/analysis`;
export const ENGINE_API_LIMITS = `${SERVER_URL_HTTP}/api/limits`;
// Real-time (single session) analysis over Server-Sent Events (SSE) via POST
// NOTE: kept the existing constant name so callers don't need to change imports.
export const ENGINE_API_RT_ANALYSIS = `${SERVER_URL_HTTP}/api/rt-analysis`;
export const ENGINE_API_SUBMIT_RT_ANALYSIS = `${SERVER_URL_HTTP}/api/submit-rt-analysis`;

export interface AnalysisEngineLine {
	eval: string;
	abseval: string;
	pv: string[];
}

export interface AnalysisResponse {
	depth: number;
	lines: AnalysisEngineLine[];
	cps: number;
	final: boolean;
	error?: string;
}

export interface AnalysisRequest {
	position: string;
	movetime?: number;
	depth?: number;
	threads?: number;
	sizemb?: number;
	multipv?: number;
}

export interface AnalysisRequestWithId extends AnalysisRequest {
	connId: string;
}

export function toAnalysisRequest(
	settings: BoardSettings,
	gameState: GameState,
): AnalysisRequest {
	return {
		position: toNotation(gameState),
		depth: settings.engineDepth,
		threads: settings.nThreads,
		sizemb: settings.memorySizeMb,
		multipv: settings.multiPv,
	};
}

export interface AnalysisOptions {
	fallbackToHttp?: boolean; // Fallback on failed websocket connection to http requests
	useRtAnalysis?: boolean; // Whether to use real-time analysis over websockets
	slowDownMs?: number; // Minimum time (ms) to show "thinking" state
}

export type AnalysisActionType =
	// public
	| 'request-connection'
	| 'request-disconnection'
	| 'analyze'
	| 'force-analyze'
	| 're-analyze'
	| 'fallback'
	| 'close'
	| 'set-options'
	// private
	| 'remove-error'
	| 'append-error'
	| 'cleanup'
	| 'sse-connected'
	| 'set-event-source'
	| 'start-thinking'
	| 'stop-thinking'
	| 'set-response'
	| 'set-rt-state';

export type AnaysisRtState =
	| 'null'
	| 'request-connection'
	| 'connecting'
	| 'connected'
	| 'failed'
	| 'request-disconnection'
	| 'disconnecting'
	| 'disconnected'
	| 'closed';

export type AnalysisErrorType =
	| 'rt-analysis-submit'
	| 'analysis-submit'
	| 'rt-analysis-connect'
	| 'rt-analysis-lost-connection';

export interface AnalysisError {
	msg: string;
	brief: string;
	type: AnalysisErrorType;
}

export interface AnalysisState {
	action: AnalysisActionType | null;
	currentEvaluation: string;
	absEvaluation: string;
	bestMove: EngineMove | null;
	topMoves: EngineMove[];
	thinking: boolean;
	request: AnalysisRequest | null;
	lastRequest: AnalysisRequest | null;
	rtFailed: boolean;
	rtState: AnaysisRtState;
	eventSource?: EventSource | null;
	connectionId?: string; // for SSE connections
	errorStack: Array<AnalysisError>;
	serverBusy: boolean;
	requestCount: number; // number of requests made to the engine
	freshAnalysis: boolean; // whether the current analysis is fresh (not stale)
}

export function getInitialAnalysisState(): AnalysisState {
	return {
		action: null,
		currentEvaluation: '',
		absEvaluation: '',
		bestMove: null,
		topMoves: [],
		thinking: false,
		request: null,
		lastRequest: null,
		rtFailed: false,
		rtState: 'null',
		errorStack: [],
		serverBusy: false,
		requestCount: 0,
		freshAnalysis: false,
	};
}

export interface EngineMove extends Move {
	abseval: string;
	evaluation: string;
	depth: number;
	principalVariation: string[];
}

export interface EngineLimits {
	depth: number;
	mbsize: number;
	threads: number;
	multipv: number;
	max_movetime: number;
}

export function getInitialEngineLimits(): EngineLimits {
	return {
		depth: 16,
		mbsize: 16,
		threads: 4,
		multipv: 3,
		max_movetime: 1000,
	};
}

// Check if given object is instance of a given type, with prodvided 'requiredKeys'
// and 'keys'
function IsInstance<T>(obj: object, requiredKeys: (keyof T)[]): boolean {
	if (typeof obj != 'object' || obj == null) {
		return false;
	}

	return requiredKeys.every((key) => key in obj);
}

export function analysisToQuery(request: AnalysisRequest): URLSearchParams {
	const params = new URLSearchParams();
	// Only include defined values and skip 'position'
	for (const [key, value] of Object.entries(request)) {
		if (value !== undefined && key !== 'position') {
			params.append(key, value.toString());
		}
	}
	params.append(
		'position',
		request.position.replaceAll('/', 'n').replaceAll(' ', '_'),
	);

	return params;
}

// Fetch engine limits at /api/limits, returns the response
export async function getEngineLimits(): Promise<EngineLimits> {
	try {
		const resp = await fetch(ENGINE_API_LIMITS, {
			method: 'GET',
		});
		const json = await resp.json();
		if (
			!IsInstance<EngineLimits>(json, [
				'depth',
				'mbsize',
				'threads',
				'multipv',
				'max_movetime',
			])
		) {
			throw new Error('Limits: invalid json structure');
		}
		return json as EngineLimits;
	} catch (e) {
		// Surface error upward so UI can handle (retry / message)
		throw e;
	}
}

export class EngineAPI {
	static isAnalysisResponse(json: object): json is AnalysisResponse {
		return IsInstance<AnalysisResponse>(json, [
			'lines',
			'cps',
			'depth',
			'final',
		]);
	}

	static parseAnalysisResponse(json: object): EngineMove[] {
		if (!EngineAPI.isAnalysisResponse(json)) {
			throw new Error('Invalid json structure, got:' + json.toString());
		}

		let boardIndex: number | undefined = 0,
			cellIndex: number | undefined = 0;
		const moves = new Array<EngineMove>(json.lines.length);

		// Convert all moves to engine moves
		for (let i = 0; i < json.lines.length; i++) {
			const line = json.lines[i];
			if (line.pv.length != 0) {
				// Convert all moves
				boardIndex = indexMapper.get(
					line.pv[0].substring(0, 2).toLowerCase(),
				);
				if (boardIndex == undefined) {
					boardIndex = 0;
				}

				cellIndex = indexMapper.get(line.pv[0].substring(2, 4));
				if (cellIndex == undefined) {
					cellIndex = 0;
				}

				moves[i] = {
					depth: json.depth,
					cellIndex,
					boardIndex,
					principalVariation: line.pv,
					evaluation: line.eval,
					abseval: line.abseval,
				};
			}
		}

		return moves;
	}

	// Make an analysis request, after ~1 second, returns the results
	// although it depends on the engine settings
	static async analyze(
		request: AnalysisRequest = { position: '' },
	): Promise<AnalysisResponse> {
		try {
			const response = await fetch(ENGINE_API_ANALYSIS, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(request),
			});

			if (!response.ok) {
				const text = await response.text();
				throw new Error(text);
			}

			return response.json().then((json) => {
				return json;
			});
		} catch (error) {
			throw error;
		}
	}

	static createEventSource(): EventSource {
		// Make sure we're using the correct protocol (http:// for http, https:// for https)
		const eventSource = new EventSource(ENGINE_API_RT_ANALYSIS, {
			withCredentials: true,
		});
		return eventSource;
	}

	// Make a POST request for SSE analysis
	static async analyzeSSE(request: AnalysisRequestWithId): Promise<Response> {
		// This is either a 204 or an error

		const resp = await fetch(ENGINE_API_SUBMIT_RT_ANALYSIS, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify(request),
		});

		if (!resp.ok) {
			const text = await resp.text();
			throw new Error(text);
		}

		return resp;
	}
}
