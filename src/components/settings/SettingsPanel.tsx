'use client';

import React from 'react';
import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Box, 
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useColorScheme,
  CircularProgress
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Tune as TuneIcon,
  Psychology as AnalysisIcon
} from '@mui/icons-material';
import { BoardSettings, BoardSizeOption } from '@/board';
import BoardSizeSlider from '@/components/settings/BoardSizeSlider';
import { EngineLimits } from '@/api';
import EngineSettings from './EngineSettings';

interface SettingsPanelProps {
  limits: EngineLimits
  settings: BoardSettings;
  onSettingsChange: (settings: BoardSettings) => void;
  loading: boolean;
}

export default function SettingsPanel({
  settings,
  limits,
  onSettingsChange,
  loading
}: SettingsPanelProps) {
  const { mode, setMode } = useColorScheme();
  
  const toggleAnalysis = () => {
    if (!loading) {
      onSettingsChange({
        ...settings,
        showAnalysis: !settings.showAnalysis
      });
    }
  };

  return (
    <Accordion sx={{ mb: 3 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TuneIcon />
          <Typography variant="h6">Settings & Analysis</Typography>
          {loading && (
            <CircularProgress size={16} />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography gutterBottom>Board Size</Typography>
            <BoardSizeSlider
              value={settings.boardSize}
              onChange={(size) => onSettingsChange({...settings, boardSize: size as BoardSizeOption})}
            />
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Theme</InputLabel>
              <Select
                value={mode || 'light'}
                onChange={(e) => setMode?.(e.target.value as 'light' | 'dark' | 'system')}
                label="Theme"
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="system">System</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                loading={loading}
                variant={settings.showAnalysis ? "contained" : "outlined"}
                onClick={toggleAnalysis}
                startIcon={<AnalysisIcon />}
                size="small"
              >
                {settings.showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
              </Button>

              <EngineSettings 
                show={settings.showAnalysis} 
                settings={settings} 
                limits={limits} 
                onSettingsChange={onSettingsChange} 
              />
              
            </Box>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}