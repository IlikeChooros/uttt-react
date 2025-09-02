'use client';

import React, { useMemo } from 'react';

// mui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import { alpha, useTheme } from '@mui/material/styles';

// icons
import AnalysisIcon from '@mui/icons-material/Psychology';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// mine
import { AnalysisState } from '@/api';
import { BoardSettings } from '@/board';
import BestMoveChip from '@/components/analysis/BestMoveChip';

interface AnalysisPanelProps {
	settings: BoardSettings;
	analysisState: AnalysisState;
	thinking: boolean;
}

export default function AnalysisPanel({
	settings,
	analysisState,
	thinking,
}: AnalysisPanelProps) {
	const theme = useTheme();
	const analysisStats = useMemo<
		{ name: string; data: string; helpText?: string }[]
	>(
		() => [
			{
				name: 'Position Evaluation',
				data: `${analysisState.currentEvaluation}`,
				helpText:
					'Probability of current side to win, if mate is detected shows number of moves to termination with "M" prefix',
			},
			{
				name: 'Best Move',
				data: `${
					analysisState.bestMove
						? `Board ${analysisState.bestMove.boardIndex + 1}, Cell ${analysisState.bestMove.cellIndex + 1}`
						: 'None'
				}`,
			},
			{
				name: 'Depth',
				data: `${analysisState.bestMove?.depth}`,
			},
		],
		[analysisState.currentEvaluation, analysisState.bestMove],
	);

	return (
		<Paper
			sx={{
				p: 2,
				mb: 3,
				backgroundColor: alpha(theme.palette.primary.main, 0.05),
				borderRadius: 2,
			}}
			elevation={0}
		>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
					mb: 2,
				}}
			>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
					}}
				>
					<Box
						sx={{ textAlign: 'center', display: 'flex', gap: 0.5 }}
					>
						<AnalysisIcon color="primary" fontSize="large" />
						<Typography variant="h4">Engine Analysis</Typography>
					</Box>
					<Box sx={{ display: 'flex', textAlign: 'center' }}>
						<Typography variant="caption" color="text.secondary">
							Depth {settings.engineDepth} • Threads{' '}
							{settings.nThreads} • Memory {settings.memorySizeMb}
							MB
						</Typography>
					</Box>
				</Box>

				<Box
					sx={{
						display: 'flex',
						flexGrow: 1,
						alignItems: 'center',
						justifyContent: 'center',
						mt: { xs: 1, sm: 0 },
					}}
				>
					{thinking ? (
						<LinearProgress
							sx={{
								width: '90%',
								height: 6,
								borderRadius: 4,
							}}
						/>
					) : (
						<div
							style={{
								width: '100%',
								height: 6,
								backgroundColor: 'transparent',
							}}
						></div>
					)}
				</Box>
			</Box>

			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', sm: 'row' },
					gap: 2,
				}}
			>
				<Box sx={{ flex: 1 }}>
					{analysisStats.map((v) => (
						<Box
							key={v.name}
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 0.5,
							}}
						>
							{v.helpText !== undefined && (
								<Tooltip placement="bottom" title={v.helpText}>
									<HelpOutlineIcon
										sx={{ fontSize: '18px' }}
									/>
								</Tooltip>
							)}
							<Typography
								variant="body2"
								sx={{
									ml: v.helpText !== undefined ? 0 : '22px',
								}}
							>
								<strong>{v.name}:</strong> {v.data}
							</Typography>
						</Box>
					))}
				</Box>

				<Box sx={{ flex: 1 }}>
					<Typography variant="body2" gutterBottom>
						<strong>Top Moves:</strong>
					</Typography>
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
						{analysisState.topMoves
							.slice(0, 3)
							.map((move, index) => (
								<BestMoveChip
									isTopMove={index === 0}
									move={move}
									key={`BestMoveChip-${move.boardIndex}${move.cellIndex}`}
								/>
							))}
					</Box>
				</Box>
			</Box>
		</Paper>
	);
}
