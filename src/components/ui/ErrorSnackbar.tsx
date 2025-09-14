'use client';

import React from 'react';

// mui
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';

// icons
import CloseIcon from '@mui/icons-material/Close';
import { useMediaQuery, useTheme } from '@mui/material';
import { MoveBottomNavigationHeight } from '@/components/analysis/MoveBottomNavigation';

export interface ErrorSnackbarType {
	msg: string;
	brief: string;
}

export interface ErrorSnackbarAction {
	name: string;
	onClick?: () => void;
	onClose: () => void;
}

interface ErrorSnackbarProps {
	errors: Array<ErrorSnackbarType>;
	action: ErrorSnackbarAction | null;
	hasBottomNav?: boolean;
}

const MemoErrorSnackbar = React.memo(ErrorSnackbar, (prevProps, nextProps) => {
	return (
		prevProps.errors.length === nextProps.errors.length &&
		prevProps.errors[0]?.msg === nextProps.errors[0]?.msg &&
		prevProps.errors[0]?.brief === nextProps.errors[0]?.brief &&
		prevProps.action === nextProps.action &&
		prevProps.hasBottomNav === nextProps.hasBottomNav
	);
});

export default MemoErrorSnackbar;

function ErrorSnackbar({ errors, action, hasBottomNav }: ErrorSnackbarProps) {
	console.debug('Render ErrorSnackbar');

	const [open, setOpen] = React.useState<boolean>(false);
	const [message, setMessage] = React.useState<string | undefined>(undefined);
	const theme = useTheme();
	const isXs = useMediaQuery(theme.breakpoints.down('sm'));

	React.useEffect(() => {
		// If there are errors and no message currently showing, show the first error
		if (errors.length && !message) {
			if (isXs) {
				setMessage(errors[0].brief);
			} else {
				setMessage(errors[0].msg);
			}
			setOpen(true);
		}
	}, [errors, message, isXs]);

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
			sx={
				hasBottomNav
					? { bottom: { xxs: MoveBottomNavigationHeight + 8, md: 8 } }
					: undefined
			}
			action={
				<>
					{action?.name && (
						<Button onClick={handleClick}>{action.name}</Button>
					)}

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
