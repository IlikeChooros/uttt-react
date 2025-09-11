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
			title="Local Pass & Play"
			description="Preparing local game state…"
			gap={2}
		>
			<SettingsPaper
				sx={{ width: '100%', maxWidth: 820, textAlign: 'center' }}
			>
				<Stack spacing={2} alignItems="center">
					<Skeleton variant="rounded" width={260} height={32} />
					<Skeleton variant="text" width={180} />
					<Box sx={{ display: 'flex', gap: 2 }}>
						<Skeleton variant="rounded" width={110} height={40} />
						<Skeleton variant="rounded" width={110} height={40} />
					</Box>
				</Stack>
			</SettingsPaper>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					width: '100%',
				}}
			>
				<GameBoardSkeleton maxSize={'720px'} />
			</Box>
			<Box sx={{ width: '100%', maxWidth: 840 }}>
				<Skeleton variant="text" width={240} />
				<Skeleton variant="text" width={320} />
				<Skeleton variant="text" width={280} />
			</Box>
			<Typography variant="caption" color="text.secondary">
				Loading…
			</Typography>
		</LandingPageLayout>
	);
}
