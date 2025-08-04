'use client';

import React from 'react';
import { 
  Box, 
  Alert, 
  Chip, 
  Typography,
  LinearProgress,
  Stack
} from '@mui/material';
import { 
  Psychology as AiIcon,
  Person as PersonIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { GameState } from '@/board';
import { EngineLimits } from '@/api';

interface VersusState {
  ready: boolean;
  on: boolean;
  thinking: boolean;
  engineTurn: 'X' | 'O' | null;
  gameMode: 'setup' | 'playing' | 'finished';
}

interface VersusAiStatusProps {
  versusState: VersusState;
  gameState: GameState;
  engineLimits?: EngineLimits;
}

export default function VersusAiStatus({
  versusState,
  gameState,
  engineLimits
}: VersusAiStatusProps) {
  
  if (versusState.gameMode === 'setup') {
    return null;
  }

  const isAiTurn = versusState.engineTurn === gameState.currentPlayer;
  const isHumanTurn = !isAiTurn;

  const getPlayerLabel = (player: 'X' | 'O') => {
    if (player === versusState.engineTurn) {
      return (
        <Chip
          icon={<AiIcon />}
          label={`AI (${player})`}
          color="secondary"
          variant={isAiTurn ? "filled" : "outlined"}
          size="small"
        />
      );
    } else {
      return (
        <Chip
          icon={<PersonIcon />}
          label={`You (${player})`}
          color="primary"
          variant={isHumanTurn ? "filled" : "outlined"}
          size="small"
        />
      );
    }
  };

  const getCurrentTurnMessage = () => {
    if (gameState.winner || gameState.isDraw) {
      return null;
    }

    if (versusState.thinking) {
      return (
        <Alert 
          severity="info" 
          sx={{ 
            justifyContent: 'center',
            '& .MuiAlert-message': { 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1 
            }
          }}
          icon={<TimerIcon fontSize="small" />}
        >
          AI is thinking...
          <LinearProgress 
            sx={{ 
              width: 100, 
              ml: 1,
              height: 4,
              borderRadius: 2
            }} 
          />
        </Alert>
      );
    }

    if (isAiTurn) {
      return (
        <Alert severity="warning" icon={<AiIcon sx={{ mr: 1 }} />} sx={{ justifyContent: 'center' }}>
          AI&apos;s turn - Please wait
        </Alert>
      );
    }

    return (
      <Alert severity="success" icon={<PersonIcon sx={{ mr: 1 }} />} sx={{ justifyContent: 'center' }}>
        Your turn - Make a move!
      </Alert>
    );
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Player indicators */}
      <Stack 
        direction="row" 
        spacing={2} 
        justifyContent="center" 
        sx={{ mb: 2 }}
      >
        {getPlayerLabel('X')}
        <Typography variant="body2" sx={{ alignSelf: 'center', color: 'text.secondary' }}>
          vs
        </Typography>
        {getPlayerLabel('O')}
      </Stack>

      {/* Current turn status */}
      {getCurrentTurnMessage()}

      {/* Engine settings display */}
      {versusState.gameMode === 'playing' && engineLimits && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            AI Settings: Depth {engineLimits.depth} • Threads {engineLimits.threads} • Memory {engineLimits.mbsize}MB
          </Typography>
        </Box>
      )}
    </Box>
  );
}
