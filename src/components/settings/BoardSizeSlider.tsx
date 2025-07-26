'use client';

import React from 'react';
import { Box, Slider, Typography } from '@mui/material';

interface BoardSizeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showMarks?: boolean;
}

export default function BoardSizeSlider({
  value,
  onChange,
  min = 24,
  max = 96,
  step = 8,
  label = 'Size',
  showMarks = true
}: BoardSizeSliderProps) {
  return (
    <Box>
      {label && (
        <Typography gutterBottom sx={{ fontSize: '0.8rem' }}>
          {label}: {value}
        </Typography>
      )}
      <Slider
        value={value}
        onChange={(_, value) => onChange(value as number)}
        min={min}
        max={max}
        step={step}
        marks={showMarks ? [
          { value: min, label: 'Small' },
          { value: (min + max) / 2, label: 'Medium' },
          { value: max, label: 'Large' },
        ] : undefined}
        valueLabelDisplay="auto"
        size="small"
      />
    </Box>
  );
}