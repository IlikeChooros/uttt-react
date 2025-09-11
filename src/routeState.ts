// Client-side route state transfer with sessionStorage + in-memory cache
// Use to pass rich data between routes without bloating URLs.

export type RouteState<T> = {
	data: T;
	expiresAt?: number; // epoch ms
};

const memoryStore = new Map<string, RouteState<unknown>>();

function now() {
	return Date.now();
}

function safeSession(): Storage | null {
	if (typeof window === 'undefined') return null;
	try {
		return window.sessionStorage;
	} catch {
		return null;
	}
}

export function saveRouteState<T>(
	key: string,
	data: T,
	ttlMs = 15 * 60 * 1000,
): string {
	const payload: RouteState<T> = {
		data,
		expiresAt: ttlMs > 0 ? now() + ttlMs : undefined,
	};
	memoryStore.set(key, payload as RouteState<unknown>);
	const ss = safeSession();
	console.log('Saving route state', key, payload, 'to sessionStorage?', !!ss);
	if (ss) {
		try {
			ss.setItem(key, JSON.stringify(payload));
			console.log(
				'Saved route state to sessionStorage',
				key,
				JSON.stringify(payload),
			);
		} catch {}
	}
	return key;
}

export function readRouteState<T>(
	key: string,
	{ consume = true } = {},
): T | undefined {
	console.log('Reading route state', key);
	const ss = safeSession();
	let payload = memoryStore.get(key) as RouteState<T> | undefined;
	if (!payload && ss) {
		console.log('No in-memory route state, checking sessionStorage');
		try {
			const raw = ss.getItem(key);
			console.log('Got raw route state from sessionStorage', key, raw);
			if (raw) payload = JSON.parse(raw) as RouteState<T>;
		} catch {}
	}
	if (!payload) return undefined;

	console.log('Found route state payload', payload);
	if (payload.expiresAt && payload.expiresAt < now()) {
		// expired
		console.log('Route state expired', key);
		memoryStore.delete(key);
		ss?.removeItem(key);
		return undefined;
	}
	if (consume) {
		console.log('Consuming route state', key);
		memoryStore.delete(key);
		ss?.removeItem(key);
	}
	return payload.data;
}

export function makeRouteKey(namespace: string, id: string) {
	return `${namespace}:${id}`;
}
