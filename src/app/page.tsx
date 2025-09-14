import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// import Link from 'next/link';
// import Stack from '@mui/material/Stack';
// import Button from '@mui/material/Button';
// import PlayArrowIcon from '@mui/icons-material/PlayArrow';
// import PsychologyIcon from '@mui/icons-material/Psychology';
// import GroupsIcon from '@mui/icons-material/Groups';

import Copyright from '@/components/Copyright';
import GameModeSelector from '@/components/ui/GameModeSelector';

// Landing / Home page styled to align with the custom 404 page aesthetic
export default function Home() {
	return (
		<Box
			sx={{
				width: '100%',
				minHeight: '100dvh',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				pt: { xxs: 6, md: 8 },
				gap: 5,
				px: 1,
			}}
		>
			{/* Hero Section */}
			<Box sx={{ textAlign: 'center', maxWidth: 760 }}>
				<Typography
					variant="h2"
					component="h1"
					gutterBottom
					sx={{
						fontWeight: 600,
						fontSize: { xxs: '2.4rem', md: '3.35rem' },
						lineHeight: 1.1,
						mb: 2,
					}}
				>
					Ultimate Tic Tac Toe
				</Typography>
				<Typography
					variant="h6"
					color="text.secondary"
					sx={{ fontWeight: 300, mb: 3, mx: 'auto', maxWidth: 640 }}
				>
					A deeper, strategic evolution of the classic game. Claim
					small boards to dominate the macro board. Think ahead,
					redirect your opponent, and outmaneuver layer by layer.
				</Typography>
				{/* <Stack
					direction={{ xxs: 'column', sm: 'row' }}
					spacing={2}
					sx={{ justifyContent: 'center', mb: 1 }}
				>
					<Button
						component={Link}
						href="/vs-ai"
						variant="contained"
						startIcon={<PsychologyIcon />}
						size="large"
						sx={{ borderRadius: 4, minWidth: 190 }}
					>
						Play vs AI
					</Button>
					<Button
						component={Link}
						href="/local"
						variant="outlined"
						startIcon={<GroupsIcon />}
						size="large"
						sx={{ borderRadius: 4, minWidth: 190 }}
					>
						Local Match
					</Button>
					<Button
						component={Link}
						href="/analysis"
						variant="text"
						startIcon={<PlayArrowIcon />}
						size="large"
						sx={{ borderRadius: 4, minWidth: 190 }}
					>
						Open Analyzer
					</Button>
				</Stack>
				 <Typography variant="body2" color="text.secondary">
					Or pick a mode below to jump right in:
				</Typography> */}
			</Box>

			{/* Mode Selector reused for consistency */}
			<Box sx={{ width: '100%', maxWidth: 'lg' }}>
				<GameModeSelector />
			</Box>

			<Copyright />
		</Box>
	);
}
