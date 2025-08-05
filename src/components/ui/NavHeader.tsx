'use client';

import React, { useState } from 'react';

// nextjs
import Link from 'next/link';

// mui components
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Drawer from '@mui/material/Drawer';

// theme
import theme from '@/theme';
import { useColorScheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// icons
import Menu from '@mui/icons-material/Menu';
import BlurOn from '@mui/icons-material/BlurOn';
import Group from '@mui/icons-material/Group';
import Home from '@mui/icons-material/Home';
import Psychology from '@mui/icons-material/Psychology';
import LightModeIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/Brightness3';

type NavData = Array<{ href: string; name: string; icon: React.ReactElement }>;

interface DrawerListProps {
	onClick: () => void;
}

const navData: NavData = [
	{ href: '/', name: 'Home', icon: <Home /> },
	{ href: '/vs-ai', name: 'VS AI', icon: <Psychology /> },
	{ href: '/local', name: 'Local', icon: <Group /> },
];

const DrawerList = function ({ onClick }: DrawerListProps): React.JSX.Element {
	return (
		<Box sx={{ bgcolor: 'background.paper', width: 260, height: '100%' }}>
			<List sx={{ width: '100%' }}>
				{navData.map((v) => (
					<ListItemButton
						LinkComponent={Link}
						href={v.href}
						onClick={onClick}
						key={v.href}
					>
						<ListItemIcon>{v.icon}</ListItemIcon>
						<ListItemText>{v.name}</ListItemText>
					</ListItemButton>
				))}
			</List>
		</Box>
	);
};

export default function NavHeader() {
	const [drawerOpened, setOpenDrawer] = useState<boolean>(false);
	const m = useColorScheme();
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

	return (
		<Box display={'flex'}>
			<AppBar
				position="static"
				color="default"
				elevation={1}
				sx={{ zIndex: theme.zIndex.drawer + 1 }}
			>
				<Toolbar>
					{/* Only visible if the screen is small enough */}
					<Box
						sx={{
							display: { xs: 'flex', sm: 'none' },
							flexGrow: 1,
						}}
					>
						<IconButton
							onClick={() => setOpenDrawer((prev) => !prev)}
						>
							<Menu />
						</IconButton>
					</Box>

					{/* Always on */}
					<BlurOn sx={{ fontSize: '2rem', display: 'flex' }} />
					<Typography
						variant="h6"
						component="a"
						sx={{
							display: 'flex',
							fontWeight: 600,
							fontFamily: 'monospace',
							letterSpacing: '0.2rem',
							flexGrow: { xs: 1, sm: 0 },
							py: 2,
							px: { xs: 1, sm: 2 },
						}}
					>
						UTTT
					</Typography>

					{/* If the window is too small, these components disappear */}
					<Box
						sx={{
							display: { xs: 'none', sm: 'flex' },
							justifyContent: 'right',
							flexGrow: 1,
							gap: 1,
						}}
					>
						{navData.map(({ href, name, icon }, index) => {
							return (
								<Button
									key={`${href}-${index}`}
									component={Link}
									href={href}
									startIcon={icon}
									variant={'text'}
									sx={{
										textTransform: 'none',
										borderRadius: 2,
										color: 'text.secondary',
									}}
								>
									{name}
								</Button>
							);
						})}
					</Box>
					<Box sx={{ display: 'flex', justifyContent: 'right' }}>
						{/* Switch back to light mode */}
						{(m.mode === 'dark' ||
							(prefersDarkMode && m.mode === 'system')) && (
							<IconButton onClick={() => m.setMode?.('light')}>
								<LightModeIcon />
							</IconButton>
						)}

						{/* Switch back to dark mode */}
						{(m.mode === 'light' ||
							(!prefersDarkMode && m.mode === 'system')) && (
							<IconButton onClick={() => m.setMode?.('dark')}>
								<DarkModeIcon />
							</IconButton>
						)}
					</Box>
				</Toolbar>
			</AppBar>

			{/* The drawer only used on mobile / small windows */}
			<Drawer
				variant="temporary"
				open={drawerOpened}
				anchor="left"
				onClose={() => setOpenDrawer(false)}
				sx={{
					flexShrink: 0,
				}}
			>
				<Toolbar />
				<DrawerList onClick={() => setOpenDrawer(false)} />
			</Drawer>
		</Box>
	);
}
