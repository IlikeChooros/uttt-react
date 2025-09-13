// Component for showing current game history (simple version of pgn viewer)
// As a user:
// - I want to see as many as possible moves in the history
// - I want an intuitive way to navigate the history (clicking the moves for example)
// - I want it to look good, pleasing for the eye (matching the overall desing of the Anlaysis page)

// What needs to be changed/added:
// - Add 'traverse' functionality to gameLogic (to go to specific move in history)
// - MoveChip component to show individual moves (with highlighting for current move)
import React from 'react';
import { List, ListImperativeAPI, type RowComponentProps } from 'react-window';

// mui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import ListItem from '@mui/material/ListItem';

import { useMoveIconProps } from '@/components/analysis/icons';

// components
import { GameState, moveNotation, Player } from '@/board';
import { SettingsPaper } from '../ui/SettingsPaper';
import { Skeleton } from '@mui/material';

interface MovePanelProps {
	gameState: GameState;
	avaible?: boolean;
	onMoveClick: (index: number) => void;
}

const MemoPanel = React.memo(MovePanel, (prevProps, nextProps) => {
	return (
		prevProps.gameState.historyIndex === nextProps.gameState.historyIndex &&
		prevProps.gameState.history.length ===
			nextProps.gameState.history.length &&
		prevProps.avaible === nextProps.avaible
	);
});

export default MemoPanel;

function toRowIndex(moveIndex: number, firstTurn?: Player): number {
	if (firstTurn === 'O') {
		return Math.max(0, ~~(moveIndex / 2));
	}
	return Math.max(0, ~~((moveIndex - 1) / 2));
}

function MovePanel({ gameState, onMoveClick, avaible = true }: MovePanelProps) {
	const listRef = React.useRef<ListImperativeAPI>(null);

	React.useEffect(() => {
		if (listRef.current) {
			listRef.current.scrollToRow({
				index: toRowIndex(
					gameState.historyIndex,
					gameState.history[0]?.playerToMove,
				),
			});
		}
	}, [gameState.historyIndex, gameState.history]);

	const itemData: ItemData = React.useMemo(
		() => ({
			history: gameState.history,
			onMoveClick,
			currentMoveIndex: gameState.historyIndex,
		}),
		[gameState.history, gameState.historyIndex, onMoveClick],
	);

	const rowCount = React.useMemo(() => {
		const len =
			gameState.history.length -
			(gameState.history[0]?.playerToMove === 'X' ? 1 : 0);
		return Math.max(1, ~~(len / 2) + (len % 2));
	}, [gameState.history]);

	const iconsProps = useMoveIconProps({
		historyLength: gameState.history.length,
		currentIndex: gameState.historyIndex,
		onMoveClick,
	});

	return avaible ? (
		<SettingsPaper
			sx={{
				mt: { xs: 1, sm: 2 },
				width: '100%',
				minWidth: 260,
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				p: 1,
			}}
		>
			<Box sx={{ my: 2, textAlign: 'center' }}>
				<Typography
					variant="h6"
					color="text.primary"
					sx={{ fontWeight: 400 }}
				>
					History
				</Typography>
			</Box>
			<Stack
				spacing={1}
				direction={'row'}
				justifyContent={'center'}
				sx={{
					mb: 1,
					bgcolor: 'surface.action',
					p: 0.5,
					borderRadius: 2,
				}}
			>
				{iconsProps.map((props, index) => (
					<IconButton key={index} {...props}>
						{props.icon}
					</IconButton>
				))}
			</Stack>
			<Box height={'100%'}>
				<List
					listRef={listRef}
					overscanCount={3}
					rowComponent={Row}
					rowCount={rowCount}
					rowHeight={34}
					rowProps={itemData}
				/>
			</Box>
		</SettingsPaper>
	) : (
		<Skeleton
			variant="rectangular"
			sx={{
				mt: { xs: 1, sm: 2 },
				width: '100%',
				minWidth: 260,
				height: '100%',
				borderRadius: 2,
			}}
		/>
	);
}

interface ItemData {
	history: GameState['history'];
	onMoveClick: (index: number) => void;
	currentMoveIndex: number;
}

function Row({ index, style, ...data }: RowComponentProps<ItemData>) {
	const { history, onMoveClick, currentMoveIndex } = data;

	const moveProps: (MoveComponentProps | null)[] = React.useMemo(() => {
		const offsetList = history[0]?.playerToMove === 'O';
		let startIndex = index * 2 + (offsetList ? 0 : 1);
		const props: (MoveComponentProps | null)[] = [null, null];
		if (index === 0 && offsetList) {
			props[0] = {
				move: '...',
				isCurrent: false,
				turn: undefined,
				onClick: () => onMoveClick(0),
			};
			startIndex = 0;
		} else if (history[startIndex]) {
			props[0] = {
				move: moveNotation(history[startIndex].move),
				turn: history[startIndex].playerToMove,
				isCurrent: currentMoveIndex === startIndex,
				onClick: () => onMoveClick(startIndex),
			};
		}

		if (history.length > startIndex + 1) {
			props[1] = {
				move: moveNotation(history[startIndex + 1].move),
				turn: history[startIndex + 1].playerToMove,
				isCurrent: currentMoveIndex === startIndex + 1,
				onClick: () => onMoveClick(startIndex + 1),
			};
		}

		return props;
	}, [history, index, currentMoveIndex, onMoveClick]);

	return (
		<ListItem
			style={{
				...style,
				display: 'flex',
				gap: 8,
				width: '100%',
			}}
			disablePadding
		>
			<Box sx={{ width: 32, textAlign: 'right', pr: 1 }}>
				<Typography
					variant="body1"
					color="text.secondary"
					sx={{ fontSize: '1.1rem', textAlign: 'right' }}
				>
					{index + 1}.
				</Typography>
			</Box>

			{/* Place the moves evenly */}
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					width: '100%',
					gap: 1,
				}}
			>
				{moveProps.map((props, i) =>
					props ? (
						<MoveComponent key={i} {...props} />
					) : (
						<Box key={i} />
					),
				)}
			</Box>
		</ListItem>
	);
}

interface MoveComponentProps {
	move: string;
	isCurrent: boolean;
	turn: Player | undefined;
	onClick: () => void;
}

function MoveComponent({ move, isCurrent, turn, onClick }: MoveComponentProps) {
	const props = React.useMemo(() => {
		let moveType: 'X-normal' | 'O-normal' | 'X-current' | 'O-current';
		if (turn === 'X') {
			moveType = isCurrent ? 'X-current' : 'X-normal';
		} else if (turn === 'O') {
			moveType = isCurrent ? 'O-current' : 'O-normal';
		} else {
			moveType = 'X-normal';
		}

		const common = {
			text: {
				cursor: 'pointer',
				fontSize: '1.1rem',
				fontWeight: 400,
			},
			box: {
				textAlign: 'center' as const,
				height: '100%',
				mx: 2,
				borderRadius: 2,
				p: 0.25,
			},
		};

		const styles = {
			'X-normal': {
				text: {
					...common.text,
					color: 'primary.main',
					bgcolor: 'transparent',
				},
				box: {
					...common.box,
					bgcolor: 'transparent',
				},
			},
			'O-normal': {
				text: {
					...common.text,
					color: 'secondary.main',
					bgcolor: 'transparent',
				},
				box: {
					...common.box,
					bgcolor: 'transparent',
				},
			},
			'X-current': {
				text: {
					...common.text,
					fontWeight: 600,
					color: 'primary.main',
				},
				box: {
					...common.box,
					bgcolor: 'surface.action',
				},
			},
			'O-current': {
				text: {
					...common.text,
					fontWeight: 600,
					color: 'secondary.main',
				},
				box: {
					...common.box,
					bgcolor: 'surface.action',
				},
			},
		};
		return styles[moveType];
	}, [isCurrent, turn]);

	return (
		<Box sx={{ ...props.box }}>
			<Typography variant="body1" onClick={onClick} sx={props.text}>
				{move}
			</Typography>
		</Box>
	);
}
