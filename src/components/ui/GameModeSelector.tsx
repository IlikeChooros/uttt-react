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
// motion
import { motion, Variants } from 'motion/react';

const AnimatedBox = motion.create(Box);

export default function GameModeSelector() {
	const containerVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: { staggerChildren: 0.08 },
		},
	} as const;
	const itemVariants = {
		hidden: { opacity: 0, y: 12 },
		show: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5, ease: 'easeOut' },
		},
	} as const;
	return (
		<Box
			component={motion.div}
			initial="hidden"
			animate="show"
			variants={containerVariants}
			sx={{
				display: 'flex',
				flexDirection: { xs: 'column', md: 'row' },
				gap: { xs: 3, md: 1 },
				mb: 4,
				justifyItems: 'stretch',
				width: '100%',
			}}
		>
			<CardPanel
				variants={itemVariants}
				title="Play vs AI"
				subtitle={`Challenge a strong AI. Choose who starts and watch live engine thinking with instant feedback.`}
				features="Adjustable difficulty, real-time evaluation"
				href="/vs-ai"
				icon={<AiIcon color="primary" />}
				actionProps={{
					variant: 'contained',
					startIcon: <AiIcon />,
				}}
				action_name="Start AI Game"
				recommended
			/>

			<CardPanel
				variants={itemVariants}
				title="Pass and play"
				subtitle={`Play with a friend on this device. Alternate turns and outsmart your opponent.`}
				features="Turn indicators, in-app rules"
				href="/local"
				icon={<GroupIcon color="secondary" />}
				action_name="Play local game"
				actionProps={{ startIcon: <GroupIcon /> }}
			/>

			<CardPanel
				variants={itemVariants}
				title="Analysis"
				subtitle={`Run deep engine analysis on any position and explore the best lines.`}
				features="Depth/threads/multiPV, live best moves"
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
	variants: Variants;
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
	variants,
}: CardPanelProps) {
	return (
		<AnimatedBox
			variants={variants}
			whileHover={{ y: -2 }}
			whileTap={{ scale: 0.98 }}
		>
			<Card
				sx={{
					height: '100%',
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
					boxShadow: (theme) =>
						recommended ? theme.shadows[2] : 'none',
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
		</AnimatedBox>
	);
};
