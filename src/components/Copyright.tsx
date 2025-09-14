import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

import GithubIcon from '@mui/icons-material/GitHub';

export default function Copyright() {
	return (
		<div
			style={{
				marginTop: 'auto',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'row',
				gap: 8,
				marginBottom: 32,
			}}
		>
			<div>
				<Typography
					variant="body2"
					align="center"
					sx={{
						color: 'text.secondary',
					}}
				>
					Made by <strong>IlikeChooros</strong>, all rights
					reserved.{' '}
				</Typography>
			</div>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: { xxs: 0.5, xs: 1 },
				}}
			>
				<GithubIcon />
				<Link color="inherit" href="https://github.com/IlikeChooros">
					GitHub
				</Link>
			</Box>
		</div>
	);
}
