'use client';
import React from 'react';

// mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// icons
import RestartIcon from '@mui/icons-material/RestartAlt';
import UndoIcon from '@mui/icons-material/Undo';

// mine components
import { useGameLogic } from '@/components/game/GameLogic';
import GameBoard from '@/components/game/GameBoard';
import GameStatus from '@/components/game/GameStatus';
import GameRules from '@/components/ui/GameRules';
import Copyright from '@/components/Copyright';

export default function Local() {
	const [gameLogic, gameLogicDispatch] = useGameLogic();

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
					<Box textAlign={'center'}>
						<Typography variant="h4" gutterBottom>
							Pass and play
						</Typography>
					</Box>

					<GameStatus gameState={gameLogic.game} />

					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							mb: 2,
							gap: 2,
						}}
					>
						<Button
							variant="outlined"
							onClick={() => gameLogicDispatch({ type: 'reset' })}
							size="large"
							startIcon={<RestartIcon />}
							sx={{ bgcolor: 'primary', px: 2 }}
						>
							Restart
						</Button>

						<Button
							variant="outlined"
							onClick={() =>
								gameLogicDispatch({ type: 'undomove' })
							}
							size="large"
							startIcon={<UndoIcon />}
							color="primary"
							sx={{ px: 2 }}
						>
							Undo
						</Button>
					</Box>

					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							mb: 2,
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
					</Box>

					<GameRules showAnalysis={gameLogic.settings.showAnalysis} />
				</Box>
			</Box>
			<Copyright />
		</Box>
	);
}
