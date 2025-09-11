'use client';

import React from 'react';

interface ErrorType {
	msg: string;
	type?: string;
}

interface ErrorStackAction {
	type: 'push' | 'pop' | 'clear' | 'set';
	error?: ErrorType;
	errors?: ErrorType[];
}

interface ErrorStackState {
	errors: ErrorType[];
}

function reducer(
	state: ErrorStackState,
	action: ErrorStackAction,
): ErrorStackState {
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
			return { ...state, errors: action.errors ? action.errors : [] };
		default:
			return state;
	}
}

export default function useErrorStack() {
	const [errorStack, dispatch] = React.useReducer(reducer, { errors: [] });

	const pushError = (error: ErrorType) => {
		dispatch({ type: 'push', error });
	};

	const popError = () => {
		dispatch({ type: 'pop' });
	};

	const clearErrors = () => {
		dispatch({ type: 'clear' });
	};

	const setErrors = (errors: ErrorType[]) => {
		dispatch({ type: 'set', errors });
	};

	return { errorStack, pushError, popError, clearErrors, setErrors };
}
