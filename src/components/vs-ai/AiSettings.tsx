'use client';

import { useState } from 'react';

import * as motion from 'motion/react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Collapse from '@mui/material/Collapse';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';

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
import { SettingsPaper } from '@/components/ui/SettingsPaper';

const AnimatedBox = motion.motion.create(Box);
export type DifficultyType = 'Easy' | 'Medium' | 'Hard' | 'custom';
export type DifficultyLimits = {
	engineDepth: number;
	nThreads: number;
	memorySizeMb: number;
	multiPv: number;
};
export type DifficultyLevelsType = Array<{
	label: DifficultyType;
	limits: DifficultyLimits;
}>;

interface AiSettingsProps {
	motion?: motion.HTMLMotionProps<'div'>;
	difficultyLevels: DifficultyLevelsType;
	difficulty: DifficultyType;
	title: string;
	settings: BoardSettings;
	limits: EngineLimits;
	onSettingsChange: (v: BoardSettings) => void;
	engineTurn?: 'X' | 'O'; // which mark AI plays as
	onEngineTurnChange?: (engineTurn: 'X' | 'O') => void;
	handleStart: () => void;
	onDifficultyChange: (
		difficulty: 'Easy' | 'Medium' | 'Hard' | 'custom',
	) => void;
}

export default function AiSettings({
	motion,
	difficultyLevels,
	difficulty,
	title,
	settings,
	limits,
	onSettingsChange,
	engineTurn = 'O',
	onEngineTurnChange,
	handleStart,
	onDifficultyChange,
}: AiSettingsProps) {
	const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

	const theme = useTheme();

	return (
		<SettingsPaper {...motion}>
			<Typography textAlign={'center'} variant="h4" fontSize={'2rem'}>
				{title}
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
						position: 'absolute',
						top: '12px',
						right: '12px',
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
					value={difficulty}
					onChange={(_, val) => {
						if (!val) return;
						const level = difficultyLevels.find(
							(l) => l.label === val,
						);
						if (!level) return;
						onDifficultyChange(level.label);
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
			<Box sx={{ mb: 0 }}>
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

				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
					}}
				>
					<ToggleButtonGroup
						exclusive
						color="primary"
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
							fontWeight: 400,
						}}
					>
						<ToggleButton value="you" color="secondary">
							<PersonIcon fontSize="small" sx={{ ml: 2 }} />
							<Typography
								variant="body1"
								sx={{ mr: 2, textTransform: 'none' }}
							>
								&nbsp;You (X)
							</Typography>
						</ToggleButton>
						<ToggleButton value="ai" color="secondary">
							<PsychologyIcon fontSize="small" sx={{ ml: 2 }} />
							<Typography
								variant="body1"
								sx={{ mr: 2, textTransform: 'none' }}
							>
								&nbsp;AI (X)
							</Typography>
						</ToggleButton>
					</ToggleButtonGroup>

					<div style={{ flexGrow: 1 }} />

					<Button
						variant="contained"
						sx={{
							borderRadius: 2,
							textTransform: 'none',
							fontWeight: 600,
						}}
						onClick={handleStart}
					>
						Start Game
					</Button>
				</div>
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
						onSettingsChange={(v) => {
							onSettingsChange(v);
							onDifficultyChange('custom');
						}}
					/>
				</AnimatedBox>
			</Collapse>
		</SettingsPaper>
	);
}
