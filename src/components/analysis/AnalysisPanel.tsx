'use client';

import React from 'react';
import { Psychology as AnalysisIcon } from '@mui/icons-material';
import { AnalysisState } from '@/api';
import { BoardSettings } from '@/board';
import Paper from '@mui/material/Paper';
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';

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

	return (
		<Paper
			sx={{
				p: 2,
				mb: 3,
				backgroundColor: alpha(theme.palette.info.main, 0.05),
			}}
		>
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', md: 'row' },
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
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<AnalysisIcon color="primary" />
						<Typography variant="h6">Engine Analysis</Typography>
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
					{thinking && (
						<LinearProgress
							sx={{
								width: '90%',
								height: 6,
								borderRadius: 4,
							}}
						/>
					)}
				</Box>
			</Box>

			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', md: 'row' },
					gap: 2,
				}}
			>
				<Box sx={{ flex: 1 }}>
					<Typography variant="body2" gutterBottom>
						<strong>Position Evaluation:</strong>{' '}
						{analysisState.currentEvaluation}
					</Typography>
					<Typography variant="body2" gutterBottom>
						<strong>Best Move:</strong>{' '}
						{analysisState.bestMove
							? `Board ${analysisState.bestMove.boardIndex + 1}, Cell ${analysisState.bestMove.cellIndex + 1}`
							: 'None'}
					</Typography>
					<Typography variant="body2">
						<strong>Depth:</strong> {analysisState.bestMove?.depth}
					</Typography>
				</Box>

				<Box sx={{ flex: 1 }}>
					<Typography variant="body2" gutterBottom>
						<strong>Top Moves:</strong>
					</Typography>
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
						{analysisState.topMoves
							.slice(0, 3)
							.map((move, index) => (
								<Chip
									key={`${move.boardIndex}-${move.cellIndex}`}
									label={`${move.boardIndex + 1}${move.cellIndex + 1} (${move.evaluation})`}
									size="small"
									color={index === 0 ? 'success' : 'warning'}
									variant={
										index === 0 ? 'filled' : 'outlined'
									}
								/>
							))}
					</Box>
				</Box>
			</Box>
		</Paper>
	);
}
