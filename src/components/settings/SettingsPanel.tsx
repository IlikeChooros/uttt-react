'use client';

import React, { useMemo } from 'react';

// mui
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import AccordionDetails from '@mui/material/AccordionDetails';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

// icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TuneIcon from '@mui/icons-material/Tune';
import AnalysisIcon from '@mui/icons-material/Psychology';

// my comps
import { BoardSettings, GameState, ToNotation } from '@/board';
import { EngineLimits } from '@/api';
import EngineSettings from './EngineSettings';

interface SettingsPanelProps {
	gameState: GameState;
	limits: EngineLimits;
	settings: BoardSettings;
	onSettingsChange: (settings: BoardSettings) => void;
	loading: boolean;
}

export default function SettingsPanel({
	gameState,
	settings,
	limits,
	onSettingsChange,
	loading,
}: SettingsPanelProps) {
	const toggleAnalysis = () => {
		if (!loading) {
			onSettingsChange({
				...settings,
				showAnalysis: !settings.showAnalysis,
			});
		}
	};

	const positionNotation = useMemo(() => {
		return ToNotation(gameState);
	}, [gameState]);

	return (
		<Accordion sx={{ mb: 3, borderRadius: '0px 0px 8px 8px' }}>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<TuneIcon />
					<Typography variant="h6">Settings & Analysis</Typography>
					{loading && <CircularProgress size={16} />}
				</Box>
			</AccordionSummary>
			<AccordionDetails>
				<Box
					sx={{
						display: 'flex',
						flexDirection: { xs: 'column', md: 'row' },
						gap: 3,
					}}
				>
					<Box sx={{ flex: 1 }}>
						{/* TODO: make notation load from this input here */}
						<TextField
							variant="standard"
							fullWidth
							helperText="Position notation"
							value={positionNotation}
							onChange={() => {}}
						/>
					</Box>
					<Box sx={{ flex: 1 }}>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								gap: 2,
							}}
						>
							<Button
								loading={loading}
								variant={
									settings.showAnalysis
										? 'contained'
										: 'outlined'
								}
								onClick={toggleAnalysis}
								startIcon={<AnalysisIcon />}
								size={'small'}
								sx={{
									mt: { sm: 0, md: 2 },
								}}
							>
								{settings.showAnalysis
									? 'Hide Analysis'
									: 'Show Analysis'}
							</Button>

							<EngineSettings
								show={settings.showAnalysis}
								settings={settings}
								limits={limits}
								onSettingsChange={onSettingsChange}
								multipv
							/>
						</Box>
					</Box>
				</Box>
			</AccordionDetails>
		</Accordion>
	);
}
