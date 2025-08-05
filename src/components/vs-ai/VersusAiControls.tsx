'use client';

import React from 'react';

// mui components
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

// icons
import StopIcon from '@mui/icons-material/Stop';
import RestartIcon from '@mui/icons-material/RestartAlt';
import AiIcon from '@mui/icons-material/Psychology';
import PersonIcon from '@mui/icons-material/Person';

interface VersusState {
	ready: boolean;
	on: boolean;
	thinking: boolean;
	engineTurn: 'X' | 'O' | null;
	gameMode: 'setup' | 'playing' | 'finished';
}

interface VersusAiControlsProps {
	versusState: VersusState;
	onStartGame: (humanPlaysFirst: boolean) => void;
	onStopGame: () => void;
	onReset: () => void;
	loading: boolean;
}

export default function VersusAiControls({
	versusState,
	onStartGame,
	onStopGame,
	onReset,
	loading,
}: VersusAiControlsProps) {
	if (versusState.gameMode === 'setup') {
		return (
			<Box sx={{ textAlign: 'center', mb: 3 }}>
				<Typography variant="h6" gutterBottom>
					Choose Game Mode
				</Typography>
				<ButtonGroup
					variant="contained"
					size="large"
					sx={{ mb: 2, borderRadius: '32px' }}
				>
					<Button
						loading={loading}
						onClick={() => onStartGame(true)}
						startIcon={<PersonIcon />}
						sx={{
							borderRadius: '32px 0 0 32px',
							textTransform: 'none',
							fontWeight: 500,
							px: 3,
						}}
					>
						You Play First (X)
					</Button>
					<Button
						loading={loading}
						onClick={() => onStartGame(false)}
						startIcon={<AiIcon />}
						sx={{
							borderRadius: '0 32px 32px 0',
							textTransform: 'none',
							fontWeight: 500,
							px: 3,
						}}
					>
						AI Plays First (X)
					</Button>
				</ButtonGroup>

				<Alert severity="info" sx={{ maxWidth: 400, mx: 'auto' }}>
					Select who goes first to start a new game against the AI
				</Alert>
			</Box>
		);
	}

	return (
		<Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
			<Button
				variant="outlined"
				onClick={onStopGame}
				startIcon={<StopIcon />}
				color="error"
				sx={{
					borderRadius: 16,
					textTransform: 'none',
					fontWeight: 500,
				}}
			>
				Stop Game
			</Button>

			<Button
				variant="contained"
				onClick={onReset}
				startIcon={<RestartIcon />}
				sx={{
					borderRadius: 16,
					textTransform: 'none',
					fontWeight: 500,
				}}
			>
				Restart
			</Button>
		</Box>
	);
}
