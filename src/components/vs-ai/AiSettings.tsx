'use client';

import { useState } from 'react';

import * as motion from 'motion/react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Button from '@mui/material/Button';

// icons
// import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SettingsIcon from '@mui/icons-material/Settings';

// my components
import { BoardSettings } from '@/board';
import { EngineLimits } from '@/api';
import EngineSettings from '../settings/EngineSettings';
import { IconButton } from '@mui/material';
import { SettingsPaper } from '@/components/ui/SettingsPaper';
import { AnimatePresence } from 'motion/react';
import React from 'react';

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
	settings: BoardSettings;
	limits: EngineLimits;
	onSettingsChange: (v: BoardSettings) => void;
	engineTurn?: 'X' | 'O'; // which mark AI plays as
	minHeight?: number | string;
	onEngineTurnChange?: (engineTurn: 'X' | 'O') => void;
	handleStart: () => void;
	onDifficultyChange: (
		difficulty: 'Easy' | 'Medium' | 'Hard' | 'custom',
	) => void;
}

export default function AiSettings({
	minHeight,
	motion,
	difficultyLevels,
	difficulty,
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
		<SettingsPaper sx={[{ minHeight }]} minHeight={minHeight} {...motion}>
			{/* Difficulty selection */}
			<Box sx={{ mb: 2, textAlign: 'center' }}>
				<Typography
					variant="caption"
					sx={{
						textTransform: 'uppercase',
						letterSpacing: 0.8,
						fontWeight: 600,
						color: 'text.secondary',
						display: 'block',
						fontSize: { xs: '0.8rem', sm: '0.9rem' },
						mb: 1.5,
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
						bgcolor: alpha(theme.palette.secondary.main, 0.04),
						borderRadius: 2,
						px: 0.5,
						'& .MuiToggleButtonGroup-grouped': {
							flex: 1,
							border: 'none',
							m: 0.5,
							borderRadius: 1.5,
							fontWeight: 500,
						},
						// '& .Mui-selected': {
						// 	bgcolor: theme.palette.primary.main + '20',
						// },
					}}
				>
					{difficultyLevels.map(({ label }) => (
						<ToggleButton key={`Toggle-${label}`} value={label}>
							<Typography
								variant="body1"
								sx={{
									textTransform: 'none',
								}}
							>
								{label}
							</Typography>
						</ToggleButton>
					))}
				</ToggleButtonGroup>
			</Box>

			{/* Turn selection: choose who starts (X) */}
			<Box sx={{ mb: 0 }}>
				<Typography
					variant="caption"
					sx={{
						textAlign: { xs: 'center', sm: 'left' },
						textTransform: 'uppercase',
						letterSpacing: 0.8,
						fontWeight: 600,
						color: 'text.secondary',
						display: 'block',
						mb: 1,
						fontSize: '0.8rem',
					}}
				>
					First Move
				</Typography>

				<Box
					sx={{
						display: { xs: 'flex', sm: 'grid' },
						gridTemplateColumns: '1fr auto',
						gap: 2,
						flexDirection: 'column',
					}}
				>
					<ToggleButtonGroup
						exclusive
						fullWidth
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
							justifySelf: 'start',
							maxWidth: { xs: 'unset', sm: 300 },
							// bgcolor: alpha(theme.palette.primary.main, 0.04),
							bgcolor: alpha(theme.palette.primary.main, 0.04),
							borderRadius: 2,
							'& .MuiToggleButtonGroup-grouped': {
								flex: 1,
								border: 'none',
								m: 0.5,
								borderRadius: 1.5,
								textTransform: 'none',
								fontWeight: 500,
							},
							'& .Mui-selected': {
								bgcolor: theme.palette.secondary.main + '20',
							},
						}}
					>
						<ToggleButton value="you" color="primary">
							<PersonIcon fontSize="small" sx={{ ml: 2 }} />
							<Typography
								variant="body1"
								sx={{ mr: 2, textTransform: 'none' }}
							>
								&nbsp;You (X)
							</Typography>
						</ToggleButton>
						<ToggleButton value="ai" color="secondary">
							<PsychologyIcon
								fontSize="small"
								color="secondary"
								sx={{ ml: 2 }}
							/>
							<Typography
								variant="body1"
								sx={{
									mr: 2,
									textTransform: 'none',
									color: 'secondary.main',
								}}
							>
								&nbsp;AI (X)
							</Typography>
						</ToggleButton>
					</ToggleButtonGroup>

					<div
						style={{
							display: 'flex',
							justifyContent: 'end',
							alignItems: 'center',
							gap: 8,
						}}
					>
						<Button
							size="large"
							fullWidth
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
						<IconButton
							size="large"
							color="primary"
							onClick={() => setShowAdvancedSettings((p) => !p)}
							sx={{
								bgcolor: alpha(
									theme.palette.primary.main,
									0.15,
								),
								'&:hover': {
									bgcolor: alpha(
										theme.palette.primary.main,
										0.25,
									),
								},
								transform: showAdvancedSettings
									? 'rotate(180deg)'
									: 'rotate(0deg)',
								transition: 'transform 0.25s',
								justifySelf: 'end',
							}}
							aria-label={
								showAdvancedSettings
									? 'Hide advanced settings'
									: 'Show advanced settings'
							}
						>
							<SettingsIcon fontSize="small" />
						</IconButton>
					</div>
				</Box>
			</Box>

			{/* Advanced settings collapse */}
			<AnimatePresence>
				{showAdvancedSettings && (
					<AnimatedBox
						sx={{
							display: 'flex',
							flexDirection: { xs: 'column', md: 'row' },
							gap: { xs: 2, sm: 4 },
							px: 0.5,
							pt: 1,
						}}
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.1 }}
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
				)}
			</AnimatePresence>
		</SettingsPaper>
	);
}
