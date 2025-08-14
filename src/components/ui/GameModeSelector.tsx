'use client';

import React from 'react';

// nextjs
import Link from 'next/link';

// mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Button, { ButtonProps } from '@mui/material/Button';

// icons
import GroupIcon from '@mui/icons-material/Group';
import AiIcon from '@mui/icons-material/Psychology';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';

export default function GameModeSelector() {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: { xs: 'column', md: 'row' },
				gap: { xs: 3, md: 1 },
				mb: 4,
			}}
		>
			<CardPanel
				title="Play vs AI"
				subtitle={`Challenge our intelligent AI engine. Choose who goes
						first and watch the AI think through each move with
						visual feedback.`}
				features="AI difficulty settings, engine thinking indicators"
				href="/vs-ai"
				icon={<AiIcon color="primary" />}
				actionProps={{ variant: 'contained', startIcon: <AiIcon /> }}
				action_name="Start AI Game"
				recommended
			/>

			<CardPanel
				title="Pass and play"
				subtitle={`Play with a friend on the same device. Take turns making
					moves and see who can master the ultimate tic-tac-toe
					strategy.`}
				features="Turn indicators, game rules"
				href="/local"
				icon={<GroupIcon color="secondary" />}
				action_name="Play local game"
				actionProps={{ startIcon: <GroupIcon /> }}
			/>

			<CardPanel
				title="Analysis"
				subtitle={`Analyze your gameplay and get insights on your moves.`}
				features="High-depth, custom position analysis"
				href="/analysis"
				icon={<AutoGraphIcon color="secondary" />}
				action_name="Analysis"
				actionProps={{ startIcon: <AutoGraphIcon /> }}
			/>
		</Box>
	);
}

interface CardPanelProps {
	href: string;
	icon: React.ReactNode;
	recommended?: boolean;
	title: string;
	subtitle: string;
	features: string;
	action_name: string;
	actionProps?: ButtonProps;
}

const CardPanel: React.FC<CardPanelProps> = function ({
	href,
	icon,
	recommended,
	title,
	subtitle,
	features,
	action_name,
	actionProps,
}: CardPanelProps) {
	return (
		<Card
			sx={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				flex: 1,
				position: 'relative',
				borderRadius: 4,
				bgcolor: 'background.paper',
				border: (theme) => {
					if (!recommended)
						return `1px solid ${theme.palette.divider}`;
					const shade =
						theme.palette.mode === 'light'
							? theme.palette.primary[200] ||
								theme.palette.primary.main
							: theme.palette.primary[700] ||
								theme.palette.primary.main;
					return `1px solid ${shade}`;
				},
				boxShadow: (theme) => (recommended ? theme.shadows[2] : 'none'),
			}}
			elevation={0}
		>
			<CardContent sx={{ p: 3 }}>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 1,
						mb: 2,
					}}
				>
					{icon}
					<Typography variant="h5">{title}</Typography>
				</Box>
				<Typography variant="body2">{subtitle}</Typography>
				<Box sx={{ mt: 2 }}>
					<Typography variant="caption">
						Features: {features}
					</Typography>
				</Box>
			</CardContent>
			<CardActions
				sx={{
					justifyContent: 'center',
					px: 2,
					pb: 2,
					alignContent: 'end',
				}}
			>
				<Button
					component={Link}
					href={href}
					variant="outlined"
					fullWidth
					size="large"
					startIcon={icon}
					sx={{ borderRadius: 4 }}
					{...actionProps}
				>
					{action_name}
				</Button>
			</CardActions>
		</Card>
	);
};
