'use client';

import React from 'react';
import { Player } from '@/board';
import { alpha, type Theme } from '@mui/material/styles';
import Box, { type BoxProps } from '@mui/material/Box';

interface CellProps extends Omit<BoxProps, 'onClick'> {
	value: Player;
	canClick: boolean;
	isHighlighted?: boolean | null;
	isBestMove?: boolean;
	isGoodMove?: boolean;
	isStale?: boolean;
	onClick: () => void;
}

type Variant =
	| 'best'
	| 'good'
	| 'highlighted'
	| 'default'
	| 'stale-good'
	| 'stale-best';

export const MemoizedCell = React.memo(Cell, (prevProps, nextProps) => {
	return (
		prevProps.value === nextProps.value &&
		prevProps.canClick === nextProps.canClick &&
		prevProps.isHighlighted === nextProps.isHighlighted &&
		prevProps.isBestMove === nextProps.isBestMove &&
		prevProps.isGoodMove === nextProps.isGoodMove &&
		prevProps.isStale === nextProps.isStale
	);
});

export default function Cell({
	value,
	canClick,
	isBestMove,
	isGoodMove,
	isHighlighted,
	isStale,
	onClick,
	...rest
}: CellProps) {
	const config = React.useCallback(
		(theme: Theme) => {
			// Colors per variant
			const cfg = {
				best: {
					borderWidth: 2,
					borderColor: theme.palette.success.main,
					bg: alpha(theme.palette.success.main, 0.1),
					hoverBg: alpha(theme.palette.success.main, 0.32),
					hoverBorder: theme.palette.success.main,
				},
				good: {
					borderWidth: 2,
					borderColor: theme.palette.warning.main,
					bg: alpha(theme.palette.warning.main, 0.05),
					hoverBg: alpha(theme.palette.warning.main, 0.32),
					hoverBorder: theme.palette.warning.main,
				},
				highlighted: {
					borderWidth: 2,
					borderColor: alpha(theme.palette.secondary.main, 0.7),
					bg: 'action.selected',
					hoverBg: alpha(theme.palette.secondary.main, 0.25),
					hoverBorder: theme.palette.secondary.main,
				},
				default: {
					borderWidth: 1,
					borderColor: theme.palette.divider,
					bg: 'transparent',
					hoverBg: alpha(theme.palette.action.hover, 0.8),
					hoverBorder: theme.palette.primary.main,
				},
				'stale-good': {
					borderWidth: 2,
					borderColor: alpha(theme.palette.warning.main, 0.2),
					bg: alpha(theme.palette.warning.main, 0.05),
					hoverBg: alpha(theme.palette.warning.main, 0.1),
					hoverBorder: theme.palette.warning.main,
				},
				'stale-best': {
					borderWidth: 2,
					borderColor: alpha(theme.palette.success.main, 0.2),
					bg: alpha(theme.palette.success.main, 0.05),
					hoverBg: alpha(theme.palette.success.main, 0.1),
					hoverBorder: theme.palette.success.main,
				},
			} as const;

			let variant: Variant = 'default';
			if (isHighlighted) variant = 'highlighted';
			else if (isStale) {
				if (isBestMove) variant = 'stale-best';
				else if (isGoodMove) variant = 'stale-good';
			} else {
				if (isBestMove) variant = 'best';
				else if (isGoodMove) variant = 'good';
			}

			return cfg[variant];
		},
		[isBestMove, isGoodMove, isHighlighted, isStale],
	);

	return (
		<Box
			onClick={canClick ? onClick : undefined}
			sx={(theme) => {
				const c = config(theme);
				return {
					color: value === 'O' ? 'evalbar.Otext' : 'evalbar.Xtext',
					aspectRatio: '1 / 1',
					minWidth: 'unset',
					fontSize: {
						xs: '1.25rem',
						sm: '1.75rem',
						md: '2rem',
						lg: '2.3rem',
					},
					fontWeight: 'bold',
					position: 'relative',
					borderRadius: { xs: 0.5, sm: 1 },
					border: `${c.borderWidth}px solid ${c.borderColor}`,
					backgroundColor: c.bg,
					cursor: canClick ? 'pointer' : 'not-allowed',
					transition: 'all 0.2s ease-in-out',
					'&:hover': canClick
						? {
								backgroundColor: c.hoverBg,
								borderColor: c.hoverBorder,
								transform: 'scale(1.1)',
							}
						: {},
					// Optional thinking cue (subtle glow) without branching
					boxShadow: isStale
						? `0 0 0 2px ${alpha(c.borderColor as string, 0.15)} inset`
						: 'none',
					'&.Mui-disabled': {
						color:
							value === 'X'
								? 'evalbar.Xtext'
								: value === 'O'
									? 'evalbar.Otext'
									: theme.palette.text.disabled,
						borderColor: c.borderColor,
						backgroundColor: c.bg,
						opacity: value ? 1 : 0.5,
					},
				};
			}}
			{...rest}
		>
			<div
				style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
				}}
			>
				{value}
			</div>
		</Box>
	);
}
