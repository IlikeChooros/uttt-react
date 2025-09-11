'use client';

import React from 'react';

import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';

const MsgPopover = (props: {
	msg: string;
	open: boolean;
	anchorEl: HTMLElement | null;
	onClose: () => void;
	closeAfter?: number;
}) => {
	const { msg, open, anchorEl, onClose, closeAfter = 600 } = props;

	React.useEffect(() => {
		if (open) {
			const timer = setTimeout(onClose, closeAfter);
			return () => clearTimeout(timer);
		}
	}, [open, onClose, closeAfter]);

	return (
		<Popover
			open={open && Boolean(anchorEl)}
			anchorEl={anchorEl}
			anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
			transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			transitionDuration={100}
			aria-hidden={!open}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					gap: 4,
					padding: 2,
				}}
			>
				<Typography sx={{ p: 1 }}>{msg}</Typography>
				<CheckBoxOutlinedIcon color="success" />
			</div>
		</Popover>
	);
};

export default MsgPopover;
