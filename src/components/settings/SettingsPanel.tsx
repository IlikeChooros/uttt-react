'use client';

import React, { useMemo } from 'react';

// mui
import Paper from '@mui/material/Paper';
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

import { alpha, useTheme } from '@mui/material/styles';

interface SettingsPanelProps {
	gameState: GameState;
	limits: EngineLimits;
	settings: BoardSettings;
	onSettingsChange: (settings: BoardSettings) => void;
	onReset: () => void;
	onUndo: () => void;
	loading: boolean;
}

export default function SettingsPanel({
	gameState,
	settings,
	limits,
	onSettingsChange,
	onReset,
	onUndo,
	loading,
}: SettingsPanelProps) {
	const theme = useTheme();

	const buttonData = useMemo(
		() => [
			{
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
						onSettingsChange({
							...settings,
							showAnalysis: !settings.showAnalysis,
						});
					}
				},
			},
		],
		[settings, onSettingsChange, loading, onReset, onUndo],
	);

	return (
		<Paper
			sx={{
				p: 2,
				mb: 3,
				backgroundColor: alpha(theme.palette.primary.main, 0.05),
				borderRadius: 2,
			}}
			elevation={0}
		>
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
							onClick={button.onClick}
						>
							{button.icon}
						</IconButton>
					</React.Fragment>
				))}
			</Box>

			{settings.showAnalysis && (
				<Box sx={{ flex: 1, py: 2 }}>
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
				</Box>
			)}
		</Paper>
	);
}
