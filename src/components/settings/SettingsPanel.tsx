'use client';

import React, { useMemo } from 'react';

// motion
import { AnimatePresence, motion } from 'motion/react';

// mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import TextField from '@mui/material/TextField';

// icons
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import UndoIcon from '@mui/icons-material/Undo';
import Restore from '@mui/icons-material/RestartAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// my comps
import { BoardSettings, fromNotation, GameState, toNotation } from '@/board';
import { EngineLimits } from '@/api';
import EngineSettings from './EngineSettings';
import { SettingsPaper } from '../ui/SettingsPaper';
import MsgPopover from '@/components/ui/MsgPopover';

const AnimatedBox = motion.create(Box);

interface SettingsPanelProps {
	gameState: GameState;
	limits: EngineLimits;
	settings: BoardSettings;
	setNewPosition: (gameState: GameState) => void;
	onSettingsChange: (settings: BoardSettings) => void;
	onOpenSettings: () => void;
	onReset: () => void;
	onUndo: () => void;
	loading: boolean;
}

export default function SettingsPanel({
	onOpenSettings,
	settings,
	limits,
	onSettingsChange,
	onReset,
	onUndo,
	loading,
	gameState,
	setNewPosition,
}: SettingsPanelProps) {
	const [positionOpen, setPositionOpen] = React.useState(false);
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [loadedPosition, setLoadedPosition] = React.useState('');
	const [popoverProps, setPopoverProps] = React.useState<{
		msg: string;
		open: boolean;
		anchorEl: HTMLElement | null;
	}>({
		msg: '',
		open: false,
		anchorEl: null,
	});

	const invalidPosition = useMemo((): boolean => {
		if (loadedPosition.length === 0) {
			return false;
		}
		// try to parse the position
		try {
			fromNotation(loadedPosition);
			return false;
		} catch {
			return true;
		}
	}, [loadedPosition]);

	const buttonData = useMemo(
		() => [
			{
				label: 'Set position',
				icon: <EditIcon />,
				onClick: (event: React.MouseEvent<HTMLElement>) => {
					setAnchorEl(event.currentTarget);
					setPopoverProps({
						open: false,
						anchorEl: event.currentTarget,
						msg: '',
					});
					setPositionOpen(true);
				},
			},
			{
				label: 'Copy position',
				icon: <ContentCopyIcon />,
				onClick: (event: React.MouseEvent<HTMLElement>) => {
					navigator.clipboard.writeText(toNotation(gameState));
					setPopoverProps({
						anchorEl: event.currentTarget,
						open: true,
						msg: 'Position copied!',
					});
				},
			},
			{
				label: 'Reset',
				icon: <Restore />,
				onClick: onReset,
			},
			{
				label: 'Undo',
				icon: <UndoIcon />,
				onClick: onUndo,
			},
			{
				label: settings.showAnalysis
					? 'Hide Settings'
					: 'Show Settings',
				icon: <SettingsIcon />,
				onClick: () => {
					if (!loading) {
						onOpenSettings();
					}
				},
			},
		],
		[settings, onOpenSettings, loading, onReset, onUndo, gameState],
	);

	const positionNotation = useMemo(() => toNotation(gameState), [gameState]);

	const handleClose = () => {
		setPositionOpen(false);
		setLoadedPosition('');
	};

	const applyPosition = () => {
		try {
			setNewPosition(fromNotation(loadedPosition));
			setPopoverProps((prev) => ({
				...prev,
				open: true,
				msg: 'Position loaded',
			}));
		} catch {}
	};

	return (
		<SettingsPaper sx={{ minHeight: 0 }}>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'row',
					justifyContent: { xs: 'space-evenly', md: 'flex-start' },
					gap: 3,
				}}
			>
				<MsgPopover
					msg={popoverProps.msg}
					open={popoverProps.open}
					anchorEl={popoverProps.anchorEl}
					onClose={() =>
						setPopoverProps((prev) => ({ ...prev, open: false }))
					}
				/>

				{/* REPLACED manual absolutely-positioned div with Popper */}
				<Popper
					open={positionOpen}
					anchorEl={anchorEl}
					placement="bottom-start"
					sx={{ zIndex: (theme) => theme.zIndex.modal }}
				>
					<ClickAwayListener onClickAway={() => handleClose()}>
						<Paper
							elevation={3}
							sx={{ p: 2, borderRadius: 2, minWidth: 260 }}
						>
							<form
								onSubmit={(e) => {
									e.preventDefault();
									if (!invalidPosition) {
										applyPosition();
										handleClose();
									}
								}}
							>
								<TextField
									autoFocus
									variant="standard"
									label="Position"
									fullWidth
									placeholder={positionNotation}
									value={loadedPosition}
									onChange={(e) =>
										setLoadedPosition(e.target.value)
									}
									error={invalidPosition}
									aria-hidden={!positionOpen}
								/>
							</form>
						</Paper>
					</ClickAwayListener>
				</Popper>

				{/* Use icon buttons if the screen is small */}
				{buttonData.map((button) => (
					<React.Fragment key={button.label}>
						<IconButton
							sx={{
								display: {
									xs: 'flex',
									md: 'none',
								},
							}}
							onClick={button.onClick}
						>
							{button.icon}
						</IconButton>
						<Button
							sx={{
								display: {
									xs: 'none',
									md: 'flex',
								},
							}}
							color="primary"
							variant="outlined"
							startIcon={button.icon}
							onClick={button.onClick}
						>
							{button.label}
						</Button>
					</React.Fragment>
				))}
			</Box>

			<AnimatePresence>
				{settings.showAnalysis && (
					<AnimatedBox
						sx={{ flex: 1 }}
						initial={{ marginTop: 0, height: 0, opacity: 0 }}
						animate={{
							marginTop: '8px',
							height: 'auto',
							opacity: 1,
						}}
						exit={{ marginTop: 0, height: 0, opacity: 0 }}
						transition={{ duration: 0.1 }}
					>
						<Box
							sx={{
								display: 'flex',
								flexDirection: {
									xs: 'column',
									sm: 'column',
									md: 'row',
								},
								gap: 2,
							}}
						>
							<EngineSettings
								show
								settings={settings}
								limits={limits}
								onSettingsChange={onSettingsChange}
								multipv
							/>
						</Box>
					</AnimatedBox>
				)}
			</AnimatePresence>
		</SettingsPaper>
	);
}
