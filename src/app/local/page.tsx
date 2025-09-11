'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { baseAnimation, boardAnimation } from '@/components/ui/animations';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import RestartIcon from '@mui/icons-material/RestartAlt';
import UndoIcon from '@mui/icons-material/Undo';
import AnalysisIcon from '@mui/icons-material/AutoGraph';
import { useGameLogic } from '@/components/game/GameLogic';
import GameBoard from '@/components/game/GameBoard';
import GameStatus from '@/components/game/GameStatus';
import GameRules from '@/components/ui/GameRules';
import Copyright from '@/components/Copyright';
import { SettingsPaper } from '@/components/ui/SettingsPaper';
import { PlayerChip } from '@/components/ui/PlayerChip';
import RefButton from '@/components/ui/RefButton';
import { analysisRoute } from '@/routing';
import LandingPageLayout from '@/components/ui/LandingPageLayout';

export default function Local() {
	const [gameLogic, gameLogicDispatch] = useGameLogic({ local: true });
	const router = useRouter();
	const isFinished = gameLogic.game.winner !== null || gameLogic.game.isDraw;
	const handleAnalyze = () => router.push(analysisRoute(gameLogic.game));

	return (
		<LandingPageLayout
			title="Local Pass & Play"
			description="Share one device and alternate moves. Capture small boards to control the macro board. Use Undo for take-backs or Restart to explore new lines. Then analyze moves and improve your strategy."
			gap={2}
		>
			<SettingsPaper
				{...baseAnimation}
				sx={{
					width: '100%',
					maxWidth: 820,
					textAlign: 'center',
					mt: { xs: 2, md: 4 },
				}}
			>
				<Stack
					direction="row"
					spacing={1}
					justifyContent="center"
					mb={2}
					alignItems="center"
				>
					<PlayerChip
						player="X"
						label="Player 1"
						isCurrent={
							gameLogic.game.currentPlayer === 'X' && !isFinished
						}
					/>
					<Typography variant="body2" color="text.secondary">
						vs
					</Typography>
					<PlayerChip
						color="secondary"
						player="O"
						label="Player 2"
						isCurrent={
							gameLogic.game.currentPlayer === 'O' && !isFinished
						}
					/>
				</Stack>

				<GameStatus gameState={gameLogic.game} />

				<Stack
					direction={'row'}
					spacing={2}
					justifyContent="center"
					alignItems="center"
					mt={3}
					mb={1}
				>
					{!isFinished && (
						<Button
							variant="outlined"
							onClick={() =>
								gameLogicDispatch({ type: 'undomove' })
							}
							size="large"
							startIcon={<UndoIcon />}
							color="primary"
							aria-label="Undo last move"
						>
							Undo
						</Button>
					)}
					<Button
						variant={isFinished ? 'contained' : 'outlined'}
						onClick={() => gameLogicDispatch({ type: 'reset' })}
						size="large"
						startIcon={<RestartIcon />}
						aria-label={isFinished ? 'Play again' : 'Restart game'}
					>
						{isFinished ? 'Play Again' : 'Restart'}
					</Button>
					{isFinished && (
						<RefButton
							onClick={handleAnalyze}
							iconButtonProps={{
								sx: { bgcolor: 'primary.light', p: 1 },
								'aria-label': 'Analyze finished game',
							}}
							asIcon
						>
							<AnalysisIcon />
						</RefButton>
					)}
				</Stack>
			</SettingsPaper>

			<motion.div
				{...boardAnimation}
				style={{
					display: 'flex',
					justifyContent: 'center',
					width: '100%',
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
			</motion.div>

			<Box
				sx={{
					width: '100%',
					maxWidth: 840,
					mx: 'auto',
					px: { xs: 1, sm: 2 },
				}}
			>
				<GameRules />
			</Box>

			<Copyright />
		</LandingPageLayout>
	);
}
