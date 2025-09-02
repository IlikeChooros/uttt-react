'use client';

import React, { useState, useEffect, useCallback } from 'react';

// api stuff
import {
	EngineAPI,
	AnalysisState,
	toAnalysisRequest,
	getInitialAnalysisState,
} from '@/api';
import { GameState, Player, getInitialBoardState } from '@/board';

// mui
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

// my components
import Copyright from '@/components/Copyright';
import GameBoard from '@/components/game/GameBoard';
import GameControls from '@/components/game/GameControls';
import { useGameLogic } from '@/components/game/GameLogic';
import AiSettings from '@/components/vs-ai/AiSettings';

interface VersusState {
	ready: boolean;
	on: boolean;
	thinking: boolean;
	engineTurn: Player;
	gameMode: 'setup' | 'playing' | 'finished';
}

function initialVsAiBoardState(): GameState {
	return { ...getInitialBoardState(), enabled: false };
}

export default function VersusAiGame() {
	const [analysisState, setAnalysisState] = useState<AnalysisState>(
		getInitialAnalysisState,
	);
	const [gameLogic, dispatchGameLogic] = useGameLogic(
		null,
		initialVsAiBoardState,
	);
	const [versusState, setVersusState] = useState<VersusState>({
		ready: false,
		on: false,
		thinking: false,
		engineTurn: 'O', // Default: human starts (X)
		gameMode: 'setup',
	});
	// selected engine turn while configuring (AI will play as this mark when game starts)
	const [pendingEngineTurn, setPendingEngineTurn] = useState<'X' | 'O'>('O');

	// AI move logic
	useEffect(() => {
		async function makeAiMove() {
			if (!versusState.on || !versusState.ready || versusState.thinking)
				return;
			if (versusState.engineTurn !== gameLogic.game.currentPlayer) return;
			if (gameLogic.game.winner || gameLogic.game.isDraw) return;

			setVersusState((prev) => ({ ...prev, thinking: true }));

			try {
				const moves = await EngineAPI.analyze(
					toAnalysisRequest(gameLogic.settings, gameLogic.game),
				);

				const bestMove = moves[0] || null;

				if (bestMove != null) {
					console.log('made move', bestMove);
					dispatchGameLogic({ type: 'makemove', move: bestMove });
				}

				setVersusState((prev) => ({ ...prev, thinking: false }));
			} catch (error) {
				console.error('AI move failed:', error);
				setVersusState((prev) => ({ ...prev, thinking: false }));
			}
		}

		if (versusState.gameMode === 'playing') {
			makeAiMove();
		}
	}, [
		gameLogic.game.currentPlayer,
		gameLogic.game,
		gameLogic.settings,
		dispatchGameLogic,
		versusState.on,
		versusState.ready,
		versusState.thinking,
		versusState.engineTurn,
		versusState.gameMode,
	]);

	// Update game mode based on game state
	useEffect(() => {
		if (gameLogic.game.winner || gameLogic.game.isDraw) {
			setVersusState((prev) => ({
				...prev,
				gameMode: 'finished',
				thinking: false,
			}));
		} else if (versusState.on && versusState.ready) {
			setVersusState((prev) => ({ ...prev, gameMode: 'playing' }));
		}
	}, [
		gameLogic.game.winner,
		gameLogic.game.isDraw,
		versusState.on,
		versusState.ready,
	]);

	const handlePlayerMove = useCallback(
		(boardIndex: number, cellIndex: number) => {
			// Prevent moves during AI thinking or if game is over
			if (
				versusState.thinking ||
				gameLogic.game.winner ||
				gameLogic.game.isDraw
			)
				return;

			// Prevent moves when it's the AI's turn
			if (
				versusState.on &&
				versusState.engineTurn === gameLogic.game.currentPlayer
			)
				return;

			dispatchGameLogic({
				type: 'makemove',
				move: { boardIndex, cellIndex },
			});
		},
		[
			gameLogic.game,
			versusState.thinking,
			versusState.on,
			versusState.engineTurn,
			dispatchGameLogic,
		],
	);

	const startVersusAi = (humanPlaysFirst: boolean) => {
		dispatchGameLogic({
			type: 'change-gamestate',
			newGameState: getInitialBoardState(),
		}); // imporant! Board MUST be enabled
		setVersusState({
			ready: true,
			on: true,
			thinking: false,
			engineTurn: humanPlaysFirst ? 'O' : 'X',
			gameMode: 'playing',
		});
	};

	// stopVersusAi removed from UI; could be reintroduced via a menu if needed

	const resetGame = () => {
		dispatchGameLogic({
			type: 'change-gamestate',
			newGameState: getInitialBoardState(),
		});
		setAnalysisState(getInitialAnalysisState());
		if (versusState.on) {
			setVersusState((prev) => ({
				...prev,
				thinking: false,
				gameMode: 'playing',
			}));
		}
	};

	const handleStartConfiguredGame = () => {
		// human plays first iff pendingEngineTurn === 'O'
		startVersusAi(pendingEngineTurn === 'O');
	};

	const isHumanTurn =
		!versusState.on ||
		versusState.engineTurn !== gameLogic.game.currentPlayer;
	const canMakeMove =
		isHumanTurn &&
		!versusState.thinking &&
		!gameLogic.game.winner &&
		!gameLogic.game.isDraw;

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
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					{/* <VersusAiControls
						loading={gameLogic.loadingLimits}
						versusState={versusState}
						onStartGame={startVersusAi}
						onStopGame={stopVersusAi}
						onReset={resetGame}
					/> */}

					<Box sx={{ maxWidth: '900px', width: '100%' }}>
						<AiSettings
							limits={gameLogic.limits}
							settings={gameLogic.settings}
							onSettingsChange={(s) =>
								dispatchGameLogic({
									type: 'change-settings',
									newSettings: s,
								})
							}
							engineTurn={pendingEngineTurn}
							onEngineTurnChange={(et) =>
								setPendingEngineTurn(et)
							}
						/>
					</Box>

					{versusState.gameMode === 'setup' && (
						<Box
							sx={{
								mt: 1.5,
								display: 'flex',
								gap: 1,
								width: '100%',
								maxWidth: 600,
							}}
						>
							<Box sx={{ flex: 1 }} />
							<Button
								variant="contained"
								sx={{
									borderRadius: 2,
									textTransform: 'none',
									fontWeight: 600,
								}}
								onClick={handleStartConfiguredGame}
							>
								Start Game
							</Button>
						</Box>
					)}

					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							width: '100%',
						}}
					>
						<GameBoard
							maxSize={'800px'}
							gameState={gameLogic.game}
							handleCellClick={
								canMakeMove ? handlePlayerMove : () => {}
							}
							analysisState={analysisState}
						/>
					</Box>

					{(gameLogic.game.winner || gameLogic.game.isDraw) && (
						<Box sx={{ textAlign: 'center', mt: 3 }}>
							<Alert
								severity={
									gameLogic.game.winner ? 'success' : 'info'
								}
								sx={{ mb: 2 }}
							>
								{gameLogic.game.winner
									? `${gameLogic.game.winner === versusState.engineTurn ? 'AI' : 'You'} won!`
									: 'Game ended in a draw!'}
							</Alert>
							<GameControls
								onReset={resetGame}
								showNewGameButton
							/>
						</Box>
					)}
				</Box>
			</Box>
			<Copyright />
		</Box>
	);
}
