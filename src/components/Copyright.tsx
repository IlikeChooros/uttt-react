import * as React from 'react';
import Typography from '@mui/material/Typography';
import { Link } from '@mui/material';

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
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 4,
				}}
			>
				<GithubIcon />
				<Link color="inherit" href="https://github.com/IlikeChooros">
					GitHub
				</Link>
			</div>
		</div>
	);
}
