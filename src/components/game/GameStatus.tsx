'use client';

import React, { useCallback } from 'react';
import { GameState } from '@/board';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

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

	const getStatusSeverity = useCallback(() => {
		if (gameState.winner) return 'success';
		if (gameState.isDraw) return 'warning';
		return 'info';
	}, [gameState.winner, gameState.isDraw]);

	return (
		<Box sx={{ textAlign: 'center', mb: 3 }}>
			<Alert
				severity={getStatusSeverity()}
				sx={{
					justifyContent: 'center',
					fontSize: '0.9rem',
					width: '100%',
				}}
			>
				{getStatusMessage()}
			</Alert>
		</Box>
	);
}
