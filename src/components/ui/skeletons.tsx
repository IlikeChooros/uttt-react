'use client';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

export function SettingsSkeleton() {
	return (
		<Skeleton
			variant="rectangular"
			width="100%"
			height={118}
			sx={{ borderRadius: 1 }}
		/>
	);
}

export function AnalysisSkeleton() {
	return (
		<Skeleton
			variant="rectangular"
			width="100%"
			height={300}
			sx={{ borderRadius: 1 }}
		/>
	);
}

export function GameBoardSkeleton({ maxSize }: { maxSize: number | string }) {
	return (
		<Box
			sx={{
				width: '100%',
				maxWidth: maxSize,
			}}
		>
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr 1fr',
					gap: {
						xxs: 1,
						sm: 1.5,
						md: 2,
						lg: 2.5,
					},
					width: '100%',
					height: 'fit-content',
					mx: 'auto',
				}}
			>
				{Array.from({ length: 9 }).map((_, index) => (
					<Skeleton
						key={index}
						variant="rectangular"
						sx={{
							p: { xxs: 0.75, md: 1.25 },
							borderRadius: {
								xxs: 1.25,
								sm: 2,
							},
							height: '100%',
							aspectRatio: '1 / 1',
							maxHeight: '250px',
						}}
					/>
				))}
			</Box>
		</Box>
	);
}
