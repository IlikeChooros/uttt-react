import { makeRouteKey, saveRouteState } from '@/routeState';
import { GameState } from './board';

export function analysisRoute(gameState: GameState): string {
	return getRoutePath('/analysis', { gameState });
}

// Create a url to a given path, saving the data in route state, and appending the sid query param.
// The data can be read on the destination page using readRouteState with the same key.
// The key is generated as "prefix-sid", where prefix is provided, and sid is a random string.
// The data expires after ttlMs (default 5 minutes).
// If run on the server (no window), returns an empty string.
export function getRoutePath(path: string, data?: unknown): string {
	if (typeof window === 'undefined') return '';
	const sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
	const key = makeRouteKey('analysis', sid);
	saveRouteState(key, data, 5 * 60 * 1000);
	return `${path}?sid=${sid}`;
}
