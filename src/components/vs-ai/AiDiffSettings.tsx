import React from 'react';
import { BoardSettings } from '@/board';
import { DifficultyType } from '@/components/vs-ai/AiSettings';
import Typography from '@mui/material/Typography';

interface AiDiffSettingsProps {
	difficulty: DifficultyType;
	settings: BoardSettings;
	size?: 'h6' | 'subtitle1' | 'body1' | 'body2' | 'caption'; // mui typography variants
}

export default function AiDiffSettings({
	difficulty,
	settings,
	size = 'subtitle1',
}: AiDiffSettingsProps) {
	return (
		<Typography
			variant={size}
			sx={{ fontWeight: 400 }}
			color="text.secondary"
		>
			{difficulty !== 'custom'
				? `Difficulty: ${difficulty} `
				: `AI Settings: Depth ${settings.engineDepth} • Threads ${settings.nThreads} • Memory ${settings.memorySizeMb}MB`}
		</Typography>
	);
}
