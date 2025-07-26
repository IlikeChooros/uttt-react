'use client';

import React from 'react';
import { Button, IconButton, Box } from '@mui/material';
import { RestartAlt as RestartIcon } from '@mui/icons-material';

interface GameControlsProps {
  onReset: () => void;
  showNewGameButton?: boolean;
}

export default function GameControls({ 
  onReset, 
  showNewGameButton = false 
}: GameControlsProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
      {showNewGameButton ? (
        <Button
          variant="contained"
          onClick={onReset}
          startIcon={<RestartIcon />}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          New Game
        </Button>
      ) : (
        <IconButton 
          onClick={onReset}
          color="primary"
          size="small"
        >
          <RestartIcon />
        </IconButton>
      )}
    </Box>
  );
}