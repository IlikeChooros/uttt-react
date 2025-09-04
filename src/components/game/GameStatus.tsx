'use client';

import React, { useCallback } from 'react';

// mui
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';

import { GameState } from '@/board';

interface GameStatusProps {
	gameState: GameState;
}

export default function GameStatus({ gameState }: GameStatusProps) {
	const getStatusMessage = useCallback(() => {
		if (gameState.winner) {
			return `Player ${gameState.winner} wins the game!`;
		}
		if (gameState.isDraw) {
			return 'The game is a draw!';
		}

		let message = `Current player: ${gameState.currentPlayer}`;

		if (gameState.activeBoard !== null) {
			message += ` (must play in highlighted board)`;
		} else {
			message += ` (can play in any available board)`;
		}

		return message;
	}, [
		gameState.winner,
		gameState.activeBoard,
		gameState.isDraw,
		gameState.currentPlayer,
	]);

	return (
		<Box sx={{ textAlign: 'center', mb: 3 }}>
			<Typography variant="body1" color="text.secondary" gutterBottom>
				{getStatusMessage()}
			</Typography>
		</Box>
	);
}
