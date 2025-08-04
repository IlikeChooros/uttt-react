'use client';

import React from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton, Slider } from '@mui/material';
import { BoardSizeOption } from '@/board';

interface BoardSizeSliderProps {
  value: number | BoardSizeOption;
  onChange: (value: number | BoardSizeOption) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showMarks?: boolean;
  isNumeric?: boolean;
}

export default function BoardSizeSlider({
  value,
  onChange,
  min = 1,
  max = 16,
  step = 1,
  label = 'Size',
  // showMarks = true,
  isNumeric = false
}: BoardSizeSliderProps) {
  // For numeric sliders (depth, threads, memory)
  if (isNumeric && typeof value === 'number') {
    return (
      <Box>
        <Typography gutterBottom sx={{ fontSize: '0.8rem' }}>
          {label}: {value}
        </Typography>
        <Slider
          value={value}
          onChange={(_, value) => onChange(value as number)}
          min={min}
          max={max}
          step={step}
          valueLabelDisplay="auto"
          size="small"
        />
      </Box>
    );
  }
  
  // For board size selection
  return (
    <Box>
      <Typography gutterBottom sx={{ fontSize: '0.8rem', mb: 1 }}>
        {label}
      </Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, newValue) => {
          if (newValue !== null) {
            onChange(newValue);
          }
        }}
        fullWidth
        size="small"
      >
        <ToggleButton value="small">Small</ToggleButton>
        <ToggleButton value="normal">Normal</ToggleButton>
        <ToggleButton value="large">Large</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}