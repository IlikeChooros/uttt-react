'use client';

import React, { useCallback } from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import { GameState } from '@/board';
import { AnalysisState } from '@/api';
import {
	SmallBoardProps,
	MemoizedSmallBoard,
} from '@/components/game/SmallBoard';

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

	const smallBoardProps: Array<SmallBoardProps> = React.useMemo(
		() =>
			Array.from({ length: 9 }, (_, index) => {
				const lastMove = gameState.history.length
					? gameState.history[gameState.historyIndex].move
					: undefined;

				// Relevant board, in an analysis sense,
				// is one that has the best move, one of the top moves
				// or was the last move played
				const isRelevantBoard =
					analysisState?.bestMove?.boardIndex === index ||
					analysisState?.topMoves?.some(
						(move) => move.boardIndex === index,
					) ||
					lastMove?.boardIndex === index;

				// Make the irrelevant boards not update their props
				// unless something about them changes
				const bestMove = isRelevantBoard
					? analysisState?.bestMove
					: undefined;
				const topMoves = isRelevantBoard
					? analysisState?.topMoves
					: undefined;
				const freshAnalysis =
					analysisState?.freshAnalysis && isRelevantBoard;
				const showAnalysis = showBestMoves && isRelevantBoard;
				return {
					lastMoveHighlight,
					lastMove: isRelevantBoard ? lastMove : undefined,
					boardIndex: index,
					smallBoard: gameState.boards[index],
					isActive: !disabled && isBoardActive(index),
					showAnalysis,
					bestMove,
					topMoves,
					onCellClick: handleCellClick,
					freshAnalysis,
				};
			}),
		[
			analysisState,
			disabled,
			gameState,
			handleCellClick,
			isBoardActive,
			lastMoveHighlight,
			showBestMoves,
		],
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
						xxs: 1,
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
				{smallBoardProps.map((props) => (
					<MemoizedSmallBoard
						key={`SmallBoard${props.boardIndex}`}
						{...props}
					/>
				))}
			</Box>
		</Box>
	);
}
