'use client';

import React, { useCallback } from 'react';

// mui
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';

import { GameState, Player } from '@/board';

interface GameStatusProps {
	gameState: GameState;
	againstAi?: boolean;
	engineTurn?: Player;
}

export default function GameStatus({
	gameState,
	againstAi = false,
	engineTurn = null,
}: GameStatusProps) {
	const getStatusMessage = useCallback(() => {
		let currentPlayer = '';
		const enginePlaying =
			againstAi && engineTurn === gameState.currentPlayer;

		if (enginePlaying) {
			currentPlayer = 'Engine';
		} else {
			currentPlayer = `Player ${gameState.currentPlayer}`;
		}

		if (gameState.winner) {
			return `${currentPlayer} wins the game!`;
		}
		if (gameState.isDraw) {
			return 'The game is a draw!';
		}

		if (enginePlaying) {
			return 'Engine is thinking...';
		}

		let message = '';
		if (againstAi) {
			message = `Your turn! You`;
		} else {
			message = `Current player: ${gameState.currentPlayer}`;
		}

		if (gameState.activeBoard !== null) {
			function boardPosition(idx: number, ...positions: string[]) {
				switch (idx) {
					case 0:
						return positions[0];
					case 1:
						return positions[1];
					case 2:
						return positions[2];
					default:
						return '';
				}
			}

			let msg = '';
			// middle square
			if (gameState.activeBoard === 4) {
				msg += 'middle';
			} else {
				msg += boardPosition(
					Math.floor(gameState.activeBoard / 3),
					'top',
					'middle',
					'bottom',
				);
				msg += ' ';
				msg += boardPosition(
					gameState.activeBoard % 3,
					'left',
					'center',
					'right',
				);
			}

			message += ` must play in ${msg} square`;
		} else {
			message += ` can play in any available board`;
		}

		return message;
	}, [
		gameState.winner,
		gameState.activeBoard,
		gameState.isDraw,
		gameState.currentPlayer,
		againstAi,
		engineTurn,
	]);

	return (
		<Box sx={{ textAlign: 'center', mb: 3 }}>
			<Typography variant="body1" color="text.secondary" gutterBottom>
				{getStatusMessage()}
			</Typography>
		</Box>
	);
}
