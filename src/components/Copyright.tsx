import * as React from 'react';
import Typography from '@mui/material/Typography';
import { Link } from '@mui/material';

export default function Copyright() {
	return (
		<Typography
			variant="body2"
			align="center"
			sx={{
				color: 'text.secondary',
			}}
		>
			Made by <strong>IlikeChooros</strong>, source code available on{' '}
			<Link
				href="https://github.com/IlikeChooros/go-uttt/tree/fileserver"
				target="_blank"
				rel="noopener"
				color="info"
			>
				GitHub
			</Link>
			. All rights reserved.
		</Typography>
	);
}
