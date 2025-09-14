// Bottom navigation for move traversal in analysis mode
// for mobile devices (sm and down)

import React from 'react';

import { motion, AnimatePresence, HTMLMotionProps } from 'motion/react';

import { GameState, HistoryState, moveNotation, Player } from '@/board';

import Box, { BoxProps } from '@mui/material/Box';

import { useMoveIconProps } from '@/components/analysis/icons';
import Paper from '@mui/material/Paper';
import {
	IconButton,
	Skeleton,
	Typography,
	TypographyProps,
} from '@mui/material';

interface MoveBottomNavigationProps {
	gameState: GameState;
	onMoveClick: (index: number) => void;
	available?: boolean;
}

const MemoMoveBottomNavigation = React.memo(
	MoveBottomNavigation,
	(prevProps, nextProps) => {
		return (
			prevProps.gameState.historyIndex ===
				nextProps.gameState.historyIndex &&
			prevProps.gameState.history.length ===
				nextProps.gameState.history.length &&
			prevProps.available === nextProps.available
		);
	},
);

export default MemoMoveBottomNavigation;

export const MoveBottomNavigationHeight = 80;

function MoveBottomNavigation({
	gameState,
	onMoveClick,
	available = true,
}: MoveBottomNavigationProps) {
	console.debug('Render MoveBottomNavigation');

	const directionRef = React.useRef<1 | -1>(1);

	function onClick(index: number) {
		if (index === gameState.historyIndex) return;
		onMoveClick(index);
		if (index > gameState.historyIndex) {
			directionRef.current = 1;
		} else {
			directionRef.current = -1;
		}
	}

	const iconProps = useMoveIconProps({
		historyLength: gameState.history.length,
		currentIndex: gameState.historyIndex,
		onMoveClick: onClick,
	});

	// Show skeleton if not available
	let component: React.ReactNode | undefined = undefined;
	if (available) {
		component = (
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: 'auto 1fr auto',
					alignItems: 'center',
					minHeight: MoveBottomNavigationHeight,
					bgcolor: 'surface.main',
				}}
			>
				<div>
					{iconProps.slice(0, 2).map((props, index) => (
						<IconButton
							key={index}
							{...props}
							sx={{ p: { xxs: '8px', xs: '12px' } }}
						>
							{props.icon}
						</IconButton>
					))}
				</div>

				<MoveCarousel
					directionRef={directionRef}
					historyIndex={gameState.historyIndex}
					history={gameState.history}
					onMoveClick={onClick}
				/>

				<div>
					{iconProps.slice(2).map((props, index) => (
						<IconButton key={index} {...props}>
							{props.icon}
						</IconButton>
					))}
				</div>
			</Box>
		);
	} else {
		component = (
			<Skeleton
				variant="rectangular"
				width="100%"
				height={MoveBottomNavigationHeight}
			/>
		);
	}

	return (
		<Paper
			sx={{
				position: 'fixed',
				bottom: 0,
				left: 0,
				right: 0,
				zIndex: (theme) => theme.zIndex.appBar,
			}}
		>
			{component}
		</Paper>
	);
}

interface MoveCarouselProps {
	historyIndex: number;
	history: HistoryState[];
	onMoveClick: (index: number) => void;
	directionRef: React.RefObject<1 | -1>;
}

interface MoveItemProps {
	move: string;
	number?: number;
	active: boolean;
	turn?: Player;
	animationProps: HTMLMotionProps<'div'>;
	onClick: () => void;
}

const N_MOVES_SHOWN = 3;
const START_OPACITY = 0.6;
const OPACITY_STEP = (1 - START_OPACITY) / Math.floor(N_MOVES_SHOWN / 2);

// Show a carousel of moves (1 to left 1 centered(current one) and 1 to the right)
// Edge cases:
// - historyIndex === 0 -> show only next move (this is the start position)
// - history.length === 1 and currentPlayer === 'O' -> add '...' as first move
// - historyIndex === history.length - 1 -> show only previous move and current move
// else show previous, current and next moves
function MoveCarousel({
	historyIndex,
	history,
	onMoveClick,
	directionRef,
}: MoveCarouselProps) {
	console.log('Rendering MoveCarousel');
	const moves: (MoveItemProps | null)[] = React.useMemo(() => {
		function toMoveItem(
			historyState: HistoryState,
			index: number,
			opacity = 1,
		): MoveItemProps {
			const number =
				historyState.playerToMove === 'X' && index > 0
					? ~~(index / 2) + 1
					: undefined;
			return {
				move: moveNotation(historyState.move),
				number,
				active: index === historyIndex,
				animationProps: {
					initial: {
						opacity: opacity - OPACITY_STEP,
						x: 50 * directionRef.current,
					},
					animate: { opacity: opacity, x: 0 },
					style: { width: '100%', height: '100%' },
					transition: { duration: 0.2 },
				},
				turn: historyState.playerToMove,
				onClick: () => onMoveClick(index),
			};
		}

		const moves: (MoveItemProps | null)[] = new Array<MoveItemProps | null>(
			N_MOVES_SHOWN,
		).fill(null);
		const centerIndex = Math.floor(N_MOVES_SHOWN / 2);
		const startIndex = historyIndex - centerIndex;
		let opacity = START_OPACITY - START_OPACITY; // start from leftmost

		for (
			let hIdx = startIndex, moveIdx = 0;
			hIdx < startIndex + N_MOVES_SHOWN;
			hIdx++, moveIdx++
		) {
			if (moveIdx <= centerIndex) {
				opacity += OPACITY_STEP;
			} else if (moveIdx > centerIndex) {
				opacity -= OPACITY_STEP;
			}

			if (hIdx < 0 || hIdx >= history.length) {
				moves[moveIdx] = null;
				continue;
			}

			moves[moveIdx] = toMoveItem(history[hIdx], hIdx, opacity);
		}

		return moves;
	}, [history, historyIndex, onMoveClick, directionRef]);

	return (
		<Box
			sx={{
				display: 'flex',
				position: 'relative',
				alignItems: 'center',
				justifyContent: 'center',
				width: '100%',
				height: '100%',
				gap: 1,
				p: { xxs: 0, sm: 1 },
			}}
		>
			<AnimatePresence mode="popLayout" initial={false}>
				{/* Carousel effect */}
				{moves.map((move, index) =>
					move ? (
						<MoveComponent
							key={`${move.move}-${index}`}
							{...move}
						/>
					) : (
						<div key={`empty-${index}`} style={{ width: '100%' }} />
					),
				)}
			</AnimatePresence>
		</Box>
	);
}

function MoveComponent({
	animationProps,
	move,
	number,
	turn,
	active,
	onClick,
}: MoveItemProps) {
	console.debug('Rendering MoveComponent', move, active);
	const props: { typo: TypographyProps; box: BoxProps } =
		React.useMemo(() => {
			const typo: TypographyProps = {
				variant: 'body1',
				sx: {
					fontSize: {
						xxs: '0.65rem',
						xs: '0.8rem',
						sm: '1rem',
						md: '1.1rem',
					},
				},
			};
			const box: BoxProps = {
				onClick,
				sx: {
					height: '100%',
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
					px: 0,
					py: 2,
					cursor: 'pointer',
					'&:hover': { backgroundColor: 'action.hover' },
				},
			};

			if (turn === 'X') {
				typo.color = 'primary';
			} else if (turn === 'O') {
				typo.color = 'secondary';
			} else {
				typo.color = 'text.secondary';
			}

			if (active) {
				box.sx = {
					...box.sx,
					px: {
						xxs: 0,
						xs: 0.1,
						sm: 0.5,
					},
				};
				typo.variant = 'h6';
				typo.sx = {
					...typo.sx,
					fontWeight: 'bold',
					fontSize: {
						xxs: '0.9rem',
						xs: '1rem',
						sm: '1.2rem',
						md: '1.4rem',
					},
				};
			}

			return { typo, box };
		}, [turn, active, onClick]);

	return (
		<motion.div {...animationProps}>
			<Box {...props.box}>
				<Typography {...props.typo}>
					{number !== undefined && `${number}. `}
					{move}
				</Typography>
			</Box>
		</motion.div>
	);
}
