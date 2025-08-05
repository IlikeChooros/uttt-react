'use client';

import React from 'react';
import { Player } from '@/board';
import { alpha, useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';

interface CellProps {
  value: Player;
  canClick: boolean;
  isBestMove: boolean;
  isTopMove: boolean;
  onClick: () => void;
}

export default function Cell({
  value,
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
        width: {
          xs: '32px',
          sm: '42px',
          md: '70px',
          lg: '76px',
          xl: '82px',
        },
        height: {
          xs: '32px',
          sm: '42px',
          md: '70px',
          lg: '76px',
          xl: '82px',
        },
        minWidth: 'unset',
        fontSize: {
          xs: '1rem',
          sm: '1.25rem',
          md: '1.5rem',
          lg: '2rem',
          xl: '2.5rem',
        },
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