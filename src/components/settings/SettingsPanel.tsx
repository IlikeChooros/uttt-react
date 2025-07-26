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
  useColorScheme
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Tune as TuneIcon,
  Psychology as AnalysisIcon
} from '@mui/icons-material';
import { BoardSettings } from '@/board';
import BoardSizeSlider from '@/components/settings/BoardSizeSlider';
import { EngineLimits } from '@/api';

interface SettingsPanelProps {
  limits?: EngineLimits
  settings: BoardSettings;
  onSettingsChange: (settings: BoardSettings) => void;
}

export default function SettingsPanel({
  settings,
  limits,
  onSettingsChange
}: SettingsPanelProps) {
  const { mode, setMode } = useColorScheme();
  
  const handleSizeChange = (size: number) => {
    onSettingsChange({
      ...settings,
      size
    });
  };
  
  const toggleAnalysis = () => {
    onSettingsChange({
      ...settings,
      showAnalysis: !settings.showAnalysis
    });
  };
  
  const handleDepthChange = (depth: number) => {
    onSettingsChange({
      ...settings,
      engineDepth: depth
    });
  };

  return (
    <Accordion sx={{ mb: 3 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TuneIcon />
          <Typography variant="h6">Settings & Analysis</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography gutterBottom>Board Size</Typography>
            <BoardSizeSlider
              value={settings.size}
              onChange={handleSizeChange}
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
                variant={settings.showAnalysis ? "contained" : "outlined"}
                onClick={toggleAnalysis}
                startIcon={<AnalysisIcon />}
                size="small"
              >
                {settings.showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
              </Button>
              
              {settings.showAnalysis && (
                <BoardSizeSlider
                  value={settings.engineDepth}
                  onChange={handleDepthChange}
                  min={1}
                  max={limits?.depth || 10}
                  step={1}
                  label="Engine Depth"
                  showMarks={false}
                />
              )}
              {settings.showAnalysis && (
                <BoardSizeSlider
                  value={settings.nThreads}
                  onChange={(v) => onSettingsChange({...settings, nThreads: v})}
                  min={1}
                  max={limits?.threads || 4}
                  step={1}
                  label='Threads'
                  showMarks={false}
                />
              )}
              {settings.showAnalysis && (
                <BoardSizeSlider
                  value={settings.memorySizeMb}
                  onChange={(v) => onSettingsChange({...settings, memorySizeMb: v})}
                  min={1}
                  max={limits?.mbsize || 16}
                  step={1}
                  label='Memory'
                  showMarks={false}
                />
              )}
            </Box>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}