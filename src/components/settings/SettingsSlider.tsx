'use client';

import Box, { BoxProps } from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import React, { useMemo } from 'react';

interface SettingsSliderProps {
	value: number;
	onChange: (value: number) => void;
	formatter?: (value: number) => string;
	min: number;
	max: number;
	step: number;
	label?: string;
	description?: string;
	showMarks?: boolean;
	boxProps?: BoxProps;
}

export default function SettingsSlider({
	value,
	onChange,
	formatter,
	boxProps,
	label,
	description,
	min,
	max,
	step,
}: SettingsSliderProps) {
	const valueFormatted = useMemo(() => {
		if (formatter === undefined) {
			return `${value}`;
		}
		return formatter(value);
	}, [formatter, value]);

	return (
		<Box width={'100%'} {...boxProps}>
			<Typography variant="subtitle1">
				{label}: {valueFormatted}
			</Typography>

			{description !== undefined && (
				<Typography variant="body2" color="text.secondary">
					{description}
				</Typography>
			)}

			<Slider
				value={value}
				onChange={(_, value) => onChange(value as number)}
				min={min}
				max={max}
				step={step}
				valueLabelDisplay="auto"
				size="medium"
			/>
		</Box>
	);
}
