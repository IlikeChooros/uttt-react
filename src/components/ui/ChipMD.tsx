import Chip, { ChipProps } from '@mui/material/Chip';

export default function ChipMD({
	avatar,
	label,
	clickable,
	deleteIcon,
	onDelete,
	disabled,
	sx,
	onClick,
	icon,
	color,
}: ChipProps) {
	return (
		<Chip
			size="medium"
			variant="filled"
			sx={{
				borderRadius: '8px',
				minWidth: { xxs: '64px', xs: '88px' },
				...sx,
			}}
			color={color}
			icon={icon}
			avatar={avatar}
			label={label}
			clickable={clickable}
			deleteIcon={deleteIcon}
			disabled={disabled}
			onClick={onClick}
			onDelete={onDelete}
		/>
	);
}
