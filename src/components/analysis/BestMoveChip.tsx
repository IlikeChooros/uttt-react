'use client';

import { EngineMove } from '@/api';

import ChipMD from '../ui/ChipMD';

interface BestMoveChipProps {
	isTopMove?: boolean;
	move: EngineMove;
	onClick?: () => void;
}

export default function BestMoveChip({
	isTopMove,
	move,
	onClick,
}: BestMoveChipProps) {
	return (
		<ChipMD
			onClick={onClick}
			clickable
			label={`${move.boardIndex + 1}${move.cellIndex + 1} (${move.evaluation})`}
			sx={
				isTopMove
					? {
							bgcolor: 'success.light',
							':hover': {
								bgcolor: 'success.main',
							},
						}
					: {
							bgcolor: 'warning.light',
							':hover': {
								bgcolor: 'warning.main',
							},
						}
			}
		/>
	);
}
