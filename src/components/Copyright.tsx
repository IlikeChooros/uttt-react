import * as React from 'react';
import Typography from '@mui/material/Typography';

export default function Copyright() {
	return (
		<Typography
			variant="body2"
			align="center"
			sx={{
				color: 'text.secondary',
			}}
		>
			{'Copyright © Ultimate Tic Tac Toe'} {new Date().getFullYear()}.
		</Typography>
	);
}
