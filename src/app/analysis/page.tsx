'use client';
import React, { useEffect } from 'react';

// mui
import Box from '@mui/material/Box';

import { toAnalysisRequest } from '@/api';
import { useGameLogic } from '@/components/game/GameLogic';

// my components
import GameBoard from '@/components/game/GameBoard';
import { useAnalysis } from '@/components/analysis/analysis';
import Copyright from '@/components/Copyright';
import SettingsPanel from '@/components/settings/SettingsPanel';
import AnalysisPanel from '@/components/analysis/AnalysisPanel';

export default function Analysis() {
	const [analysisState, dispatchAnalysis] = useAnalysis({
		fallbackOnWebSocketError: true,
	});
	const [gameLogic, gameLogicDispatch] = useGameLogic();

	// Handle WebSocket connection for analysis
	useEffect(() => {
		if (analysisState.wsFailed) {
			return;
		}

		if (!analysisState.ws) {
			console.log('Request connection');
			dispatchAnalysis({ type: 'request-connection' });
		} else {
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
		if (!gameLogic.game.winner && !gameLogic.game.isDraw) {
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

	return (
		<Box
			sx={{
				my: 4,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Box sx={{ mb: 4, width: '100%' }}>
				<Box
					sx={{
						mb: 4,
						px: {
							sm: 1,
							md: 4,
						},
						width: '100%',
					}}
				>
					<SettingsPanel
						onUndo={() => gameLogicDispatch({ type: 'undomove' })}
						onReset={() => gameLogicDispatch({ type: 'reset' })}
						gameState={gameLogic.game}
						loading={gameLogic.loadingLimits}
						limits={gameLogic.limits}
						settings={gameLogic.settings}
						onSettingsChange={(newSettings) =>
							gameLogicDispatch({
								type: 'change-settings',
								newSettings,
							})
						}
					/>

					<AnalysisPanel
						settings={gameLogic.settings}
						analysisState={analysisState}
						thinking={analysisState.thinking}
					/>

					<GameBoard
						gameState={gameLogic.game}
						handleCellClick={(boardIndex, cellIndex) =>
							gameLogicDispatch({
								type: 'makemove',
								move: { boardIndex, cellIndex },
							})
						}
						showBestMoves
						analysisState={analysisState}
					/>
				</Box>
			</Box>
			<Copyright />
		</Box>
	);
}
