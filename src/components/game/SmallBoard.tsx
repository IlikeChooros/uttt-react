'use client';

import React from 'react';

// mui
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';

// my components
import { MemoizedCell } from '@/components/game/Cell';
import { Move, SmallBoardState } from '@/board';
import { EngineMove } from '@/api';

export interface SmallBoardProps {
	lastMoveHighlight?: boolean;
	lastMove?: Move | null;
	boardIndex: number;
	smallBoard: SmallBoardState;
	isActive: boolean;
	showAnalysis?: boolean;
	bestMove?: EngineMove | null;
	topMoves?: EngineMove[];
	freshAnalysis?: boolean;
	onCellClick: (boardIndex: number, cellIndex: number) => void;
}

export const MemoizedSmallBoard = React.memo(
	SmallBoard,
	(prevProps, nextProps) => {
		let smallBoardEqual = true;
		for (let i = 0; i < 9; i++) {
			if (
				prevProps.smallBoard.board[i] !== nextProps.smallBoard.board[i]
			) {
				smallBoardEqual = false;
				break;
			}
		}

		let topMovesEqual = true;
		if (prevProps.topMoves && nextProps.topMoves) {
			if (prevProps.topMoves.length !== nextProps.topMoves.length) {
				topMovesEqual = false;
			} else {
				for (let i = 0; i < prevProps.topMoves.length; i++) {
					if (
						prevProps.topMoves[i].boardIndex !==
							nextProps.topMoves[i].boardIndex ||
						prevProps.topMoves[i].cellIndex !==
							nextProps.topMoves[i].cellIndex
					) {
						topMovesEqual = false;
						break;
					}
				}
			}
		} else if (prevProps.topMoves || nextProps.topMoves) {
			topMovesEqual = false;
		}

		const ok =
			smallBoardEqual &&
			topMovesEqual &&
			prevProps.smallBoard.winner === nextProps.smallBoard.winner &&
			prevProps.smallBoard.isDraw === nextProps.smallBoard.isDraw &&
			prevProps.isActive === nextProps.isActive &&
			prevProps.showAnalysis === nextProps.showAnalysis &&
			prevProps.bestMove === nextProps.bestMove &&
			prevProps.lastMove?.boardIndex === nextProps.lastMove?.boardIndex &&
			prevProps.lastMove?.cellIndex === nextProps.lastMove?.cellIndex &&
			prevProps.lastMoveHighlight === nextProps.lastMoveHighlight &&
			prevProps.freshAnalysis === nextProps.freshAnalysis;

		return ok;
	},
);

export default function SmallBoard({
	boardIndex,
	smallBoard,
	isActive,
	showAnalysis,
	bestMove,
	topMoves,
	lastMoveHighlight,
	lastMove,
	freshAnalysis,
	onCellClick,
}: SmallBoardProps) {
	const theme = useTheme();

	const cellProps = React.useMemo(() => {
		return Array.from({ length: 9 }, (_, cellIndex) => {
			const value = smallBoard.board[cellIndex];
			const canClick =
				isActive && !value && !smallBoard.winner && !smallBoard.isDraw;
			const isBestMove =
				bestMove?.boardIndex === boardIndex &&
				bestMove?.cellIndex === cellIndex;
			const isGoodMove = topMoves?.some(
				(move) =>
					move.boardIndex === boardIndex &&
					move.cellIndex === cellIndex,
			);
			const isHighlighted =
				lastMoveHighlight &&
				lastMove &&
				lastMove.boardIndex === boardIndex &&
				lastMove.cellIndex === cellIndex;

			return {
				value,
				canClick,
				isBestMove: isBestMove && showAnalysis,
				isGoodMove: isGoodMove && showAnalysis,
				isHighlighted,
				onClick: () => onCellClick(boardIndex, cellIndex),
				isStale: !freshAnalysis,
			};
		});
	}, [
		boardIndex,
		smallBoard.winner,
		smallBoard.isDraw,
		freshAnalysis,
		isActive,
		lastMove,
		lastMoveHighlight,
		onCellClick,
		showAnalysis,
		smallBoard.board,
		bestMove,
		topMoves,
	]);

	return (
		<Paper
			elevation={isActive ? 4 : 1}
			sx={{
				p: { xs: 0.75, md: 1.25 },
				borderRadius: {
					xs: 1.25,
					sm: 2,
				},
				backgroundColor: isActive
					? alpha(theme.palette.primary.main, 0.1)
					: 'transparent',
				border: isActive
					? `2px solid ${theme.palette.primary.main}`
					: `1px solid ${theme.palette.divider}`,
				position: 'relative',
				transition: 'all 0.3s ease-in-out',
				'&:hover': isActive
					? {
							transform: 'translateY(-2px)',
							boxShadow: theme.shadows[6],
						}
					: {},
				aspectRatio: '1 / 1',
				maxHeight: '250px',
				// maxWidth: '250px',
			}}
		>
			{/* Winner overlay */}
			{(smallBoard.winner || smallBoard.isDraw) && (
				<Box
					sx={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: alpha(
							smallBoard.winner === 'X'
								? theme.palette.primary.main
								: smallBoard.winner === 'O'
									? theme.palette.secondary.main
									: theme.palette.grey[500],
							0.8,
						),
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						borderRadius: {
							xs: 1,
							sm: 2,
						},
						zIndex: 1,
					}}
				>
					<Box
						sx={{
							color: 'white',
							fontWeight: 'bold',
							textShadow: '0 2px 4px rgba(0,0,0,0.3)',
							fontSize: {
								xs: '1.2rem',
								sm: '1.5rem',
								md: '2rem',
								lg: '2.5rem',
							},
						}}
					>
						{smallBoard.isDraw ? '—' : smallBoard.winner}
					</Box>
				</Box>
			)}

			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: 'repeat(3, 1fr)',
					gap: {
						xs: 0.25,
						sm: 0.5,
						md: 0.75,
						lg: 1,
					},
				}}
			>
				{cellProps.map((props, idx) => (
					<MemoizedCell
						key={`Cell-${boardIndex}-${idx}`}
						{...props}
					/>
				))}
			</Box>
		</Paper>
	);
}
