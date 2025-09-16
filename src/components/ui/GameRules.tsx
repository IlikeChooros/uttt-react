import React from 'react';

// Motion
import { AnimatePresence, motion } from 'motion/react';

// mui
import IconButton from '@mui/material/IconButton';
import Paper, { PaperProps } from '@mui/material/Paper';
import { SvgIconProps } from '@mui/material/SvgIcon';
import Box from '@mui/material/Box';
import Typography, { TypographyProps } from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import { alpha, useTheme } from '@mui/material/styles';

// icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

const AnimatedBox = motion.create(Box);
const AnimatedPaper = motion.create(Paper);

interface GameRulesProps {
	showAnalysis?: boolean;
	available?: boolean;
	highlighted?: boolean;
}

interface GameRulesInternalProps {
	rules: TypographyProps;
	title: TypographyProps;
	icon: SvgIconProps;
	paper: PaperProps;
}

const boxAnimation = {
	initial: { opacity: 0, y: -10, height: 0 },
	animate: { opacity: 1, y: 0, height: 'auto' },
	exit: { opacity: 0, y: -10, height: 0 },
	transition: { duration: 0.15 },
};

const paperAnimation = {
	initial: { opacity: 0, y: -10, height: 0 },
	animate: { opacity: 1, y: 0, height: 'auto' },
	exit: { opacity: 0, y: -10, height: 0 },
	transition: { duration: 0.1 },
};

const props: GameRulesInternalProps = {
	paper: {
		sx: {
			bgcolor: 'surface.main',
			color: 'text.secondary',
			borderRadius: 2,
			p: { xxs: 0.2, xs: 0.5, sm: 0.5 },
		},
	},
	icon: {
		color: 'inherit',
		sx: { mr: 1, fontSize: { xxs: '1.5rem', md: '1.6rem' } },
	},
	title: {
		variant: 'h5',
		color: 'inherit',
		textAlign: 'center',
		sx: {
			fontWeight: 500,
			fontSize: { xxs: '1rem', md: '1.1rem' },
		},
	},
	rules: {
		variant: 'body2',
		sx: {
			mb: 1,
			fontSize: { xxs: '0.75rem', xs: '0.85rem', md: '0.9rem' },
		},
	},
};

const MemoGameRules = React.memo(GameRules, (prevProps, nextProps) => {
	return (
		prevProps.showAnalysis === nextProps.showAnalysis &&
		prevProps.available === nextProps.available &&
		prevProps.highlighted === nextProps.highlighted
	);
});

export default MemoGameRules;

function GameRules({
	showAnalysis,
	available = true,
	highlighted = true,
}: GameRulesProps) {
	const theme = useTheme();

	// State for expansion
	const [open, setOpen] = React.useState<boolean>(false);

	const titleComponent = (
		<Typography {...props.title}>How to Play</Typography>
	);

	let component: React.ReactNode | undefined = undefined;
	if (!available) {
		component = (
			<Skeleton
				variant="rectangular"
				width="100%"
				height={60}
				sx={{ borderRadius: 2 }}
			/>
		);
	} else {
		component = (
			<AnimatePresence>
				{highlighted && (
					<AnimatedPaper
						{...paperAnimation}
						sx={{ ...props.paper.sx }}
						elevation={0}
					>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								p: { xxs: 1, md: 1 },
							}}
						>
							<div
								style={{
									height: '100%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'row',
									gap: 2,
								}}
							>
								<QuestionMarkIcon {...props.icon} />

								{titleComponent}
							</div>

							<div style={{ flexGrow: 1 }} />

							<IconButton
								onClick={() => setOpen(!open)}
								aria-label={
									open ? 'Collapse rules' : 'Expand rules'
								}
								size="medium"
								sx={{
									ml: 1,
									transform: open
										? 'rotate(180deg)'
										: 'rotate(0deg)',
									transition: 'transform 0.3s',
									bgcolor: alpha(
										theme.palette.primary.main,
										0.15,
									),
									'&:hover': {
										bgcolor: alpha(
											theme.palette.primary.main,
											0.25,
										),
									},
								}}
							>
								<ExpandMoreIcon />
							</IconButton>
						</Box>

						<Box position="relative">
							<AnimatePresence>
								{open && (
									<AnimatedBox
										sx={{
											px: { xxs: 2, md: 3 },
										}}
										{...boxAnimation}
									>
										<Typography {...props.rules}>
											• Win 3 small boards in a row to win
											the game
										</Typography>
										<Typography {...props.rules}>
											• Your move determines which board
											your opponent plays in next
										</Typography>
										<Typography {...props.rules}>
											• If sent to a completed board, you
											can play anywhere
										</Typography>

										{showAnalysis && (
											<>
												<Typography
													{...props.rules}
													sx={{
														mb: 1,
														mt: 2,
														fontWeight: 500,
													}}
												>
													Analysis Features:
												</Typography>
												<Typography {...props.rules}>
													•{' '}
													<span
														style={{
															color: 'var(--mui-palette-success-main)',
														}}
													>
														Green borders
													</span>
													: Best move according to
													engine
												</Typography>
												<Typography {...props.rules}>
													•{' '}
													<span
														style={{
															color: 'var(--mui-palette-warning-main)',
														}}
													>
														Orange borders
													</span>
													: Other good moves
												</Typography>
											</>
										)}
									</AnimatedBox>
								)}
							</AnimatePresence>
						</Box>
					</AnimatedPaper>
				)}
			</AnimatePresence>
		);
	}

	return component;
}
