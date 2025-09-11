'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { BoardSettings, GameState, Player } from '@/board';

// mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// mui icons
import AnalysisIcon from '@mui/icons-material/AutoGraph';

// mine
import { DifficultyType } from '@/components/vs-ai/AiSettings';
import AiDiffSettings from '@/components/vs-ai/AiDiffSettings';
import RefButton from '@/components/ui/RefButton';
import { analysisRoute } from '@/routing';

interface VersusAiResultProps {
	onNewGame: () => void;
	gameState: GameState;
	engineTurn: Player;
	settings: BoardSettings;
	difficulty: DifficultyType;
}

export default function VersusAiResult({
	onNewGame,
	gameState,
	engineTurn,
	settings,
	difficulty,
}: VersusAiResultProps) {
	const copyBtnRef = React.useRef<HTMLButtonElement | null>(null);
	const router = useRouter();

	const handleAnalyze = () => {
		router.push(analysisRoute(gameState));
	};

	return (
		<Box
			textAlign={'center'}
			minHeight={'190px'}
			display={'flex'}
			flexDirection={'column'}
			justifyContent={'space-between'}
		>
			<Typography variant="h6">Game Over</Typography>

			<AiDiffSettings difficulty={difficulty} settings={settings} />

			<Box my={2}>
				<Typography variant="subtitle1">
					{gameState.isDraw
						? 'Game drawn'
						: gameState.winner
							? engineTurn === gameState.winner
								? 'AI won'
								: 'You won!'
							: 'Game ended'}
				</Typography>
			</Box>

			<Box
				display={'grid'}
				gridTemplateColumns={'1fr auto 1fr'}
				alignItems={'center'}
				gap={1}
			>
				<div aria-hidden="true"></div>
				<Button variant="contained" onClick={onNewGame}>
					New Game
				</Button>

				<RefButton
					ref={copyBtnRef}
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
			</Box>
		</Box>
	);
}
