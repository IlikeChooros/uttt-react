'use client';

import React from 'react';

import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';

import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';

const MsgPopover = (props: {
	msg: string;
	open: boolean;
	anchorEl: HTMLElement | null;
	onClose: () => void;
	closeAfter?: number;
	transitionDuration?: number | { enter?: number; exit?: number };
}) => {
	const {
		msg,
		open,
		anchorEl,
		onClose,
		closeAfter = 700,
		transitionDuration = { enter: 300, exit: 150 },
	} = props;

	React.useEffect(() => {
		if (open) {
			const timer = setTimeout(onClose, closeAfter);
			return () => clearTimeout(timer);
		}
	}, [open, onClose, closeAfter]);

	return (
		<Popper
			open={open && Boolean(anchorEl)}
			anchorEl={anchorEl}
			placement="top"
			aria-hidden={!open}
			transition
			modifiers={[
				{ name: 'offset', options: { offset: [0, 8] } }, // Optional: keep in viewport padding
				{
					name: 'preventOverflow',
					options: { padding: 8 },
				},
				{
					name: 'flip',
					options: { fallbackPlacements: ['top', 'bottom'] },
				},
			]}
		>
			{({ TransitionProps }) => (
				<Fade {...TransitionProps} timeout={transitionDuration || 350}>
					<Paper
						elevation={3}
						sx={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							gap: 2,
							padding: 1,
							borderRadius: 2,
						}}
					>
						<Typography sx={{ p: 1 }}>{msg}</Typography>
						<CheckBoxOutlinedIcon color="success" />
					</Paper>
				</Fade>
			)}
		</Popper>
	);
};

export default MsgPopover;
