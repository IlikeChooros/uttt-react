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
	getInitialGameState,
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
	return {
		...getInitialGameState(),
		enabled: false,
	};
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

			const startTime = Date.now();
			const minThinkTime = 450; // ms

			try {
				const moves = EngineAPI.parseAnalysisResponse(
					await EngineAPI.analyze(
						toAnalysisRequest(gameLogic.settings, gameLogic.game),
					),
				);

				// Ensure the "thinking" state is visible for at least `minThinkTime` ms
				const elapsed = Date.now() - startTime;
				if (elapsed < minThinkTime) {
					await new Promise((r) =>
						setTimeout(r, minThinkTime - elapsed),
					);
				}

				const bestMove = moves[0] || null;
				if (bestMove != null) {
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
			newGameState: getInitialGameState(),
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
			newGameState: getInitialGameState(),
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
				minHeight: '100dvh',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'flex-start',
				py: { xs: 6, md: 8 },
				gap: 6,
				px: 1,
			}}
		>
			<Box sx={{ textAlign: 'center', maxWidth: 760 }}>
				<Typography
					variant="h3"
					component="h1"
					gutterBottom
					sx={{
						fontWeight: 600,
						fontSize: { xs: '2.25rem', md: '2.8rem' },
						lineHeight: 1.15,
						mb: 2,
					}}
				>
					Play vs AI
				</Typography>
				<Typography
					variant="h6"
					color="text.secondary"
					sx={{
						fontWeight: 300,
						mb: 3,
						mx: 'auto',
						maxWidth: 640,
					}}
				>
					Play against our AI opponent. Choose your difficulty, decide
					who goes first, and test your strategic skills. Can you
					outsmart the AI and claim victory?
				</Typography>
			</Box>
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
