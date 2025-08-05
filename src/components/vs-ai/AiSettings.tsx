import Box from '@mui/material/Box';
import AccordionDetails from '@mui/material/AccordionDetails';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';

// icons
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// my components
import { BoardSettings } from '@/board';
import { EngineLimits } from '@/api';
import EngineSettings from '../settings/EngineSettings';

interface AiSettingsProps {
	settings: BoardSettings;
	limits: EngineLimits;
	onSettingsChange: (v: BoardSettings) => void;
}

export default function AiSettings({
	settings,
	limits,
	onSettingsChange,
}: AiSettingsProps) {
	return (
		<Accordion sx={{ mb: 2, borderRadius: '0px 0px 5px 5px' }}>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
				<SettingsIcon sx={{ fontSize: '24px' }} />
				<Typography variant="body1" sx={{ px: 1 }}>
					Engine settings
				</Typography>
			</AccordionSummary>
			<AccordionDetails sx={{ flex: 1 }}>
				<Box
					sx={{
						display: 'flex',
						flexDirection: { xs: 'column', md: 'row' },
						gap: { xs: 2, sm: 4 },
						px: 2,
					}}
				>
					<EngineSettings
						show
						settings={settings}
						limits={limits}
						onSettingsChange={onSettingsChange}
					/>
				</Box>
			</AccordionDetails>
		</Accordion>
	);
}
