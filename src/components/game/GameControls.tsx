'use client';

import React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import RestartIcon from '@mui/icons-material/RestartAlt';

interface GameControlsProps {
	onReset: () => void;
	showNewGameButton?: boolean;
}

export default function GameControls({
	onReset,
	showNewGameButton = false,
}: GameControlsProps) {
	return (
		<Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
			{showNewGameButton ? (
				<Button
					variant="contained"
					onClick={onReset}
					startIcon={<RestartIcon />}
					sx={{
						borderRadius: 2,
						textTransform: 'none',
						fontWeight: 500,
					}}
				>
					New Game
				</Button>
			) : (
				<Box>
					<Button
						onClick={onReset}
						size="large"
						startIcon={<RestartIcon />}
						sx={{ bgcolor: 'primary', px: 2 }}
					>
						Restart
					</Button>
				</Box>
			)}
		</Box>
	);
}
