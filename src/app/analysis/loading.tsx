'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export default function AnalysisLoading() {
	return (
		<Box
			sx={{
				minHeight: '70dvh',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'flex-start',
				py: { xs: 4, md: 6 },
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
						fontSize: { xs: '2rem', md: '2.4rem' },
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
					width={320}
					height={36}
					sx={{ borderRadius: 2 }}
				/>
				<Skeleton
					variant="rounded"
					width={340}
					height={340}
					sx={{ borderRadius: 3 }}
				/>
				<Skeleton
					variant="text"
					width={260}
					height={28}
					sx={{ fontSize: 24 }}
				/>
			</Stack>
		</Box>
	);
}
