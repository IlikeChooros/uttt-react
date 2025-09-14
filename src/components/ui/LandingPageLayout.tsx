import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Copyright from '../Copyright';

interface LandingPageLayoutProps {
	children: React.ReactNode;
	title: string;
	description: string;
	gap?: number | string;
}

export default function LandingPageLayout({
	children,
	title,
	description,
	gap = 6,
}: LandingPageLayoutProps) {
	return (
		<Box
			sx={{
				minHeight: '100dvh',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'flex-start',
				pt: { xxs: 1, sm: 2, md: 3, lg: 3, xl: 5 },
				gap: gap,
				px: 1,
			}}
		>
			<Box sx={{ textAlign: 'center', maxWidth: 760 }}>
				<Typography
					variant="h3"
					component="h1"
					gutterBottom
					sx={{
						fontWeight: 600,
						fontSize: {
							xxs: '2rem',
							sm: '2.3rem',
							md: '2.5rem',
							lg: '2.8rem',
						},
						lineHeight: 1.15,
						mb: { xxs: 1, sm: 1.5, md: 2 },
					}}
				>
					{title}
				</Typography>
				<Typography
					variant="h6"
					color="text.secondary"
					sx={{
						fontWeight: 300,
						mx: 'auto',
						maxWidth: 720,
						fontSize: {
							xxs: '1rem',
							sm: '1.15rem',
							md: '1.3rem',
						},
					}}
				>
					{description}
				</Typography>
			</Box>
			{children}
			<Copyright />
		</Box>
	);
}
