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
		if (analysisState.wsFailed || analysisState.wsState === 'closed') {
			return;
		}

		// Open web socket on mount
		if (!analysisState.ws && analysisState.wsState === 'null') {
			console.log('Request connection');
			dispatchAnalysis({ type: 'request-connection' });
		}
	}, [
		gameLogic.settings,
		analysisState.wsFailed,
		analysisState.ws,
		dispatchAnalysis,
		analysisState.wsState,
	]);

	// Send analysis requests when game state changes
	useEffect(() => {
		if (gameLogic.game.winner || gameLogic.game.isDraw) {
			return;
		}

		// See if there is a good cause for a request
		if (
			gameLogic.action === null ||
			gameLogic.action === 'change-settings' ||
			gameLogic.action === 'makemove' ||
			gameLogic.action === 'undomove' ||
			(gameLogic.action === 'reset' && gameLogic.prevAction !== 'reset')
		) {
			console.log('Sending analysis request, cause: ', gameLogic.action);
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
		gameLogic.action,
		gameLogic.prevAction,
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
						onOpenSettings={() =>
							gameLogicDispatch({ type: 'toggle-settings' })
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
