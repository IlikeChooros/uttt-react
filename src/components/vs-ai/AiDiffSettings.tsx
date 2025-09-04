import React from 'react';
import { BoardSettings } from '@/board';
import { DifficultyType } from '@/components/vs-ai/AiSettings';
import Typography from '@mui/material/Typography';

interface AiDiffSettingsProps {
	difficulty: DifficultyType;
	settings: BoardSettings;
}

export default function AiDiffSettings({
	difficulty,
	settings,
}: AiDiffSettingsProps) {
	return (
		<Typography variant="body1" color="text.secondary">
			{difficulty !== 'custom'
				? `Difficulty: ${difficulty} `
				: `AI Settings: Depth ${settings.engineDepth} • Threads ${settings.nThreads} • Memory ${settings.memorySizeMb}MB`}
		</Typography>
	);
}
