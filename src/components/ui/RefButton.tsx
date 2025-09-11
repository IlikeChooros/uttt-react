'use client';

import React from 'react';

import Button, { ButtonProps } from '@mui/material/Button';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface CopyButtonProps {
	children?: React.ReactNode;
	onClick: (event: React.MouseEvent<HTMLElement>) => void;
	asIcon?: boolean;
	buttonProps?: ButtonProps;
	iconButtonProps?: IconButtonProps;
}

// Forward ref to the actual DOM button to use as a stable anchor
const RefButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
	(
		{ children, onClick, asIcon = false, buttonProps, iconButtonProps },
		ref,
	) => {
		if (asIcon) {
			return (
				<IconButton
					{...iconButtonProps}
					onClick={onClick}
					size="small"
					color="primary"
					ref={ref}
				>
					{children || <ContentCopyIcon />}
				</IconButton>
			);
		}
		return (
			<Button
				{...buttonProps}
				variant="outlined"
				onClick={onClick}
				size="small"
				endIcon={<ContentCopyIcon />}
				ref={ref}
			>
				{children}
			</Button>
		);
	},
);
RefButton.displayName = 'RefButton';

export default RefButton;
