'use client';

import React, { useEffect, useMemo, useState } from 'react';

// motion
import { motion } from 'motion/react';

// Mui
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { GameState } from '@/board';
import { AnalysisState } from '@/api';

const MotionBox = motion(Box);

interface EvalBarProps {
	evaluation?: AnalysisState['currentEvaluation']; // [0, 1] or +-M<number>
	currentPlayer: GameState['currentPlayer'];
	height: React.CSSProperties['height'];
	width: React.CSSProperties['width'];
	direction?: 'horizontal' | 'vertical';
}

// Pure react component with MUI styling
export default function EvalBar({
	evaluation,
	height,
	width,
	currentPlayer,
	direction = 'horizontal',
}: EvalBarProps) {
	const evalNum = useMemo<number>(() => {
		if (evaluation === undefined || evaluation === '') {
			return 0.5;
		}

		let newEval = 0.5;
		if (evaluation.match('M') !== null) {
			if (evaluation.startsWith('oM')) {
				// O is winning
				newEval = 0;
			} else {
				newEval = 1;
			}
		} else if (currentPlayer === 'X') {
			newEval = parseFloat(evaluation);
		} else {
			newEval = 1 - parseFloat(evaluation);
		}
		return newEval;
	}, [evaluation, currentPlayer]);

	return (
		<Box
			sx={{
				alignSelf: 'stretch',
				height,
				width,
				backgroundColor: 'evalbar.o',
				borderRadius: 1,
				borderColor: 'secondary.main',
				// borderWidth: 2,
				// borderStyle: 'solid',
				position: 'relative',
				overflow: 'hidden',
				display: 'flex',
				flexDirection: direction === 'horizontal' ? 'row' : 'column',
			}}
		>
			{/* X on the evalbar (top) */}
			<Box
				sx={{
					position: 'absolute',
					top: 0,
					left: '50%',
					transform: 'translateX(-50%)',
					color: 'evalbar.Xtext',
					fontWeight: 'bold',
					textShadow: '0 2px 4px rgba(0,0,0,0.2)',
					fontSize: '1.6rem',
					zIndex: 1,
				}}
			>
				{'X'}
			</Box>

			{/* O on the eval bar */}
			<Box
				sx={{
					position: 'absolute',
					bottom: 0,
					left: '50%',
					transform: 'translateX(-50%)',
					color: 'evalbar.Otext',
					fontWeight: 'bold',
					textShadow: '0 2px 4px rgba(0,0,0,0.2)',
					fontSize: '1.6rem',
					zIndex: 1,
				}}
			>
				{'O'}
			</Box>

			{/* evaluation on the current side of the bar */}
			<Box
				sx={{
					position: 'absolute',
					...(currentPlayer === 'X'
						? {
								top: '25%',
								left: '50%',
								transform: 'translateX(-50%) translateY(-50%)',
							}
						: {
								bottom: '25%',
								left: '50%',
								transform: 'translateX(-50%) translateY(-50%)',
							}),
					color: 'evalbar.evalText',
					fontWeight: '400',
					fontSize: '1.2rem',
					zIndex: 1,
				}}
			>
				{evaluation}
			</Box>

			{/* Animated eval bar */}
			<MotionBox
				sx={{
					backgroundColor: 'evalbar.x',
				}}
				animate={{
					...(direction === 'horizontal'
						? { width: `${evalNum * 100}%` }
						: { height: `${evalNum * 100}%` }),
				}}
				transition={{
					duration: 0.5,
					ease: 'easeInOut',
				}}
			/>

			{/* <Box
				sx={{
					backgroundColor: 'evalbar.x',
					transition: 'width 0.2s ease-in-out',
					...(direction === 'horizontal'
						? { width: `${evalNum * 100}%`, height: '100%' }
						: { height: `${evalNum * 100}%`, width: '100%' }),
				}}
			/> */}
		</Box>
	);
}
