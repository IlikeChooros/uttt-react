// Icons for move traversal in analysis mode

import React from 'react';

import GoToEndIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import GoToStartIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import NextIcon from '@mui/icons-material/KeyboardArrowRight';
import PreviousIcon from '@mui/icons-material/KeyboardArrowLeft';
import { IconButtonProps } from '@mui/material/IconButton';

export { GoToEndIcon, GoToStartIcon, NextIcon, PreviousIcon };

interface MoveIconsProps {
	historyLength: number;
	currentIndex: number;
	onMoveClick: (index: number) => void;
	overrides?: IconButtonProps;
}

export function useMoveIconProps({
	historyLength,
	currentIndex,
	onMoveClick,
	overrides,
}: MoveIconsProps) {
	const iconsProps = React.useMemo(() => {
		const common = {
			size: 'large' as const,
			color: 'primary' as const,
			...overrides,
		};
		return [
			{
				...common,
				'aria-label': 'Go to first move',
				disabled: historyLength === 0,
				onClick: () => onMoveClick(0),
				icon: <GoToStartIcon />,
			},
			{
				...common,
				'aria-label': 'Go to previous move',
				disabled: currentIndex <= 0,
				onClick: () => onMoveClick(Math.max(0, currentIndex - 1)),
				icon: <PreviousIcon />,
			},
			{
				...common,
				'aria-label': 'Go to next move',
				disabled: currentIndex >= historyLength - 1,
				onClick: () =>
					onMoveClick(Math.min(historyLength - 1, currentIndex + 1)),
				icon: <NextIcon />,
			},
			{
				...common,
				'aria-label': 'Go to last move',
				disabled:
					historyLength === 0 || currentIndex === historyLength - 1,
				onClick: () => onMoveClick(historyLength - 1),
				icon: <GoToEndIcon />,
			},
		];
	}, [historyLength, currentIndex, onMoveClick, overrides]);

	return iconsProps;
}
