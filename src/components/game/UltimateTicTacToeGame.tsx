'use client';

import React, { useEffect } from 'react';

// mui
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

import { toAnalysisRequest } from '@/api';
import { useGameLogic } from './GameLogic';

// my components
import GameBoard from '@/components/game/GameBoard';
import GameStatus from '@/components/game/GameStatus';
import GameControls from '@/components/game/GameControls';
import SettingsPanel from '@/components/settings/SettingsPanel';
import AnalysisPanel from '@/components/analysis/AnalysisPanel';
import GameRules from '@/components/ui/GameRules';
import { useAnalysis } from '@/components/analysis/analysis';

export default function UltimateTicTacToeGame() {
	const [analysisState, dispatchAnalysis] = useAnalysis({
		fallbackOnWebSocketError: true,
	});
	const [gameLogic, gameLogicDispatch] = useGameLogic();

	// Handle WebSocket connection for analysis
	useEffect(() => {
		if (analysisState.wsFailed) {
			return;
		}

		if (gameLogic.settings.showAnalysis && !analysisState.ws) {
			console.log('Request connection');
			dispatchAnalysis({ type: 'request-connection' });
		} else if (!gameLogic.settings.showAnalysis && analysisState.ws) {
			// Close WebSocket when analysis is disabled
			console.log('Closing WebSocket connection...');
			dispatchAnalysis({ type: 'request-disconnection' });
		}
	}, [
		gameLogic.settings,
		analysisState.wsFailed,
		analysisState.ws,
		dispatchAnalysis,
	]);

	// Send analysis requests when game state changes
	useEffect(() => {
		if (
			gameLogic.settings.showAnalysis &&
			!gameLogic.game.winner &&
			!gameLogic.game.isDraw
		) {
			console.log('Sending analysis request...');
			dispatchAnalysis({
				type: 'analyze',
				state: {
					request: toAnalysisRequest(
						gameLogic.settings,
						gameLogic.game,
					),
				},
			});
		}
	}, [
		analysisState.wsFailed,
		gameLogic.game,
		gameLogic.settings,
		dispatchAnalysis,
	]);

	// Reset the game
	const resetGame = () => gameLogicDispatch({ type: 'reset' });

	return (
		<Paper
			elevation={2}
			sx={{
				p: {
					xs: 1,
					sm: 4,
				},
				borderRadius: 3,
				width: '100%',
			}}
		>
			<GameStatus gameState={gameLogic.game} />

			<GameControls onReset={resetGame} />

			<SettingsPanel
				gameState={gameLogic.game}
				loading={gameLogic.loadingLimits}
				limits={gameLogic.limits}
				settings={gameLogic.settings}
				onSettingsChange={(newSettings) =>
					gameLogicDispatch({ type: 'change-settings', newSettings })
				}
			/>

			{gameLogic.settings.showAnalysis && (
				<AnalysisPanel
					settings={gameLogic.settings}
					analysisState={analysisState}
					thinking={analysisState.thinking}
				/>
			)}

			<GameBoard
				gameState={gameLogic.game}
				handleCellClick={(boardIndex, cellIndex) =>
					gameLogicDispatch({
						type: 'makemove',
						move: { boardIndex, cellIndex },
					})
				}
				boardSettings={gameLogic.settings}
				analysisState={analysisState}
			/>

			{(gameLogic.game.winner || gameLogic.game.isDraw) && (
				<Box sx={{ textAlign: 'center', mt: 3 }}>
					<GameControls onReset={resetGame} showNewGameButton />
				</Box>
			)}

			<GameRules showAnalysis={gameLogic.settings.showAnalysis} />
		</Paper>
	);
}
