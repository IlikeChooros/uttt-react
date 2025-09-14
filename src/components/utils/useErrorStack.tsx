'use client';

import React from 'react';

interface ErrorType {
	msg: string;
	type?: string;
}

interface ErrorStackAction<T, E> {
	type: 'push' | 'pop' | 'clear' | 'set' | 'set-payload';
	error?: ErrorType & E;
	errors?: (ErrorType & E)[];
	payload?: T;
}

interface ErrorStackState<E> {
	errors: (ErrorType & E)[];
}

function reducer<T, E = ErrorType>(
	state: T & ErrorStackState<E>,
	action: ErrorStackAction<T, E>,
): T & ErrorStackState<E> {
	switch (action.type) {
		case 'push':
			if (!action.error) return state;
			return {
				...state,
				errors: [...state.errors, action.error],
			};
		case 'pop':
			return { ...state, errors: state.errors.slice(0, -1) };
		case 'clear':
			return { ...state, errors: [] };
		case 'set':
			return { ...state, errors: action.errors || [], ...action.payload };
		case 'set-payload':
			return { ...state, ...action.payload };
		default:
			return state;
	}
}

export default function useErrorStack<T, E = ErrorType>({
	initialState,
}: { initialState?: T } = {}) {
	const [errorStack, dispatch] = React.useReducer<
		T & ErrorStackState<E>,
		[ErrorStackAction<T, E>]
	>(reducer, { ...initialState, errors: [] } as T & ErrorStackState<E>);

	const pushError = (error: ErrorType & E) => {
		dispatch({ type: 'push', error });
	};

	const popError = () => {
		dispatch({ type: 'pop' });
	};

	const clearErrors = () => {
		dispatch({ type: 'clear' });
	};

	const setErrors = (errors: (ErrorType & E)[], data?: T) => {
		dispatch({ type: 'set', errors, payload: data });
	};

	const setPayload = (payload: T) => {
		dispatch({ type: 'set', errors: [], payload });
	};

	return {
		errorStack,
		pushError,
		popError,
		clearErrors,
		setErrors,
		setPayload,
	};
}
