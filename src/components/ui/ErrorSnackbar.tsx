'use client';

import React from 'react';

// mui
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';

// icons
import CloseIcon from '@mui/icons-material/Close';

interface SnackbarErrorType {
	msg: string;
}

export interface ErrorSnackbarAction {
	name: string;
	onClick?: () => void;
	onClose: () => void;
}

interface ErrorSnackbarProps {
	errors: Array<SnackbarErrorType>;
	action: ErrorSnackbarAction | null;
}

export default function ErrorSnackbar({ errors, action }: ErrorSnackbarProps) {
	const [open, setOpen] = React.useState<boolean>(false);
	const [message, setMessage] = React.useState<string | undefined>(undefined);

	React.useEffect(() => {
		// If there are errors and no message currently showing, show the first error
		if (errors.length && !message) {
			console.log('setting message to', errors[0].msg);
			setMessage(errors[0].msg);
			setOpen(true);
		}
	}, [errors, message]);

	const handleClick = () => {
		setOpen(false);
		action?.onClick?.();
		action?.onClose?.();
	};

	const handleClose = (
		event: React.SyntheticEvent | Event,
		reason?: SnackbarCloseReason,
	) => {
		if (reason === 'clickaway') {
			return;
		}

		setOpen(false);
		action?.onClose?.();
	};

	const handleExited = () => {
		setMessage(undefined);
	};

	return (
		<Snackbar
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			open={open}
			onClose={handleClose}
			slotProps={{ transition: { onExited: handleExited } }}
			message={message}
			action={
				<>
					<Button onClick={handleClick}>{action?.name}</Button>

					<IconButton
						aria-label="close"
						color="inherit"
						onClick={handleClose}
					>
						<CloseIcon />
					</IconButton>
				</>
			}
		/>
	);
}
