'use client';

import React, { useState, useEffect, useCallback } from 'react';

import * as motion from 'motion/react';
import {
	baseAnimation,
	boardAnimation,
	errorAnimation,
} from '@/components/ui/animations';

// api stuff
import {
	EngineAPI,
	AnalysisState,
	toAnalysisRequest,
	getInitialAnalysisState,
} from '@/api';
import {
	GameState,
	Player,
	getInitialBoardState,
	getInitialBoardSettings,
} from '@/board';

// mui
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';

// my components
import Copyright from '@/components/Copyright';
import GameBoard from '@/components/game/GameBoard';
import { useGameLogic } from '@/components/game/GameLogic';
import AiSettings, {
	DifficultyLevelsType,
	DifficultyType,
} from '@/components/vs-ai/AiSettings';
import { SettingsPaper } from '@/components/ui/SettingsPaper';
import { AnimatePresence } from 'motion/react';
import { Button, Skeleton, Typography } from '@mui/material';
import VersusAiStatus from '@/components/vs-ai/VersusAiStatus';
import VersusAiResult from '@/components/vs-ai/VersusAiResult';
import { GameBoardSkeleton } from '@/components/ui/skeletons';

const difficultyLevels: DifficultyLevelsType = [
	{
		label: 'Easy' as DifficultyType,
		limits: {
			engineDepth: 1,
			nThreads: 1,
			memorySizeMb: 4,
			multiPv: 1,
		},
	},
	{
		label: 'Medium' as DifficultyType,
		limits: {
			engineDepth: 4,
			nThreads: 2,
			memorySizeMb: 8,
			multiPv: 1,
		},
	},
	{
		label: 'Hard' as DifficultyType,
		limits: {
			engineDepth: 6,
			nThreads: 3,
			memorySizeMb: 16,
			multiPv: 1,
		},
	},
];

interface VersusState {
	ready: boolean;
	on: boolean;
	thinking: boolean;
	engineTurn: Player;
	gameMode: 'setup' | 'playing' | 'finished';
}

function initialVersusState(): VersusState {
	return {
		ready: false,
		on: false,
		thinking: false,
		engineTurn: 'O', // Default: human starts (X)
		gameMode: 'setup',
	};
}

function initialVsAiBoardState(): GameState {
	return { ...getInitialBoardState(), enabled: false };
}

const Unavailable = () => (
	<SettingsPaper
		key="ai-unavailable"
		{...baseAnimation}
		sx={[{ bgcolor: 'loading.main' }]}
	>
		<Typography
			variant="h5"
			textAlign={'center'}
			fontWeight={400}
			gutterBottom
		>
			Sorry, the AI engine is currently unavailable.
		</Typography>
		<Typography variant="body1" textAlign={'center'} fontWeight={300}>
			This could be due to server issues or maintenance. Please try again
			later.
		</Typography>
	</SettingsPaper>
);

export default function VersusAiGame() {
	const [analysisState, setAnalysisState] = useState<AnalysisState>(
		getInitialAnalysisState,
	);
	// Use 'Easy' settings as default
	const [gameLogic, dispatchGameLogic] = useGameLogic({
		settingsInit: () => ({
			...getInitialBoardSettings(),
			...difficultyLevels[0].limits,
		}),
		gameStateInit: initialVsAiBoardState,
	});
	const [versusState, setVersusState] =
		useState<VersusState>(initialVersusState);

	// selected engine turn while configuring (AI will play as this mark when game starts)
	const [pendingEngineTurn, setPendingEngineTurn] = useState<'X' | 'O'>('O');
	const [selectedDifficulty, setSelectedDifficulty] =
		useState<DifficultyType>('Easy');

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
		setVersusState(initialVersusState());
	};

	const handleStartConfiguredGame = () => {
		// human plays first iff pendingEngineTurn === 'O'
		startVersusAi(pendingEngineTurn === 'O');
	};

	const isHumanTurn =
		!versusState.on ||
		versusState.engineTurn !== gameLogic.game.currentPlayer;
	const canMakeMove =
		versusState.on &&
		versusState.ready &&
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
					<Box sx={{ maxWidth: '900px', width: '100%' }}>
						<AnimatePresence mode="wait">
							{/* AI availability status, in pre-loading state */}
							{gameLogic.available === undefined && (
								<motion.motion.div
									key="ai-loading-skeleton"
									{...errorAnimation}
								>
									<Skeleton
										variant="rectangular"
										width={'100%'}
										sx={{ borderRadius: 2 }}
									>
										<Unavailable />
									</Skeleton>
								</motion.motion.div>
							)}

							{/* AI unavailable */}
							{gameLogic.available === false && <Unavailable />}

							{/* AI available; setup / playing / finished modes */}
							{versusState.gameMode === 'setup' &&
								gameLogic.available === true && (
									<AiSettings
										minHeight={'230px'}
										key="ai-settings"
										difficulty={selectedDifficulty}
										difficultyLevels={difficultyLevels}
										onDifficultyChange={(diff) =>
											setSelectedDifficulty(diff)
										}
										motion={baseAnimation}
										title="Play vs AI"
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
										handleStart={handleStartConfiguredGame}
									/>
								)}

							{versusState.gameMode === 'playing' && (
								<SettingsPaper
									key="ai-playing"
									{...baseAnimation}
								>
									<Box
										sx={{
											minHeight: '190px',
											height: '100%',
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											flexDirection: 'column',
										}}
									>
										<Typography
											variant="h5"
											textAlign={'center'}
											fontWeight={400}
											gutterBottom
										>
											Game in progress
										</Typography>

										<VersusAiStatus
											difficulty={selectedDifficulty}
											versusState={versusState}
											gameState={gameLogic.game}
											settings={gameLogic.settings}
										/>

										<Box
											sx={{
												mt: 2,
												display: 'flex',
												justifyContent: 'center',
											}}
										>
											<Button
												startIcon={<CloseIcon />}
												variant="contained"
												color="error"
												onClick={resetGame}
											>
												Exit
											</Button>
										</Box>
									</Box>
								</SettingsPaper>
							)}

							{versusState.gameMode === 'finished' && (
								<SettingsPaper
									// sx={[{ minHeight: '230px' }]}
									key="ai-finished"
									{...baseAnimation}
								>
									<VersusAiResult
										onNewGame={resetGame}
										gameState={gameLogic.game}
										engineTurn={versusState.engineTurn}
										settings={gameLogic.settings}
										difficulty={selectedDifficulty}
									/>
								</SettingsPaper>
							)}
						</AnimatePresence>
					</Box>

					{/* Game board */}
					{(gameLogic.available === undefined ||
						gameLogic.available === false) && (
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								width: '100%',
							}}
						>
							<GameBoardSkeleton maxSize={'700px'} />
						</div>
					)}
					{gameLogic.available === true && (
						<motion.motion.div
							{...boardAnimation}
							style={{
								display: 'flex',
								justifyContent: 'center',
								width: '100%',
							}}
						>
							<GameBoard
								disabled={!canMakeMove}
								maxSize={'700px'}
								gameState={gameLogic.game}
								handleCellClick={handlePlayerMove}
								analysisState={analysisState}
							/>
						</motion.motion.div>
					)}
				</Box>
			</Box>
			<Copyright />
		</Box>
	);
}
