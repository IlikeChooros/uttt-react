// Bottom navigation for move traversal in analysis mode
// for mobile devices (sm and down)

import React from 'react';

import { GameState } from '@/board';

import Box from '@mui/material/Box';

import { useMoveIconProps } from '@/components/analysis/icons';
import Paper from '@mui/material/Paper';
import { IconButton } from '@mui/material';

interface MoveBottomNavigationProps {
	gameState: GameState;
	onMoveClick: (index: number) => void;
}

export default function MoveBottomNavigation({
	gameState,
	onMoveClick,
}: MoveBottomNavigationProps) {
	const iconProps = useMoveIconProps({
		historyLength: gameState.history.length,
		currentIndex: gameState.historyIndex,
		onMoveClick,
	});

	return (
		<Paper
			elevation={3}
			sx={{
				position: 'fixed',
				bottom: 0,
				left: 0,
				right: 0,
				display: 'grid',
				gridTemplateColumns: 'auto auto 1fr auto auto',
				zIndex: (theme) => theme.zIndex.appBar,
			}}
		>
			{iconProps.slice(0, 2).map((props, index) => (
				<IconButton key={index} {...props}>
					{props.icon}
				</IconButton>
			))}

			<Box sx={{ flexGrow: 1 }} />

			{iconProps.slice(2).map((props, index) => (
				<IconButton key={index} {...props}>
					{props.icon}
				</IconButton>
			))}
		</Paper>
	);
}
