'use client';
import React, { useEffect } from 'react';

// mui
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

// motion
import * as motion from 'motion/react';
import { baseAnimation, errorAnimation } from '@/components/ui/animations';

import { AnalysisError, toAnalysisRequest } from '@/api';
import { useGameLogic } from '@/components/game/GameLogic';

// my components
import GameBoard from '@/components/game/GameBoard';
import { useAnalysis } from '@/components/analysis/analysis';
import Copyright from '@/components/Copyright';
import SettingsPanel from '@/components/settings/SettingsPanel';
import AnalysisPanel from '@/components/analysis/AnalysisPanel';
import EvalBar from '@/components/analysis/EvalBar';

import { GameBoardSkeleton } from '@/components/ui/skeletons';
import { SettingsPaper } from '@/components/ui/SettingsPaper';
import ErrorSnackbar, {
	ErrorSnackbarAction,
} from '@/components/ui/ErrorSnackbar';
import { useSearchParams } from 'next/navigation';
import { makeRouteKey, readRouteState } from '@/routeState';
import { GameState } from '@/board';

interface ErrorStack {
	errors: AnalysisError[];
	action: ErrorSnackbarAction | null;
}

const AnimatedSkeleton = motion.motion.create(Skeleton);

// Component to show when AI is unavailable
const Unavailable = ({
	minHeight,
	title,
	subtitle,
}: {
	minHeight: number | string;
	title?: string;
	subtitle?: string;
}) => (
	<SettingsPaper
		key="ai-unavailable"
		{...baseAnimation}
		sx={[{ bgcolor: 'loading.main' }]}
	>
		<Box
			textAlign={'center'}
			minHeight={minHeight}
			display={'flex'}
			flexDirection={'column'}
			justifyContent={'center'}
			alignItems={'center'}
		>
			<Typography
				variant="h5"
				textAlign={'center'}
				fontWeight={400}
				gutterBottom
			>
				{title || 'Sorry, the AI engine is currently unavailable.'}
			</Typography>
			<Typography variant="body1" textAlign={'center'} fontWeight={300}>
				{subtitle ||
					`This could be due to server issues or maintenance. Please try again later.`}
			</Typography>
		</Box>
	</SettingsPaper>
);

export default function Analysis() {
	const searchParams = useSearchParams();
	const [loaded, setLoaded] = React.useState(false);
	const [gameLogic, gameLogicDispatch] = useGameLogic({ useQuery: true });
	const [analysisState, dispatchAnalysis] = useAnalysis({
		fallbackToHttp: true,
		useRtAnalysis: true,
		slowDownMs: 500,
	});
	const [errorStack, setErrorStack] = React.useState<ErrorStack>({
		errors: [],
		action: null,
	});

	// Load route state (full game state) if sid is present
	React.useEffect(() => {
		if (loaded || searchParams.entries().next().done) return; // if there are no search params, do nothing
		setLoaded(true);
		const sid = searchParams.get('sid');
		if (!sid) return;
		const payload = readRouteState<{
			gameState: GameState;
		}>(makeRouteKey('analysis', sid), { consume: false });
		if (payload) {
			gameLogicDispatch({
				type: 'change-gamestate',
				newGameState: payload.gameState,
			});
			dispatchAnalysis({
				type: 'force-analyze',
				state: {
					request: toAnalysisRequest(
						gameLogic.settings,
						payload.gameState,
					),
				},
			});
		}
	}, [
		searchParams,
		loaded,
		gameLogicDispatch,
		dispatchAnalysis,
		gameLogic.settings,
	]);

	// Listen for errors
	useEffect(() => {
		if (!loaded) return;

		if (analysisState.errorStack.length === 0) {
			setErrorStack({ errors: [], action: null });
			return;
		}

		const action = {
			onClose: () => dispatchAnalysis({ type: 'remove-error' }),
		};

		// Take the last error and put it on the snackbar
		switch (analysisState.errorStack[0].type) {
			case 'analysis-submit':
			case 'rt-analysis-submit':
				setErrorStack({
					errors: analysisState.errorStack,
					action: {
						...action,
						onClick: () => {
							dispatchAnalysis({
								type: 're-analyze',
							});
						},
						name: 'Try again',
					},
				});
				break;
			case 'rt-analysis-connect':
				setErrorStack({
					errors: analysisState.errorStack,
					action: {
						...action,
						name: 'Try again',
					},
				});
				break;
			case 'rt-analysis-lost-connection':
				gameLogicDispatch({ type: 'unavailable' });
				setErrorStack({
					errors: analysisState.errorStack,
					action: {
						...action,
						onClick: () => {
							dispatchAnalysis({ type: 'request-connection' });
							gameLogicDispatch({ type: 'request-limits' });
						},
						name: 'Reconnect',
					},
				});
		}
	}, [loaded, analysisState.errorStack, dispatchAnalysis, gameLogicDispatch]);

	// Send analysis requests when game state changes
	useEffect(() => {
		if (!loaded) return;

		if (gameLogic.game.winner || gameLogic.game.isDraw) {
			return;
		}

		// See if there is a good cause for a request
		if (
			gameLogic.action === 'set-limits' ||
			gameLogic.action === null ||
			gameLogic.action === 'change-settings' ||
			gameLogic.action === 'reset'
		) {
			// Try submitting a new request
			dispatchAnalysis({
				type: 'analyze',
				state: {
					request: toAnalysisRequest(
						gameLogic.settings,
						gameLogic.game,
					),
				},
			});
		} else if (
			gameLogic.action === 'makemove' ||
			(gameLogic.action === 'undomove' &&
				gameLogic.game.history.length > 0)
		) {
			dispatchAnalysis({
				type: 'force-analyze',
				state: {
					request: toAnalysisRequest(
						gameLogic.settings,
						gameLogic.game,
					),
				},
			});
		}
	}, [
		loaded,
		analysisState.rtFailed,
		gameLogic.action,
		gameLogic.prevAction,
		gameLogic.game,
		gameLogic.settings,
		dispatchAnalysis,
	]);

	const makeMove = (boardIndex: number, cellIndex: number) =>
		gameLogicDispatch({
			type: 'makemove',
			move: { boardIndex, cellIndex },
		});

	const showLoadingState =
		gameLogic.available === undefined ||
		analysisState.serverBusy ||
		gameLogic.available === false;

	return (
		<Box
			sx={{
				py: { xs: 1, sm: 2 },
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Box sx={{ mb: 2, width: '100%' }}>
				<Box
					sx={{
						mb: 2,
						px: {
							sm: 1,
							md: 4,
						},
						width: '100%',
					}}
				>
					{/* Snackbar for error messaging */}
					<ErrorSnackbar
						errors={errorStack.errors}
						action={errorStack.action}
					/>

					<motion.AnimatePresence mode="wait">
						{showLoadingState ? (
							gameLogic.available === false ? (
								// Unavailable state, means the backend is down or unreachable
								<Unavailable
									key={'unavailable-title'}
									minHeight={158}
								/>
							) : analysisState.serverBusy ? (
								// Server busy state, means the backend is up but busy
								<Unavailable
									key={'server-busy-title'}
									minHeight={158}
									title="The analysis server is currently busy."
									subtitle="Please try again later."
								/>
							) : (
								// Loading state, means we are waiting for the backend to respond
								<AnimatedSkeleton
									key="analysis-panel-skel"
									{...errorAnimation}
									variant="rectangular"
									width="100%"
									sx={{ borderRadius: 2 }}
								>
									<Unavailable minHeight={158} />
								</AnimatedSkeleton>
							)
						) : (
							// Everything is normal, show the analysis panel
							<AnalysisPanel
								makeMove={makeMove}
								key="analysis-panel"
								motion={baseAnimation}
								settings={gameLogic.settings}
								analysisState={analysisState}
								thinking={analysisState.thinking}
							/>
						)}
					</motion.AnimatePresence>

					<motion.AnimatePresence mode="wait">
						{showLoadingState ? (
							<AnimatedSkeleton
								key="settings-panel-skel"
								{...errorAnimation}
								variant="rectangular"
								width="100%"
								sx={{ borderRadius: 2 }}
							>
								<SettingsPanel
									onUndo={() => {}}
									onReset={() => {}}
									gameState={gameLogic.game}
									loading={false}
									limits={gameLogic.limits}
									settings={gameLogic.settings}
									onSettingsChange={() => {}}
									onOpenSettings={() => {}}
									setNewPosition={() => {}}
								/>
							</AnimatedSkeleton>
						) : (
							<SettingsPanel
								key="settings-panel"
								{...baseAnimation}
								onUndo={() =>
									gameLogicDispatch({ type: 'undomove' })
								}
								onReset={() =>
									gameLogicDispatch({ type: 'reset' })
								}
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
									gameLogicDispatch({
										type: 'toggle-settings',
									})
								}
								setNewPosition={(position) => {
									gameLogicDispatch({
										type: 'change-gamestate',
										newGameState: position,
									});
									dispatchAnalysis({
										type: 'force-analyze',
										state: {
											request: toAnalysisRequest(
												gameLogic.settings,
												position,
											),
										},
									});
								}}
							/>
						)}
					</motion.AnimatePresence>

					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							gap: {
								xs: 1.5,
								sm: 2,
							},
						}}
					>
						{showLoadingState ? (
							<Skeleton
								variant="rectangular"
								height="auto"
								sx={{
									borderRadius: 2,
									width: {
										xs: '32px',
										sm: '36px',
										md: '40px',
										lg: '48px',
									},
								}}
							/>
						) : (
							<EvalBar
								fonts={{
									sides: {
										xs: '1.2rem',
										sm: '1.4rem',
										md: '1.5rem',
										lg: '1.6rem',
									},
									eval: {
										xs: '0.8rem',
										sm: '1.0rem',
										md: '1.1rem',
										lg: '1.2rem',
									},
								}}
								width={{
									xs: '32px',
									sm: '36px',
									md: '40px',
									lg: '48px',
								}}
								height={'auto'}
								currentPlayer={gameLogic.game.currentPlayer}
								evaluation={analysisState.currentEvaluation}
								abseval={analysisState.absEvaluation}
								direction="vertical"
								thinking={analysisState.thinking}
							/>
						)}

						<Box
							sx={{
								flexGrow: 1,
								display: 'flex',
								justifyContent: 'center',
							}}
						>
							{showLoadingState ? (
								<GameBoardSkeleton maxSize={'720px'} />
							) : (
								<GameBoard
									maxSize={'720px'}
									gameState={gameLogic.game}
									handleCellClick={makeMove}
									showBestMoves
									analysisState={analysisState}
								/>
							)}
						</Box>
					</Box>
				</Box>
			</Box>
			<Copyright />
		</Box>
	);
}
