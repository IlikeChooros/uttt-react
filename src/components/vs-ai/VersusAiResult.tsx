'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { BoardSettings, GameState, Player } from '@/board';

// mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// mine
import { DifficultyType } from '@/components/vs-ai/AiSettings';
import AiDiffSettings from '@/components/vs-ai/AiDiffSettings';
import { analysisRoute } from '@/routing';
import { AnalysisButton } from '../analysis/AnalysisButton';
import ExportGameButton from '../ui/ExportGameButton';
import MsgPopover from '../ui/MsgPopover';

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
	const router = useRouter();
	const exportBtnRef = React.useRef<HTMLButtonElement>(null);
	const [msgOpen, setMsgOpen] = React.useState(false);

	const handleAnalyze = () => {
		router.push(analysisRoute(gameState));
	};

	return (
		<Box
			textAlign={'center'}
			minHeight={'180px'}
			display={'flex'}
			flexDirection={'column'}
			justifyContent={'space-between'}
		>
			<MsgPopover
				open={msgOpen}
				onClose={() => setMsgOpen(false)}
				anchorEl={exportBtnRef.current}
				msg="Game exported to clipboard!"
				closeAfter={700}
			/>

			<Typography variant="h5">Game Over</Typography>

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

				<div style={{ justifySelf: 'end', display: 'flex', gap: 8 }}>
					<AnalysisButton onClick={handleAnalyze} />
					<ExportGameButton
						ref={exportBtnRef}
						gameState={gameState}
						asIcon
						onCopy={() => setMsgOpen(true)}
					/>
				</div>
			</Box>
		</Box>
	);
}
