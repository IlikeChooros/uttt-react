'use client';

import * as React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import HomeIcon from '@mui/icons-material/Home';
import ReplayIcon from '@mui/icons-material/Replay';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GameModeSelector from '@/components/ui/GameModeSelector';
import Copyright from '@/components/Copyright';

// Custom 404 page styled similarly to landing page
export default function NotFound() {
	return (
		<Box
			sx={{
				width: '100%',
				minHeight: '100dvh',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				py: { xxs: 6, md: 8 },
				gap: 4,
			}}
		>
			<Box sx={{ textAlign: 'center', maxWidth: 720, px: 1 }}>
				<Breadcrumbs
					sx={{
						justifyContent: 'center',
						display: 'inline-flex',
						mb: 2,
					}}
					aria-label="breadcrumb"
				>
					<Link href="/" style={{ textDecoration: 'none' }}>
						Home
					</Link>
					<Typography color="text.secondary">404</Typography>
				</Breadcrumbs>
				<Typography
					variant="h2"
					component="h1"
					gutterBottom
					sx={{
						fontWeight: 600,
						fontSize: { xxs: '2.25rem', md: '3.25rem' },
						lineHeight: 1.1,
					}}
				>
					Page Not Found
				</Typography>
				<Typography
					variant="h6"
					color="text.secondary"
					sx={{ fontWeight: 300, mb: 3 }}
				>
					The square you were aiming for doesn’t exist. The route
					might be outdated, moved, or was never a valid move.
				</Typography>
				<Stack
					direction={{ xxs: 'column', sm: 'row' }}
					spacing={2}
					sx={{ justifyContent: 'center', mb: 4 }}
				>
					<Button
						component={Link}
						href="/"
						variant="contained"
						startIcon={<HomeIcon />}
						size="large"
						sx={{ borderRadius: 4, minWidth: 160 }}
					>
						Home
					</Button>
					<Button
						component={Link}
						href="/vs-ai"
						variant="outlined"
						startIcon={<PsychologyIcon />}
						size="large"
						sx={{ borderRadius: 4, minWidth: 160 }}
					>
						Play vs AI
					</Button>
					<Button
						onClick={() => window.history.back()}
						variant="text"
						startIcon={<ArrowBackIcon />}
						size="large"
						sx={{ borderRadius: 4, minWidth: 160 }}
					>
						Go Back
					</Button>
				</Stack>
				<Typography
					variant="body2"
					color="text.secondary"
					sx={{ mb: 2 }}
				>
					Or start a fresh match below:
				</Typography>
			</Box>

			{/* Reuse existing selector for consistency */}
			<Box sx={{ width: '100%', maxWidth: 'lg' }}>
				<GameModeSelector />
			</Box>

			<Button
				onClick={() => window.location.reload()}
				startIcon={<ReplayIcon />}
				size="small"
				sx={{ mt: -2 }}
			>
				Reload Page
			</Button>

			<Copyright />
		</Box>
	);
}
