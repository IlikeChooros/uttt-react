'use client';

import React from 'react';

interface ErrorType {
	msg: string;
	type?: string;
}

interface ErrorStackAction<T> {
	type: 'push' | 'pop' | 'clear' | 'set' | 'set-payload';
	error?: ErrorType;
	errors?: ErrorType[];
	payload?: T;
}

interface ErrorStackState {
	errors: ErrorType[];
}

function reducer<T>(
	state: T & ErrorStackState,
	action: ErrorStackAction<T>,
): T & ErrorStackState {
	switch (action.type) {
		case 'push':
			return {
				...state,
				errors: [...state.errors, action.error || { msg: '' }],
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

export default function useErrorStack<T>({
	initialState,
}: { initialState?: T } = {}) {
	const [errorStack, dispatch] = React.useReducer<
		T & ErrorStackState,
		[ErrorStackAction<T>]
	>(reducer, { ...initialState, errors: [] } as T & ErrorStackState);

	const pushError = (error: ErrorType) => {
		dispatch({ type: 'push', error });
	};

	const popError = () => {
		dispatch({ type: 'pop' });
	};

	const clearErrors = () => {
		dispatch({ type: 'clear' });
	};

	const setErrors = (errors: ErrorType[], data?: T) => {
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
