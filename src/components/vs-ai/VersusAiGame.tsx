'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
	EngineAPI,
	AnalysisState,
	toAnalysisRequest,
	getInitialAnalysisState,
} from '@/api';
import { GameState, Player, getInitialBoardState } from '@/board';
import GameBoard from '@/components/game/GameBoard';
import GameStatus from '@/components/game/GameStatus';
import GameControls from '@/components/game/GameControls';
import VersusAiControls from '@/components/vs-ai/VersusAiControls';
import VersusAiStatus from '@/components/vs-ai/VersusAiStatus';
import { useGameLogic } from '../game/GameLogic';
import AiSettings from './AiSettings';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

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
		engineTurn: 'O', // Default: human is X, AI is O
		gameMode: 'setup',
	});

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

	const stopVersusAi = () => {
		dispatchGameLogic({
			type: 'change-gamestate',
			newGameState: initialVsAiBoardState(),
		});
		setVersusState({
			ready: false,
			on: false,
			thinking: false,
			engineTurn: 'O',
			gameMode: 'setup',
		});
	};

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
			<GameStatus gameState={gameLogic.game} />

			<VersusAiStatus
				versusState={versusState}
				gameState={gameLogic.game}
				settings={gameLogic.settings}
			/>

			<VersusAiControls
				loading={gameLogic.loadingLimits}
				versusState={versusState}
				onStartGame={startVersusAi}
				onStopGame={stopVersusAi}
				onReset={resetGame}
			/>

			<AiSettings
				limits={gameLogic.limits}
				settings={gameLogic.settings}
				onSettingsChange={(s) =>
					dispatchGameLogic({
						type: 'change-settings',
						newSettings: s,
					})
				}
			/>

			<GameBoard
				gameState={gameLogic.game}
				handleCellClick={canMakeMove ? handlePlayerMove : () => {}}
				analysisState={analysisState}
			/>

			{(gameLogic.game.winner || gameLogic.game.isDraw) && (
				<Box sx={{ textAlign: 'center', mt: 3 }}>
					<Alert
						severity={gameLogic.game.winner ? 'success' : 'info'}
						sx={{ mb: 2 }}
					>
						{gameLogic.game.winner
							? `${gameLogic.game.winner === versusState.engineTurn ? 'AI' : 'You'} won!`
							: 'Game ended in a draw!'}
					</Alert>
					<GameControls onReset={resetGame} showNewGameButton />
				</Box>
			)}
		</Box>
	);
}
