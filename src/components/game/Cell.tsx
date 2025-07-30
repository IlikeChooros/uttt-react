'use client';

import React from 'react';
import { Button, useTheme, alpha } from '@mui/material';
import { Player } from '@/board';

interface CellProps {
  value: Player;
  size: number;
  canClick: boolean;
  isBestMove: boolean;
  isTopMove: boolean;
  onClick: () => void;
}

export default function Cell({
  value,
  size,
  canClick,
  isBestMove,
  isTopMove,
  onClick
}: CellProps) {
  const theme = useTheme();
  
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      disabled={!canClick}
      sx={{
        width: size,
        height: size,
        minWidth: 'unset',
        fontSize: size > 48 ? '2rem' : size > 32 ? '1.5rem' : '1rem',
        fontWeight: 'bold',
        borderRadius: 1,
        border: isBestMove 
          ? `2px solid ${theme.palette.success.main}`
          : isTopMove
            ? `2px solid ${theme.palette.warning.main}`
            : `1px solid ${theme.palette.divider}`,
        backgroundColor: isBestMove 
          ? alpha(theme.palette.success.main, 0.1)
          : isTopMove
            ? alpha(theme.palette.warning.main, 0.05)
            : 'transparent',
        cursor: canClick ? 'pointer' : 'not-allowed',
        transition: 'all 0.2s ease-in-out',
        '&:hover': canClick ? {
          backgroundColor: isBestMove
            ? alpha(theme.palette.success.main, 0.2)
            : alpha(theme.palette.action.hover, 0.8),
          borderColor: isBestMove 
            ? theme.palette.success.main
            : theme.palette.primary.main,
          transform: 'scale(1.02)',
        } : {},
        '&.Mui-disabled': {
          color: value === 'X' 
            ? theme.palette.primary.main 
            : value === 'O' 
              ? theme.palette.secondary.main 
              : theme.palette.text.disabled,
          borderColor: isBestMove 
            ? theme.palette.success.main
            : isTopMove
              ? theme.palette.warning.main
              : theme.palette.divider,
          backgroundColor: isBestMove 
            ? alpha(theme.palette.success.main, 0.1)
            : isTopMove
              ? alpha(theme.palette.warning.main, 0.05)
              : 'transparent',
          opacity: value ? 1 : 0.5,
        },
      }}
    >
      {value}
    </Button>
  );
}