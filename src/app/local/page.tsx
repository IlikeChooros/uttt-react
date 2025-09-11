'use client';
import React from 'react';

import { useRouter } from 'next/navigation';

// motion
import * as motion from 'motion/react';
import { baseAnimation, boardAnimation } from '@/components/ui/animations';

// mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// icons
import RestartIcon from '@mui/icons-material/RestartAlt';
import UndoIcon from '@mui/icons-material/Undo';
import AnalysisIcon from '@mui/icons-material/AutoGraph';

// mine components
import { useGameLogic } from '@/components/game/GameLogic';
import GameBoard from '@/components/game/GameBoard';
import GameStatus from '@/components/game/GameStatus';
import GameRules from '@/components/ui/GameRules';
import Copyright from '@/components/Copyright';
import { SettingsPaper } from '@/components/ui/SettingsPaper';
import { PlayerChip } from '@/components/ui/PlayerChip';
import RefButton from '@/components/ui/RefButton';
import { getRoutePath } from '@/routing';

export default function Local() {
	const [gameLogic, gameLogicDispatch] = useGameLogic({
		local: true,
	});
	const router = useRouter();

	const handleAnalyze = () => {
		router.push(
			getRoutePath('/analysis', {
				gameState: gameLogic.game,
				settings: gameLogic.settings,
			}),
		);
	};

	return (
		<Box
			sx={{
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
					<SettingsPaper {...baseAnimation} textAlign={'center'}>
						<Typography variant="h4" fontSize={'2rem'} gutterBottom>
							Pass and play
						</Typography>

						<Box
							display={'flex'}
							justifyContent={'center'}
							flexDirection={'row'}
							mb={2}
						>
							<PlayerChip
								player="X"
								label="Player 1"
								isCurrent={gameLogic.game.currentPlayer === 'X'}
							/>
							<Typography
								variant="body2"
								sx={{
									alignSelf: 'center',
									color: 'text.secondary',
									mx: 1,
								}}
							>
								vs
							</Typography>
							<PlayerChip
								color="secondary"
								player="O"
								label="Player 2"
								isCurrent={gameLogic.game.currentPlayer === 'O'}
							/>
						</Box>

						<GameStatus gameState={gameLogic.game} />

						<Box
							display={'grid'}
							gridTemplateColumns={'1fr auto 1fr'}
							alignItems={'center'}
							gap={1}
						>
							<div aria-hidden="true"></div>
							{gameLogic.game.winner === null &&
							!gameLogic.game.isDraw ? (
								<>
									<div
										style={{
											display: 'flex',
											gap: 8,
											justifyItems: 'center',
										}}
									>
										<Button
											variant="outlined"
											onClick={() =>
												gameLogicDispatch({
													type: 'reset',
												})
											}
											size="large"
											startIcon={<RestartIcon />}
											sx={{ bgcolor: 'primary', px: 2 }}
										>
											Restart
										</Button>

										<Button
											variant="outlined"
											onClick={() =>
												gameLogicDispatch({
													type: 'undomove',
												})
											}
											size="large"
											startIcon={<UndoIcon />}
											color="primary"
											sx={{ px: 2 }}
										>
											Undo
										</Button>
									</div>
									<div aria-hidden="true"></div>
								</>
							) : (
								<>
									<Button
										variant="contained"
										onClick={() =>
											gameLogicDispatch({ type: 'reset' })
										}
										size="large"
										startIcon={<RestartIcon />}
										sx={{ bgcolor: 'primary', px: 2 }}
									>
										Play Again
									</Button>
									<RefButton
										onClick={handleAnalyze}
										iconButtonProps={{
											sx: {
												bgcolor: 'primary.light',
												p: 1,
												justifySelf: 'end',
											},
										}}
										asIcon
									>
										<AnalysisIcon />
									</RefButton>
								</>
							)}
						</Box>
					</SettingsPaper>

					<motion.motion.div
						{...boardAnimation}
						style={{
							display: 'flex',
							justifyContent: 'center',
							marginBottom: 2,
						}}
					>
						<GameBoard
							maxSize={'720px'}
							gameState={gameLogic.game}
							handleCellClick={(boardIndex, cellIndex) =>
								gameLogicDispatch({
									type: 'makemove',
									move: { boardIndex, cellIndex },
								})
							}
						/>
					</motion.motion.div>

					<GameRules showAnalysis={gameLogic.settings.showAnalysis} />
				</Box>
			</Box>
			<Copyright />
		</Box>
	);
}
