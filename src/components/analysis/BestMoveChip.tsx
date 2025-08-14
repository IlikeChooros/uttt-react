'use client';

import { EngineMove } from '@/api';

import ChipMD from '../ui/ChipMD';

interface BestMoveChipProps {
	isTopMove?: boolean;
	move: EngineMove;
}

export default function BestMoveChip({ isTopMove, move }: BestMoveChipProps) {
	return (
		<ChipMD
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
