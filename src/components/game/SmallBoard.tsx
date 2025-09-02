'use client';

import React from 'react';

// mui
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';

// my components
import Cell from '@/components/game/Cell';
import { SmallBoardState } from '@/board';
import { EngineMove } from '@/api';

interface SmallBoardProps {
	boardIndex: number;
	smallBoard: SmallBoardState;
	isActive: boolean;
	showAnalysis?: boolean;
	bestMove?: EngineMove | null;
	topMoves?: EngineMove[];
	onCellClick: (boardIndex: number, cellIndex: number) => void;
}

export default function SmallBoard({
	boardIndex,
	smallBoard,
	isActive,
	showAnalysis,
	bestMove,
	topMoves,
	onCellClick,
}: SmallBoardProps) {
	const theme = useTheme();

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
						borderRadius: 1.75,
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
				{Array.from({ length: 9 }, (_, cellIndex) => {
					const value = smallBoard.board[cellIndex];
					const canClick =
						isActive &&
						!value &&
						!smallBoard.winner &&
						!smallBoard.isDraw;
					const isBestMove =
						bestMove?.boardIndex === boardIndex &&
						bestMove?.cellIndex === cellIndex;
					const isTopMove = topMoves?.some(
						(move) =>
							move.boardIndex === boardIndex &&
							move.cellIndex === cellIndex,
					);

					return (
						<Cell
							key={cellIndex}
							value={value}
							canClick={canClick}
							isBestMove={isBestMove && showAnalysis}
							isTopMove={isTopMove && showAnalysis}
							onClick={() => onCellClick(boardIndex, cellIndex)}
						/>
					);
				})}
			</Box>
		</Paper>
	);
}
