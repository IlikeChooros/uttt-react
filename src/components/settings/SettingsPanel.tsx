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
import ExportIcon from '@mui/icons-material/Output';
import CheckIcon from '@mui/icons-material/Check';

// my comps
import { BoardSettings, fromNotation, GameState, toNotation } from '@/board';
import { EngineLimits } from '@/api';
import EngineSettings from './EngineSettings';
import { SettingsPaper } from '../ui/SettingsPaper';
import MsgPopover from '@/components/ui/MsgPopover';
import {
	exportedGameString,
	ExportField,
	exportGameState,
	importGameState,
	parseExportedGame,
} from '@/game';

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
	onError: () => void;
	loading: boolean;
}

const includeFields: ExportField[] = [['Event', 'Analysis']];

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
	onError,
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
	const [importedGame, setImportedGame] = React.useState<string>('');

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

	const invalidImport = useMemo((): boolean => {
		if (!importedGame) {
			return false;
		}
		// try to parse the position
		try {
			const parsed = parseExportedGame(importedGame);
			importGameState(parsed);
			return false;
		} catch {
			return true;
		}
	}, [importedGame]);

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
				label: 'Export game',
				icon: <ExportIcon />,
				onClick: (event: React.MouseEvent<HTMLElement>) => {
					const exported = exportedGameString(
						exportGameState(gameState, {
							includeResult: true,
							includeFields: includeFields,
						}),
					);
					navigator.clipboard.writeText(exported);
					setPopoverProps({
						anchorEl: event.currentTarget,
						open: true,
						msg: 'Game exported!',
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
				label: settings.showAnalysis ? 'Hide' : 'Settings',
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
	const gameExport = useMemo(
		() =>
			exportedGameString(
				exportGameState(gameState, {
					includeResult: true,
					includeFields: includeFields,
				}),
			),
		[gameState],
	);

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
			setLoadedPosition('');
			setImportedGame('');
			setPositionOpen(false);
		} catch {}
	};

	const loadImport = () => {
		try {
			const parsed = parseExportedGame(importedGame);
			const imported = importGameState(parsed);
			setNewPosition(imported);
			setPopoverProps((prev) => ({
				...prev,
				open: true,
				msg: 'Game imported',
			}));
			setLoadedPosition('');
			setImportedGame('');
			setPositionOpen(false);
		} catch {
			onError?.();
		}
	};

	return (
		<SettingsPaper sx={{ minHeight: 0, bgcolor: 'surface.subtle' }}>
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
							sx={{
								p: 2,
								borderRadius: 2,
								minWidth: 260,
								width: 'fit-content',
							}}
						>
							<form
								onSubmit={(e) => {
									e.preventDefault();
									const data = new FormData(e.currentTarget);
									const position = data.get(
										'position',
									) as string;
									const game = data.get(
										'import-game',
									) as string;

									if (position && !invalidPosition) {
										setLoadedPosition(position);
										applyPosition();
									} else if (game && !invalidImport) {
										loadImport();
									}
								}}
							>
								<TextField
									autoFocus
									variant="outlined"
									label="Set position"
									name="position"
									fullWidth
									placeholder={positionNotation}
									value={loadedPosition}
									onChange={(e) =>
										setLoadedPosition(e.target.value)
									}
									error={invalidPosition}
									aria-hidden={!positionOpen}
								/>

								<TextField
									name="import-game"
									variant="outlined"
									fullWidth
									multiline
									minRows={3}
									maxRows={10}
									sx={{ mt: 2 }}
									value={importedGame}
									onChange={(e) =>
										setImportedGame(e.target.value)
									}
									placeholder={gameExport}
									error={invalidImport}
									label="Import game"
								/>

								<Box
									sx={{
										display: 'flex',
										justifyContent: 'flex-end',
									}}
								>
									<Button
										sx={{ mt: 2 }}
										type="submit"
										variant="contained"
										color="primary"
										startIcon={<CheckIcon />}
									>
										Import
									</Button>

									<Button
										sx={{ mt: 2, ml: 1 }}
										variant="outlined"
										color="secondary"
										onClick={() => handleClose()}
									>
										Cancel
									</Button>
								</Box>
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
