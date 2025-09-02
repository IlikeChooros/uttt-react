'use client';

import React, { useMemo, memo } from 'react';

// motion
import { motion } from 'motion/react';

// Mui
import Box, { BoxProps } from '@mui/material/Box';
import { AnalysisState } from '@/api';
import { GameState, Player } from '@/board';
import { StatusText } from '@/components/ui/animations';

const MotionBox = motion.create(Box);

interface EvalBarProps {
	abseval?: AnalysisState['absEvaluation'];
	evaluation?: AnalysisState['currentEvaluation']; // [0, 1] or +-M<number>
	currentPlayer: GameState['currentPlayer'];
	thinking?: boolean;
	height: BoxProps['height'];
	width: BoxProps['width'];
	fonts?: { eval: BoxProps['fontSize']; sides: BoxProps['fontSize'] };
	direction?: 'horizontal' | 'vertical';
}

const EvalPercentage = memo(function EvalPercent({
	evalNum,
	direction,
}: {
	evalNum: number;
	direction: EvalBarProps['direction'];
}) {
	return (
		<>
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
		</>
	);
});

// Pure react component with MUI styling
export default function EvalBar({
	abseval,
	evaluation,
	currentPlayer,
	thinking,
	height,
	width,
	fonts = { eval: '1.2rem', sides: '1.6rem' },
	direction = 'horizontal',
}: EvalBarProps) {
	type EvalType = {
		evalNum: number;
		mate: Player;
	};

	const { evalNum, mate } = useMemo<EvalType>(() => {
		if (abseval === undefined || abseval === '') {
			return { evalNum: 0.5, mate: null };
		}

		let newEval = { evalNum: 0, mate: null } as EvalType;
		if (abseval.match('M') !== null) {
			if (abseval.endsWith('oM')) {
				// O is winning
				newEval = { evalNum: 0, mate: 'O' };
			} else {
				newEval = { evalNum: 1, mate: 'X' };
			}
		} else {
			newEval = { evalNum: parseFloat(abseval), mate: null };
		}
		return newEval;
	}, [abseval]);

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
					fontSize: fonts.sides,
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
					fontSize: fonts.sides,
					zIndex: 1,
				}}
			>
				{'O'}
			</Box>

			<Box
				sx={{
					position: 'absolute',
					...((currentPlayer === 'X' || mate === 'X') && mate !== 'O'
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
					fontSize: fonts.eval,
					zIndex: 1,
				}}
			>
				<StatusText
					thinking={thinking}
					readyText={evaluation}
					thinkingText={evaluation}
				/>
			</Box>

			<EvalPercentage evalNum={evalNum} direction={direction} />
		</Box>
	);
}
