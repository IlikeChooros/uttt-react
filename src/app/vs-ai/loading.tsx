'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { SettingsPaper } from '@/components/ui/SettingsPaper';
import { GameBoardSkeleton } from '@/components/ui/skeletons';
import LandingPageLayout from '@/components/ui/LandingPageLayout';

export default function Loading() {
	return (
		<LandingPageLayout
			title="Play vs AI"
			description="Initializing engine and board…"
		>
			<Box sx={{ width: '100%', maxWidth: 900 }}>
				<SettingsPaper sx={{ mb: 3 }}>
					<Stack spacing={2}>
						<Skeleton variant="text" width={220} />
						<Skeleton
							variant="rounded"
							width={'100%'}
							height={48}
						/>
						<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
							<Skeleton
								variant="rounded"
								width={100}
								height={36}
							/>
							<Skeleton
								variant="rounded"
								width={100}
								height={36}
							/>
							<Skeleton
								variant="rounded"
								width={100}
								height={36}
							/>
						</Box>
						<Skeleton variant="text" width={160} />
					</Stack>
				</SettingsPaper>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						width: '100%',
					}}
				>
					<GameBoardSkeleton maxSize={'700px'} />
				</Box>
				<Box sx={{ mt: 4 }}>
					<Skeleton variant="text" width={260} />
					<Skeleton variant="text" width={300} />
				</Box>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ mt: 3, display: 'block', textAlign: 'center' }}
				>
					Setting up AI…
				</Typography>
			</Box>
		</LandingPageLayout>
	);
}
