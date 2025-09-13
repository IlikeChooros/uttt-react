'use client';

import React from 'react';

import { GameState } from '@/board';
import { exportGameState, exportedGameString } from '@/game';

import RefButton from '@/components/ui/RefButton';

// import ImportIcon from '@mui/icons-material/SaveAlt';
// import InputIcon from '@mui/icons-material/Input';
import ExportIcon from '@mui/icons-material/Output';

interface ExportGameButtonProps {
	gameState: GameState;
	onCopy?: () => void;
	asIcon?: boolean;
	ref?: React.Ref<HTMLButtonElement>;
}

export default function ExportGameButton({
	gameState,
	asIcon,
	onCopy,
	ref,
}: ExportGameButtonProps) {
	const handleExportClick = () => {
		const exported = exportedGameString(
			exportGameState(gameState, {
				includeResult: true,
				includeFields: [],
			}),
		);

		onCopy?.();
		navigator.clipboard.writeText(exported);
	};

	const children = asIcon ? <ExportIcon /> : 'Export';

	return (
		<RefButton
			ref={ref}
			onClick={handleExportClick}
			iconButtonProps={{
				sx: { bgcolor: 'primary.light', p: 1, justifySelf: 'end' },
				'aria-label': 'Export game to clipboard',
			}}
			asIcon={asIcon}
		>
			{children}
		</RefButton>
	);
}
