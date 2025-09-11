'use client';

import React from 'react';
import { BoardSettings, GameState } from '@/board';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { DifficultyType } from '@/components/vs-ai/AiSettings';
import { PlayerChip, AiPlayerChip } from '@/components/ui/PlayerChip';
import AiDiffSettings from '@/components/vs-ai/AiDiffSettings';
import GameStatus from '../game/GameStatus';

interface VersusState {
	ready: boolean;
	on: boolean;
	thinking: boolean;
	engineTurn: 'X' | 'O' | null;
	gameMode: 'setup' | 'playing' | 'finished';
}

interface VersusAiStatusProps {
	versusState: VersusState;
	gameState: GameState;
	settings: BoardSettings;
	difficulty: DifficultyType;
}

export default function VersusAiStatus({
	versusState,
	gameState,
	settings,
	difficulty,
}: VersusAiStatusProps) {
	return (
		<Box>
			{/* Player indicators */}
			<Box sx={{ textAlign: 'center', mb: 2 }}>
				<AiDiffSettings
					size="h6"
					difficulty={difficulty}
					settings={settings}
				/>
			</Box>

			<Stack direction="row" spacing={2} justifyContent="center" mb={2}>
				{versusState.engineTurn === 'X' ? (
					<AiPlayerChip
						player="X"
						isCurrent={gameState.currentPlayer === 'X'}
					/>
				) : (
					<PlayerChip
						player="X"
						isCurrent={gameState.currentPlayer === 'X'}
					/>
				)}
				<Typography
					variant="body2"
					sx={{ alignSelf: 'center', color: 'text.secondary' }}
				>
					vs
				</Typography>
				{versusState.engineTurn === 'O' ? (
					<AiPlayerChip
						player="O"
						isCurrent={gameState.currentPlayer === 'O'}
					/>
				) : (
					<PlayerChip
						player="O"
						isCurrent={gameState.currentPlayer === 'O'}
					/>
				)}
			</Stack>

			<GameStatus
				gameState={gameState}
				engineTurn={versusState.engineTurn}
				againstAi
			/>
		</Box>
	);
}
