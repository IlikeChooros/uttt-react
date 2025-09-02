'use client';

import React from 'react';
import { Player } from '@/board';
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

interface CellProps {
	value: Player;
	canClick: boolean;
	isBestMove?: boolean;
	isTopMove?: boolean;
	onClick: () => void;
}

export default function Cell({
	value,
	canClick,
	isBestMove,
	isTopMove,
	onClick,
}: CellProps) {
	const theme = useTheme();

	return (
		<Box
			onClick={canClick ? onClick : undefined}
			sx={{
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
				borderRadius: {
					xs: 0.5,
					sm: 1,
				},
				border: isBestMove
					? `2px solid ${theme.palette.success.main}`
					: isTopMove
						? `2px solid ${theme.palette.warning.main}`
						: `1px solid ${theme.palette.divider}`,
				backgroundColor: isBestMove
					? alpha(theme.palette.success.main, 0.1)
					: isTopMove
						? alpha(theme.palette.warning.main, 0.05)
						: 'transparent',
				cursor: canClick ? 'pointer' : 'not-allowed',
				transition: 'all 0.2s ease-in-out',
				'&:hover': canClick
					? {
							backgroundColor: isBestMove
								? alpha(theme.palette.success.main, 0.2)
								: alpha(theme.palette.action.hover, 0.8),
							borderColor: isBestMove
								? theme.palette.success.main
								: theme.palette.primary.main,
							transform: 'scale(1.02)',
						}
					: {},
				'&.Mui-disabled': {
					color:
						value === 'X'
							? 'evalbar.Xtext'
							: value === 'O'
								? 'evalbar.Otext'
								: theme.palette.text.disabled,
					borderColor: isBestMove
						? theme.palette.success.main
						: isTopMove
							? theme.palette.warning.main
							: theme.palette.divider,
					backgroundColor: isBestMove
						? alpha(theme.palette.success.main, 0.1)
						: isTopMove
							? alpha(theme.palette.warning.main, 0.05)
							: 'transparent',
					opacity: value ? 1 : 0.5,
				},
			}}
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
