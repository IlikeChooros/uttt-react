'use client';

import React from 'react';
import { Alert, Typography, Box } from '@mui/material';
import { GameState } from '@/board';

interface GameStatusProps {
  gameState: GameState;
}

export default function GameStatus({ gameState }: GameStatusProps) {
  const getStatusMessage = () => {
    if (gameState.winner) {
      return `Player ${gameState.winner} wins the game!`;
    }
    if (gameState.isDraw) {
      return "The game is a draw!";
    }
    
    let message = `Current player: ${gameState.currentPlayer}`;
    
    if (gameState.activeBoard !== null) {
      message += ` (must play in highlighted board)`;
    } else {
      message += ` (can play in any available board)`;
    }
    
    return message;
  };

  const getStatusSeverity = () => {
    if (gameState.winner) return 'success';
    if (gameState.isDraw) return 'warning';
    return 'info';
  };

  return (
    <Box sx={{ textAlign: 'center', mb: 3 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ fontWeight: 500 }}
      >
        Ultimate Tic Tac Toe
      </Typography>
      
      <Alert 
        severity={getStatusSeverity()}
        sx={{ 
          justifyContent: 'center', 
          fontSize: '0.9rem',
          width: '100%'
        }}
      >
        {getStatusMessage()}
      </Alert>
    </Box>
  );
}