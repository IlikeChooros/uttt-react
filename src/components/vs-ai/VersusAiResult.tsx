'use client';

import React from 'react';

import { BoardSettings, GameState, Player } from '@/board';
import { DifficultyType } from '@/components/vs-ai/AiSettings';

// mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AiDiffSettings from './AiDiffSettings';

interface VersusAiResultProps {
	onNewGame: () => void;
	gameState: GameState;
	engineTurn: Player;
	settings: BoardSettings;
	difficulty: DifficultyType;
}

export default function VersusAiResult({
	onNewGame,
	gameState,
	engineTurn,
	settings,
	difficulty,
}: VersusAiResultProps) {
	return (
		<Box
			textAlign={'center'}
			minHeight={'190px'}
			display={'flex'}
			flexDirection={'column'}
			justifyContent={'space-between'}
		>
			<Typography variant="h6">Game Over</Typography>

			<AiDiffSettings difficulty={difficulty} settings={settings} />

			<Box my={2}>
				<Typography variant="subtitle1">
					{gameState.isDraw
						? 'Game drawn'
						: gameState.winner
							? engineTurn === gameState.winner
								? 'AI won'
								: 'You won!'
							: 'Game ended'}
				</Typography>
			</Box>

			<Box display={'flex'} justifyContent={'center'} flexWrap={'wrap'}>
				<Button variant="contained" onClick={onNewGame}>
					New Game
				</Button>
			</Box>
		</Box>
	);
}
