'use client';
import React, { useEffect } from 'react';

// mui
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

// motion
import * as motion from 'motion/react';
import {
	baseAnimation,
	boardAnimation,
	errorAnimation,
} from '@/components/ui/animations';

import { toAnalysisRequest } from '@/api';
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

const AnimatedSkeleton = motion.motion.create(Skeleton);

// Component to show when AI is unavailable
const Unavailable = ({ minHeight }: { minHeight: number | string }) => (
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
				Sorry, the AI engine is currently unavailable.
			</Typography>
			<Typography variant="body1" textAlign={'center'} fontWeight={300}>
				This could be due to server issues or maintenance. Please try
				again later.
			</Typography>
		</Box>
	</SettingsPaper>
);

export default function Analysis() {
	const [analysisState, dispatchAnalysis] = useAnalysis({
		fallbackToHttp: true,
		useRtAnalysis: true,
	});
	const [gameLogic, gameLogicDispatch] = useGameLogic();

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
			(gameLogic.action === 'undomove' &&
				gameLogic.game.history.length > 0) ||
			gameLogic.action === 'reset'
		) {
			console.log(
				'Sending analysis request, cause: ',
				gameLogic.action,
				'prev',
				gameLogic.prevAction,
			);
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
		analysisState.rtFailed,
		gameLogic.action,
		gameLogic.prevAction,
		gameLogic.game,
		gameLogic.settings,
		dispatchAnalysis,
	]);

	return (
		<Box
			sx={{
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
					<motion.AnimatePresence mode="wait">
						{gameLogic.available === undefined ||
						gameLogic.available === false ? (
							gameLogic.available === false ? (
								<Unavailable
									key={'unavailable-title'}
									minHeight={158}
								/>
							) : (
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
							<AnalysisPanel
								key="analysis-panel"
								motion={baseAnimation}
								settings={gameLogic.settings}
								analysisState={analysisState}
								thinking={analysisState.thinking}
							/>
						)}
					</motion.AnimatePresence>

					<motion.AnimatePresence mode="wait">
						{gameLogic.available === undefined ||
						gameLogic.available === false ? (
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
						{gameLogic.available === undefined ||
						gameLogic.available === false ? (
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
							{gameLogic.available === undefined ||
							gameLogic.available === false ? (
								<GameBoardSkeleton maxSize={'720px'} />
							) : (
								<GameBoard
									maxSize={'720px'}
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
							)}
						</Box>
					</Box>
				</Box>
			</Box>
			<Copyright />
		</Box>
	);
}
