import React from 'react';

// mui
import AnalysisIcon from '@mui/icons-material/AutoGraph';

// mine
import RefButton from '@/components/ui/RefButton';

interface AnalysisButtonProps {
	onClick: () => void;
}

export const AnalysisButton = React.forwardRef<
	HTMLButtonElement,
	AnalysisButtonProps
>(function AnalysisBtn({ onClick }, ref) {
	return (
		<RefButton
			ref={ref}
			onClick={onClick}
			iconButtonProps={{
				sx: { bgcolor: 'primary.light', p: 1, justifySelf: 'end' },
				'aria-label': 'Analyze finished game',
			}}
			asIcon
		>
			<AnalysisIcon />
		</RefButton>
	);
});
