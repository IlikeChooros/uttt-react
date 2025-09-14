'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { GameBoardSkeleton } from '@/components/ui/skeletons';

export default function AnalysisLoading() {
	return (
		<Box
			sx={{
				maxWidth: 'xl',
				width: '100%',
				minHeight: '70dvh',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'flex-start',
				py: { xxs: 4, md: 6 },
				px: 2,
				gap: 4,
			}}
		>
			<Box sx={{ textAlign: 'center', maxWidth: 760 }}>
				<Typography
					variant="h4"
					sx={{
						fontWeight: 500,
						mb: 2,
						fontSize: { xxs: '2rem', md: '2.4rem' },
					}}
				>
					Analyzer Loading…
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Preparing board state and engine context.
				</Typography>
			</Box>

			<Stack
				spacing={2}
				sx={{ width: '100%', maxWidth: 840 }}
				alignItems="center"
			>
				<Skeleton
					variant="rounded"
					sx={{
						borderRadius: 2,
						width: {
							xs: '100%',
						},
						height: 64,
					}}
				/>
				<GameBoardSkeleton maxSize={'720px'} />
			</Stack>
		</Box>
	);
}
