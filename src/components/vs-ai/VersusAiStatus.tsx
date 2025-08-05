'use client';

import React from 'react';
import { 
  Psychology as AiIcon,
  Person as PersonIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { BoardSettings, GameState } from '@/board';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';

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
  settings: BoardSettings;
}

export default function VersusAiStatus({
  versusState,
  gameState,
  settings
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
      {versusState.gameMode === 'playing' && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            AI Settings: Depth {settings.engineDepth} • Threads {settings.nThreads} • Memory {settings.memorySizeMb}MB
          </Typography>
        </Box>
      )}
    </Box>
  );
}
