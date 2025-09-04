'use client';

import React, { useCallback } from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import { GameState } from '@/board';
import { AnalysisState } from '@/api';
import SmallBoardComponent from '@/components/game/SmallBoard';

interface GameBoardProps {
	disabled?: boolean;
	lastMoveHighlight?: boolean;
	gameState: GameState;
	handleCellClick: (boardIndex: number, cellIndex: number) => void;
	showBestMoves?: boolean;
	analysisState?: AnalysisState;
	maxSize: BoxProps['maxWidth'] | number;
}

export default function GameBoard({
	disabled = false,
	lastMoveHighlight = true,
	gameState,
	handleCellClick,
	showBestMoves,
	analysisState,
	maxSize,
}: GameBoardProps) {
	const isBoardActive = useCallback(
		(boardIndex: number): boolean => {
			if (gameState.winner || gameState.isDraw || !gameState.enabled)
				return false;
			if (
				gameState.boards[boardIndex].winner ||
				gameState.boards[boardIndex].isDraw
			)
				return false;
			return (
				gameState.activeBoard === null ||
				gameState.activeBoard === boardIndex
			);
		},
		[gameState],
	);

	return (
		<Box
			sx={{
				width: '100%',
				maxWidth: maxSize,
			}}
		>
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr 1fr',
					gap: {
						xs: 1,
						sm: 1.5,
						md: 2,
						lg: 2.5,
					},
					width: '100%',
					height: 'fit-content',
					mx: 'auto',
					opacity: typeof handleCellClick === 'function' ? 1 : 0.6,
					pointerEvents:
						typeof handleCellClick === 'function' ? 'auto' : 'none',
					transition: 'opacity 0.3s ease-in-out',
				}}
			>
				{Array.from({ length: 9 }, (_, boardIndex) => (
					<SmallBoardComponent
						lastMoveHighlight={lastMoveHighlight}
						lastMove={
							gameState.history.length > 0
								? gameState.history[
										gameState.history.length - 1
									].move
								: undefined
						}
						key={boardIndex}
						boardIndex={boardIndex}
						smallBoard={gameState.boards[boardIndex]}
						isActive={!disabled && isBoardActive(boardIndex)}
						showAnalysis={showBestMoves}
						bestMove={analysisState?.bestMove}
						topMoves={analysisState?.topMoves}
						onCellClick={handleCellClick}
					/>
				))}
			</Box>
		</Box>
	);
}
