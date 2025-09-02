'use client';
// Using Material Design 3 (Material You) color schemes via MUI's CSS Variables theme support in MUI v7.
import { extendTheme, Theme } from '@mui/material/styles';

// Palette augmentation for custom MD3 keys (tertiary, surface, outline)
declare module '@mui/material/styles' {
	interface Palette {
		tertiary: Palette['primary'];
		evalbar: {
			x: string;
			o: string;
			Otext: string;
			Xtext: string;
			evalText: string;
		};
		surface: { main: string };
		outline: { main: string };
	}
	interface PaletteOptions {
		tertiary?: PaletteOptions['primary'];
		evalbar?: {
			x: string;
			o: string;
			Otext: string;
			Xtext: string;
			evalText: string;
		};
		surface?: { main: string };
		outline?: { main: string };
	}
}
import { Roboto } from 'next/font/google';

const roboto = Roboto({
	weight: ['300', '400', '500', '700'],
	subsets: ['latin'],
	display: 'swap',
});

const theme = extendTheme({
	colorSchemeSelector: 'class',

	// Enable both light & dark and generate CSS vars; 'class' lets you toggle via adding `class="mui-light"` or `mui-dark` on <html>.
	colorSchemes: {
		light: {
			palette: {
				// Material Design 3 baseline (example set). Adjust if you generate a custom scheme.
				primary: {
					50: '#F6EDFF', // tone 95
					100: '#EADDFF', // tone 90
					200: '#D0BCFF', // tone 80
					300: '#B69DF8', // tone 70
					400: '#9A82DB', // tone 60
					500: '#7F67BE', // tone 50
					600: '#6750A4', // tone 40 (main)
					700: '#4F378B', // tone 30
					800: '#381E72', // tone 20
					900: '#21005D', // tone 10
					main: '#6750A4', // Primary 40
					light: '#EADDFF', // Primary 90 (container)
					dark: '#4F378B', // Primary 30
					contrastText: '#FFFFFF',
				},
				secondary: {
					50: '#F6EDFF',
					100: '#E8DEF8',
					200: '#CCC2DC',
					300: '#B0A7C0',
					400: '#958DA5',
					500: '#7A7289',
					600: '#625B71',
					700: '#4A4458',
					800: '#332D41',
					900: '#1D192B',
					main: '#625B71',
					light: '#E8DEF8',
					dark: '#4A4458',
					contrastText: '#FFFFFF',
				},
				tertiary: {
					50: '#FFEDEF',
					100: '#FFD8E4',
					200: '#EFB8C8',
					300: '#D29DA0',
					400: '#B5827B',
					500: '#986970',
					600: '#7D5260',
					700: '#633B48',
					800: '#492532',
					900: '#31101D',
					main: '#7D5260',
					light: '#FFD8E4',
					dark: '#633B48',
					contrastText: '#FFFFFF',
				},
				error: {
					50: '#FCEEEE',
					100: '#F9DEDC',
					200: '#F2B8B5',
					300: '#EC928E',
					400: '#E46962',
					500: '#DC362E',
					600: '#B3261E',
					700: '#8C1D18',
					800: '#601410',
					900: '#410002',
					main: '#B3261E',
					light: '#F9DEDC',
					dark: '#8C1D18',
					contrastText: '#FFFFFF',
				},
				evalbar: {
					x: '#EADDFF', // Primary 90 (container)
					o: '#dbd3e7ff',
					Xtext: '#7F67BE', // Primary 50
					Otext: '#7A7289',
					evalText: '#49454F',
				},
				info: { main: '#8fb4d8ff' },
				success: { main: '#5ed381ff', light: '#cafad9ff' },
				warning: { main: '#f9ba5bff', light: '#faebd5ff' },
				background: {
					default: '#FFFBFE', // Surface
					paper: '#FFFBFE',
				},
				surface: {
					main: '#FFFBFE',
				},
				outline: {
					main: '#79747E',
				},
				divider: '#79747E',
				text: {
					primary: '#1C1B1F',
					secondary: '#49454F',
				},
				action: {
					active: '#6750A4',
					hover: 'rgba(103, 80, 164, 0.08)',
					selected: 'rgba(103, 80, 164, 0.16)',
					disabled: 'rgba(28,27,31,0.38)',
					disabledBackground: 'rgba(28,27,31,0.12)',
				},
			},
		},
		dark: {
			palette: {
				primary: {
					50: '#F6EDFF', // tone 95
					100: '#EADDFF', // tone 90
					200: '#D0BCFF', // tone 80 (main)
					300: '#B69DF8', // tone 70
					400: '#9A82DB', // tone 60
					500: '#7F67BE', // tone 50
					600: '#6750A4', // tone 40
					700: '#4F378B', // tone 30 (dark)
					800: '#381E72', // tone 20 (light)
					900: '#21005D', // tone 10
					main: '#D0BCFF', // Primary 80
					light: '#381E72', // Primary 20 (container)
					dark: '#B69DF8',
					contrastText: '#21005D',
				},
				secondary: {
					50: '#F6EDFF',
					100: '#E8DEF8',
					200: '#CCC2DC',
					300: '#B0A7C0',
					400: '#958DA5',
					500: '#7A7289',
					600: '#625B71',
					700: '#4A4458',
					800: '#332D41',
					900: '#1D192B',
					main: '#CCC2DC',
					light: '#332D41',
					dark: '#4A4458',
					contrastText: '#332D41',
				},
				tertiary: {
					50: '#FFEDEF',
					100: '#FFD8E4',
					200: '#EFB8C8',
					300: '#D29DA0',
					400: '#B5827B',
					500: '#986970',
					600: '#7D5260',
					700: '#633B48',
					800: '#492532',
					900: '#31101D',
					main: '#EFB8C8',
					light: '#492532',
					dark: '#633B48',
					contrastText: '#492532',
				},
				error: {
					50: '#FCEEEE',
					100: '#F9DEDC',
					200: '#F2B8B5',
					300: '#EC928E',
					400: '#E46962',
					500: '#DC362E',
					600: '#B3261E',
					700: '#8C1D18',
					800: '#601410',
					900: '#410002',
					main: '#F2B8B5',
					light: '#601410',
					dark: '#8C1D18',
					contrastText: '#601410',
				},
				evalbar: {
					x: '#583f95ff',
					o: '#504a5bff',
					Xtext: '#D0BCFF',
					Otext: '#B0A7C0',
					evalText: '#fefefeff',
				},
				info: { main: '#66B2FF' },
				success: { main: '#55D190', light: '#1d5137ff' },
				warning: { main: '#E6B66E', light: '#67491bff' },
				background: {
					default: '#1C1B1F',
					paper: '#1C1B1F',
				},
				surface: {
					main: '#1C1B1F',
				},
				outline: {
					main: '#938F99',
				},
				divider: '#938F99',
				text: {
					primary: '#E6E1E5',
					secondary: '#CAC4D0',
				},
				action: {
					active: '#D0BCFF',
					hover: 'rgba(208,188,255,0.08)',
					selected: 'rgba(208,188,255,0.16)',
					disabled: 'rgba(230,225,229,0.38)',
					disabledBackground: 'rgba(230,225,229,0.12)',
				},
			},
		},
	},
	// (Optional) Add cssVarPrefix or defaultColorScheme if needed
	typography: {
		fontFamily: roboto.style.fontFamily,
		// MD3 recommends slightly larger body sizes; adjust if desired.
		body1: { fontSize: '0.95rem' },
		body2: { fontSize: '0.85rem' },
	},
	shape: {
		borderRadius: 12, // MD3 uses larger radii (4, 8, 12, 28... choose a base)
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: ({ theme }: { theme: Theme }) => ({
					borderRadius: theme.shape.borderRadius,
					textTransform: 'none',
					fontWeight: 500,
				}),
			},
			defaultProps: {
				disableElevation: true,
				variant: 'contained',
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: 'none', // Remove MUI default elevation overlay pattern when using MD3 surfaces
				},
			},
		},
		MuiAppBar: {
			defaultProps: { color: 'primary' },
			styleOverrides: {
				root: {
					backgroundImage: 'none',
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: ({ theme }: { theme: Theme }) => ({
					borderRadius: theme.shape.borderRadius,
				}),
			},
		},
	},
});

export default theme;
