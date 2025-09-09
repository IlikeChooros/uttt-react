'use client';

import React, { useMemo } from 'react';

// motion
import { AnimatePresence, motion } from 'motion/react';

// mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

// icons
import EditIcon from '@mui/icons-material/Edit';
import AnalysisIcon from '@mui/icons-material/Psychology';
import UndoIcon from '@mui/icons-material/Undo';
import Restore from '@mui/icons-material/RestartAlt';

// my comps
import { BoardSettings, GameState } from '@/board';
import { EngineLimits } from '@/api';
import EngineSettings from './EngineSettings';

import { SettingsPaper } from '../ui/SettingsPaper';

const AnimatedBox = motion.create(Box);

interface SettingsPanelProps {
	gameState: GameState;
	limits: EngineLimits;
	settings: BoardSettings;
	onSettingsChange: (settings: BoardSettings) => void;
	onOpenSettings: () => void;
	onReset: () => void;
	onUndo: () => void;
	loading: boolean;
}

export default function SettingsPanel({
	onOpenSettings,
	settings,
	limits,
	onSettingsChange,
	onReset,
	onUndo,
	loading,
}: SettingsPanelProps) {
	const buttonData = useMemo(
		() => [
			{
				disabled: true,
				label: 'Set position',
				icon: <EditIcon />,
				onClick: () => {},
			},
			{
				label: 'Reset',
				icon: <Restore />,
				onClick: onReset,
			},
			{
				label: 'Undo',
				icon: <UndoIcon />,
				onClick: onUndo,
			},
			{
				label: settings.showAnalysis
					? 'Hide Settings'
					: 'Show Settings',
				icon: <AnalysisIcon />,
				onClick: () => {
					if (!loading) {
						onOpenSettings();
					}
				},
			},
		],
		[settings, onOpenSettings, loading, onReset, onUndo],
	);

	return (
		<SettingsPaper sx={{ minHeight: 0 }}>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'row',
					justifyContent: { xs: 'space-evenly', sm: 'flex-start' },
					gap: 3,
				}}
			>
				{/* Use icon buttons if the screen is small */}
				{buttonData.map((button) => (
					<React.Fragment key={button.label}>
						<Button
							sx={{
								display: {
									xs: 'none',
									sm: 'flex',
								},
							}}
							disabled={button.disabled}
							color="primary"
							variant="outlined"
							startIcon={button.icon}
							onClick={button.onClick}
						>
							{button.label}
						</Button>
						<IconButton
							sx={{
								display: {
									xs: 'flex',
									sm: 'none',
								},
							}}
							disabled={button.disabled}
							onClick={button.onClick}
						>
							{button.icon}
						</IconButton>
					</React.Fragment>
				))}
			</Box>

			<AnimatePresence>
				{settings.showAnalysis && (
					<AnimatedBox
						sx={{ flex: 1 }}
						initial={{ marginTop: 0, height: 0, opacity: 0 }}
						animate={{
							marginTop: '8px',
							height: 'auto',
							opacity: 1,
						}}
						exit={{ marginTop: 0, height: 0, opacity: 0 }}
						transition={{ duration: 0.1 }}
					>
						<Box
							sx={{
								display: 'flex',
								flexDirection: {
									xs: 'column',
									sm: 'column',
									md: 'row',
								},
								gap: 2,
							}}
						>
							<EngineSettings
								show
								settings={settings}
								limits={limits}
								onSettingsChange={onSettingsChange}
								multipv
							/>
						</Box>
					</AnimatedBox>
				)}
			</AnimatePresence>
		</SettingsPaper>
	);
}
