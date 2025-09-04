'use client';

import React from 'react';
import { motion } from 'motion/react';
import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';

const MotionBox = motion.create(Box);

const baseSx: SxProps<Theme> = {
	p: 2.5,
	mb: 2,
	bgcolor: 'surface.main', // palette lookup; updates with mode
	borderRadius: 2,
	boxShadow: 0,
	width: '100%',
	minHeight: 100,
	position: 'relative',
};

export interface SettingsPaperProps
	extends React.ComponentProps<typeof MotionBox> {
	sx?: SxProps<Theme>;
}

export const SettingsPaper = React.forwardRef<
	HTMLDivElement,
	SettingsPaperProps
>(function SettingsPaper({ sx, ...rest }, ref) {
	return (
		<MotionBox
			ref={ref}
			// Combine base + user sx (array form lets MUI merge them)
			sx={[baseSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
			{...rest}
		/>
	);
});
