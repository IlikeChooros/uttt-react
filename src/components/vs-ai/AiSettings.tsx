'use client';

import { useState } from 'react';

import { motion } from 'motion/react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Collapse from '@mui/material/Collapse';
import Tooltip from '@mui/material/Tooltip';

// icons
// import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// my components
import { BoardSettings } from '@/board';
import { EngineLimits } from '@/api';
import EngineSettings from '../settings/EngineSettings';
import { IconButton } from '@mui/material';

interface AiSettingsProps {
	settings: BoardSettings;
	limits: EngineLimits;
	onSettingsChange: (v: BoardSettings) => void;
	engineTurn?: 'X' | 'O'; // which mark AI plays as
	onEngineTurnChange?: (engineTurn: 'X' | 'O') => void;
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
	engineTurn = 'O',
	onEngineTurnChange,
}: AiSettingsProps) {
	const [selectedDifficulty, setSelectedDifficulty] = useState(
		difficultyLevels[0],
	);
	const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

	const theme = useTheme();

	return (
		<Paper
			sx={{
				p: 2.5,
				mb: 3,
				backgroundColor: alpha(theme.palette.primary.main, 0.04),
				borderRadius: 3,
				width: '100%',
				minHeight: '100px',
			}}
			elevation={0}
		>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					mb: 1.5,
				}}
			>
				<Typography
					variant="subtitle1"
					fontWeight={500}
					sx={{ letterSpacing: 0.5 }}
				>
					Game Setup
				</Typography>
				<Tooltip
					title={
						showAdvancedSettings
							? 'Hide advanced'
							: 'Show advanced settings'
					}
				>
					<IconButton
						size="large"
						onClick={() => setShowAdvancedSettings((p) => !p)}
						sx={{
							transform: showAdvancedSettings
								? 'rotate(180deg)'
								: 'rotate(0deg)',
							transition: 'transform 0.25s',
						}}
						aria-label={
							showAdvancedSettings
								? 'Hide advanced settings'
								: 'Show advanced settings'
						}
					>
						<ExpandMoreIcon fontSize="small" />
					</IconButton>
				</Tooltip>
			</Box>

			{/* Difficulty selection */}
			<Box sx={{ mb: 2 }}>
				<Typography
					variant="caption"
					sx={{
						textTransform: 'uppercase',
						letterSpacing: 0.8,
						fontWeight: 600,
						color: 'text.secondary',
						display: 'block',
						mb: 0.5,
					}}
				>
					Difficulty
				</Typography>
				<ToggleButtonGroup
					exclusive
					size="small"
					fullWidth
					value={selectedDifficulty.label}
					onChange={(_, val) => {
						if (!val) return;
						const level = difficultyLevels.find(
							(l) => l.label === val,
						);
						if (!level) return;
						setSelectedDifficulty(level);
						onSettingsChange({ ...settings, ...level.limits });
					}}
					sx={{
						bgcolor: alpha(theme.palette.primary.main, 0.04),
						borderRadius: 2,
						px: 0.5,
						'& .MuiToggleButtonGroup-grouped': {
							flex: 1,
							border: 'none',
							m: 0.5,
							borderRadius: 1.5,
							textTransform: 'none',
							fontWeight: 500,
						},
						'& .Mui-selected': {
							bgcolor: theme.palette.primary.main + '20',
						},
					}}
				>
					{difficultyLevels.map((level) => (
						<ToggleButton key={level.label} value={level.label}>
							{level.label}
						</ToggleButton>
					))}
				</ToggleButtonGroup>
			</Box>

			{/* Turn selection: choose who starts (X) */}
			<Box sx={{ mb: 1.5 }}>
				<Typography
					variant="caption"
					sx={{
						textTransform: 'uppercase',
						letterSpacing: 0.8,
						fontWeight: 600,
						color: 'text.secondary',
						display: 'block',
						mb: 0.5,
					}}
				>
					First Move
				</Typography>
				<ToggleButtonGroup
					exclusive
					size="small"
					value={engineTurn === 'O' ? 'you' : 'ai'}
					onChange={(_, val) => {
						if (!val) return;
						// if you start, AI is O; if AI starts, AI is X
						if (val === 'you') {
							onEngineTurnChange?.('O');
						} else {
							onEngineTurnChange?.('X');
						}
					}}
					sx={{
						'& .MuiToggleButtonGroup-grouped': {
							flex: 1,
							border: 'none',
							m: 0.5,
							borderRadius: 1.5,
							textTransform: 'none',
							fontWeight: 500,
							display: 'flex',
							gap: 4,
						},
						'& .Mui-selected': {
							bgcolor: theme.palette.secondary.main + '22',
						},
					}}
				>
					<ToggleButton value="you">
						<PersonIcon fontSize="small" />
						&nbsp;You (X)
					</ToggleButton>
					<ToggleButton value="ai">
						<PsychologyIcon fontSize="small" />
						&nbsp;AI (X)
					</ToggleButton>
				</ToggleButtonGroup>
			</Box>

			{/* Advanced settings collapse */}
			<Collapse in={showAdvancedSettings} unmountOnExit>
				<AnimatedBox
					sx={{
						display: 'flex',
						flexDirection: { xs: 'column', md: 'row' },
						gap: { xs: 2, sm: 4 },
						px: 0.5,
						pt: 1,
					}}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
				>
					<EngineSettings
						show
						settings={settings}
						limits={limits}
						onSettingsChange={onSettingsChange}
					/>
				</AnimatedBox>
			</Collapse>
		</Paper>
	);
}
