'use client';
import React from 'react';

import { useRouter } from 'next/navigation';

// animations
import { motion } from 'motion/react';
import { baseAnimation, boardAnimation } from '@/components/ui/animations';

// mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// mui icons
import RestartIcon from '@mui/icons-material/RestartAlt';
import UndoIcon from '@mui/icons-material/Undo';

// components
import { useGameLogic } from '@/components/game/GameLogic';
import GameBoard from '@/components/game/GameBoard';
import GameStatus from '@/components/game/GameStatus';
import GameRules from '@/components/ui/GameRules';
import { SettingsPaper } from '@/components/ui/SettingsPaper';
import { PlayerChip } from '@/components/ui/PlayerChip';
import { analysisRoute } from '@/routing';
import LandingPageLayout from '@/components/ui/LandingPageLayout';
import { AnalysisButton } from '@/components/analysis/AnalysisButton';
import ExportGameButton from '@/components/ui/ExportGameButton';
import MsgPopover from '@/components/ui/MsgPopover';

export default function Local() {
	const [gameLogic, gameLogicDispatch] = useGameLogic({ local: true });
	const router = useRouter();
	const isFinished = gameLogic.game.winner !== null || gameLogic.game.isDraw;
	const handleAnalyze = () => router.push(analysisRoute(gameLogic.game));
	const msgAnchorRef = React.useRef<HTMLButtonElement>(null);
	const [msgOpen, setMsgOpen] = React.useState(false);

	return (
		<LandingPageLayout
			title="Local Pass & Play"
			description="Share one device and alternate moves. Capture small boards to control the macro board. Use Undo for take-backs or Restart to explore new lines. Then analyze moves and improve your strategy."
		>
			<SettingsPaper
				{...baseAnimation}
				sx={{
					width: '100%',
					maxWidth: 900,
					textAlign: 'center',
					mt: { xxs: 2, md: 4 },
				}}
			>
				{/* Popover for export message */}
				<MsgPopover
					open={msgOpen}
					onClose={() => setMsgOpen(false)}
					anchorEl={msgAnchorRef.current}
					msg="Game exported to clipboard!"
					closeAfter={700}
				/>

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

				<Box
					mt={3}
					mb={1}
					display={'grid'}
					gridTemplateColumns={'1fr auto 1fr'}
					alignItems={'center'}
					gap={1}
				>
					<div aria-hidden="true" />

					<div
						style={{
							display: 'flex',
							gap: 8,
							justifyContent: 'center',
						}}
					>
						{!isFinished && (
							<Button
								variant="outlined"
								onClick={() =>
									gameLogicDispatch({ type: 'undomove' })
								}
								startIcon={<UndoIcon />}
								color="primary"
								aria-label="Undo last move"
								sx={{
									padding: { xxs: '6px 8px', sm: '8px 12px' },
								}}
							>
								Undo
							</Button>
						)}
						<Button
							variant={isFinished ? 'contained' : 'outlined'}
							onClick={() => gameLogicDispatch({ type: 'reset' })}
							size="medium"
							startIcon={<RestartIcon />}
							aria-label={
								isFinished ? 'Play again' : 'Restart game'
							}
						>
							{isFinished ? 'Play Again' : 'Restart'}
						</Button>
					</div>

					<div
						style={{ justifySelf: 'end', display: 'flex', gap: 8 }}
					>
						{isFinished && (
							<>
								<AnalysisButton onClick={handleAnalyze} />
							</>
						)}
						<ExportGameButton
							ref={msgAnchorRef}
							gameState={gameLogic.game}
							asIcon
							onCopy={() => setMsgOpen(true)}
						/>
					</div>
				</Box>
			</SettingsPaper>

			<Box
				sx={{
					width: '100%',
					maxWidth: 900,
					mb: 2,
				}}
			>
				<GameRules />
			</Box>

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
		</LandingPageLayout>
	);
}
