'use client';

import React from 'react';

// mui
import Chip from '@mui/material/Chip';

// icons
import PersonIcon from '@mui/icons-material/Person';
import AiIcon from '@mui/icons-material/SmartToy';

interface PlayerChipProps {
	player: 'X' | 'O';
	isCurrent: boolean;
	color?: 'primary' | 'secondary';
	icon?: React.ReactElement;
	label?: string;
}

export function PlayerChip({
	player,
	isCurrent,
	color = 'primary',
	icon = <PersonIcon />,
	label = 'You',
}: PlayerChipProps) {
	return (
		<Chip
			sx={{
				px: { xxs: 1, sm: 2 },
				py: 2,
				borderRadius: 2,
			}}
			icon={icon}
			label={`${label} (${player})`}
			color={color}
			variant={isCurrent ? 'filled' : 'outlined'}
			size="small"
		/>
	);
}

export function AiPlayerChip({ player, isCurrent }: PlayerChipProps) {
	return (
		<PlayerChip
			player={player}
			isCurrent={isCurrent}
			icon={<AiIcon />}
			label="AI"
		/>
	);
}
