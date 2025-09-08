import { ToNotation, Move, BoardSettings, GameState } from '@/board';

type BuildType = 'development' | 'production' | 'test';

export const BUILD: BuildType = process.env.NODE_ENV as BuildType;

// Public override (available in client bundle)
const PUBLIC_HOST = process.env.NEXT_PUBLIC_PROD_HOST || '';

// Dev-only host (only available server-side since no NEXT_PUBLIC_ prefix).
// Will be undefined in the client bundle if this file ever gets client-side imported.
const DEV_HOST = process.env.NEXT_PUBLIC_DEV_HOST || 'localhost:8080';

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
		position: ToNotation(gameState),
		depth: settings.engineDepth,
		threads: settings.nThreads,
		sizemb: settings.memorySizeMb,
		multipv: settings.multiPv,
	};
}

export interface AnalysisOptions {
	fallbackToHttp?: boolean; // Fallback on failed websocket connection to http requests
	useRtAnalysis?: boolean; // Whether to use real-time analysis over websockets
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
	};
}

export type AnalysisActionType =
	// public
	| 'request-connection'
	| 'request-disconnection'
	| 'analyze'
	| 'fallback'
	| 'close'
	| 'set-options'
	// private
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
}

export function getInitialEngineLimits(): EngineLimits {
	return {
		depth: 14,
		mbsize: 16,
		threads: 4,
		multipv: 3,
	};
}

// Check if given object is instance of a given type, with prodvided 'requiredKeys'
// and 'keys'
function IsInstance<T>(
	obj: object,
	requiredKeys: (keyof T)[],
	keys: (keyof T)[],
): boolean {
	if (typeof obj != 'object' || obj == null) {
		return false;
	}

	return (
		requiredKeys.every((key) => key in obj) &&
		(Object.keys(obj) as (keyof T)[]).every((key) => keys.includes(key))
	);
}

export function analysisToQuery(request: AnalysisRequest): string {
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

	return params.toString();
}

// Fetch engine limits at /api/limits, returns the response
export async function getEngineLimits(): Promise<EngineLimits> {
	console.log(process.env.DEV_HOST, process.env.NEXT_PUBLIC_ENGINE_HOST);

	try {
		const resp = await fetch(ENGINE_API_LIMITS, {
			method: 'GET',
		});
		const json = await resp.json();
		const valid = IsInstance<EngineLimits>(
			json,
			['depth', 'mbsize', 'threads', 'multipv'],
			['depth', 'mbsize', 'threads', 'multipv'],
		);
		if (!valid) {
			throw new Error('Limits: invalid json structure');
		}
		return json;
	} catch (e) {
		// Surface error upward so UI can handle (retry / message)
		throw e;
	}
}

export class EngineAPI {
	static IndexMapper: Map<string, number> = new Map([
		['a3', 0],
		['b3', 1],
		['c3', 2],
		['a2', 3],
		['b2', 4],
		['c2', 5],
		['a1', 6],
		['b1', 7],
		['c1', 8],
	]);

	static isAnalysisResponse(json: object): json is AnalysisResponse {
		return IsInstance<AnalysisResponse>(
			json,
			['lines', 'cps', 'depth', 'final'],
			['error', 'cps', 'lines', 'depth', 'final'],
		);
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
				boardIndex = this.IndexMapper.get(
					line.pv[0].substring(0, 2).toLowerCase(),
				);
				if (boardIndex == undefined) {
					boardIndex = 0;
				}

				cellIndex = this.IndexMapper.get(line.pv[0].substring(2, 4));
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
	): Promise<EngineMove[]> {
		const response = fetch(ENGINE_API_ANALYSIS, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(request),
		});

		return response
			.then((resp) => {
				return resp.json();
			})
			.then((json) => {
				return this.parseAnalysisResponse(json);
			});
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
		const response = await fetch(ENGINE_API_SUBMIT_RT_ANALYSIS, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify(request),
		});

		// This is either a 204 or an error
		return response;
	}
}
