'use client';

import { ToNotation, Move, BoardSettings, GameState } from '@/board';

const ENGINE_API_ANALYSIS = '/api/analysis';
const ENGINE_API_LIMITS = '/api/limits';
// const ENGINE_API_WS_ANALYSIS = "/api/rt-analysis"

export interface AnalysisEngineLine {
	eval: string;
	pv: string[];
}

export interface AnalysisResponse {
	depth: number;
	lines: AnalysisEngineLine[];
	nps: number;
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
	fallbackOnWebSocketError?: AnalysisState['fallbackOnWebSocketError']; // Fallback on failed websocket connection to http requests
}

export function getInitialAnalysisState(
	options: AnalysisOptions | undefined = undefined,
): AnalysisState {
	return {
		currentEvaluation: '',
		bestMove: null,
		topMoves: [],
		thinking: false,
		request: null,
		lastRequest: null,
		shouldConnect: false,
		useWebSocket: false,
		fallbackOnWebSocketError: false,
		wsFailed: false,
		ws: null,
		wsState: 'null',
		...options,
	};
}

export type AnaysisWsState =
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
	currentEvaluation: string;
	bestMove: EngineMove | null;
	topMoves: EngineMove[];
	thinking: boolean;
	shouldConnect: boolean;
	request: AnalysisRequest | null;
	lastRequest: AnalysisRequest | null;
	useWebSocket: boolean;
	fallbackOnWebSocketError: boolean;
	wsFailed: boolean;
	ws: WebSocket | null;
	wsState: AnaysisWsState;
}

export interface EngineMove extends Move {
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

// Fetch engine limits at /api/limits, returns the response
export async function getEngineLimits(): Promise<EngineLimits> {
	const response = fetch(ENGINE_API_LIMITS, { method: 'GET' });

	return response
		.then((resp) => {
			return resp.json();
		})
		.then((json) => {
			if (
				!IsInstance<EngineLimits>(
					json,
					['depth', 'mbsize', 'threads', 'multipv'],
					['depth', 'mbsize', 'threads', 'multipv'],
				)
			) {
				throw new Error(
					'Limits: invalid json structure, got:' + json.toString(),
				);
			}

			return json;
		})
		.catch((error) => {
			console.log(error);
		});
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

	static parseAnalysisResponse(json: AnalysisResponse): EngineMove[] {
		if (
			!IsInstance<AnalysisResponse>(
				json,
				['lines', 'nps', 'depth', 'final'],
				['error', 'nps', 'lines', 'depth', 'final'],
			)
		) {
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
			})
			.catch((err) => {
				console.log(err);
				return new Array<EngineMove>(0);
			});
	}
}
