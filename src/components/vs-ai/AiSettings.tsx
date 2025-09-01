'use client';

import { useState } from 'react';

import { motion, AnimatePresence } from 'motion/react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';

// icons
import SettingsIcon from '@mui/icons-material/Settings';
import ChildCareIcon from '@mui/icons-material/ChildCare';

// my components
import { BoardSettings } from '@/board';
import { EngineLimits } from '@/api';
import EngineSettings from '../settings/EngineSettings';
import { Button, IconButton } from '@mui/material';

interface AiSettingsProps {
	settings: BoardSettings;
	limits: EngineLimits;
	onSettingsChange: (v: BoardSettings) => void;
}

const difficultyLevels = [
	{
		label: 'Easy',
		limits: {
			engineDepth: 1,
			nThreads: 1,
			memorySizeMb: 4,
			multiPv: 1,
		},
	},
	{
		label: 'Medium',
		limits: {
			engineDepth: 4,
			nThreads: 2,
			memorySizeMb: 8,
			multiPv: 1,
		},
	},
	{
		label: 'Hard',
		limits: {
			engineDepth: 6,
			nThreads: 3,
			memorySizeMb: 16,
			multiPv: 1,
		},
	},
];

const AnimatedBox = motion.create(Box);

export default function AiSettings({
	settings,
	limits,
	onSettingsChange,
}: AiSettingsProps) {
	const [selectedDifficulty, setSelectedDifficulty] = useState(
		difficultyLevels[0],
	);
	const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

	const theme = useTheme();

	return (
		<Paper
			sx={{
				p: 2,
				mb: 3,
				backgroundColor: alpha(theme.palette.primary.main, 0.05),
				borderRadius: 2,
				width: '100%',
			}}
			elevation={0}
		>
			<Typography
				variant="h6"
				fontWeight={'400'}
				gutterBottom
				sx={{
					textAlign: 'center',
				}}
			>
				Difficulty Settings
			</Typography>

			<Box
				sx={{
					display: 'flex',
					flexDirection: {
						xs: 'column',
						sm: 'row',
					},
					justifyContent: 'center',
					width: '100%',
					gap: 2,
				}}
			>
				{difficultyLevels.map((level) => (
					<Button
						key={`diff-setting-${level.label}`}
						variant={
							selectedDifficulty.label === level.label
								? 'contained'
								: 'outlined'
						}
						onClick={() => {
							setSelectedDifficulty(level);
							// update settings
							onSettingsChange({
								...settings,
								...level.limits,
							});
						}}
					>
						{level.label}
					</Button>
				))}

				<Button
					variant="outlined"
					onClick={() => setShowAdvancedSettings((prev) => !prev)}
				>
					{showAdvancedSettings ? 'Hide' : 'Show'} Advanced Settings
				</Button>
			</Box>

			<AnimatePresence>
				{showAdvancedSettings && (
					<AnimatedBox
						sx={{
							display: 'flex',
							flexDirection: { xs: 'column', md: 'row' },
							gap: { xs: 2, sm: 4 },
							px: 2,
						}}
						initial={{ marginTop: 0, height: 0, opacity: 0 }}
						animate={{
							marginTop: '8px',
							height: 'auto',
							opacity: 1,
						}}
						exit={{ marginTop: 0, height: 0, opacity: 0 }}
						transition={{ duration: 0.1 }}
					>
						<EngineSettings
							show
							settings={settings}
							limits={limits}
							onSettingsChange={onSettingsChange}
						/>
					</AnimatedBox>
				)}
			</AnimatePresence>

			{/* {showAdvancedSettings && (
				<Box
					sx={{
						mt: 2,
						display: 'flex',
						flexDirection: { xs: 'column', md: 'row' },
						gap: { xs: 2, sm: 4 },
						px: 2,
					}}
				>
					<EngineSettings
						show
						settings={settings}
						limits={limits}
						onSettingsChange={onSettingsChange}
					/>
				</Box>
			)} */}
		</Paper>
	);
}
