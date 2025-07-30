'use client';

import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Box, 
  Chip 
} from '@mui/material';
import { 
  Psychology as AiIcon,
  Group as GroupIcon,
  Star as StarIcon
} from '@mui/icons-material';
import Link from 'next/link';

export default function GameModeSelector() {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
      {/* VS AI Card */}
      <Card sx={{ flex: 1, position: 'relative' }}>
        <Chip 
          label="Recommended" 
          color="primary" 
          size="small" 
          icon={<StarIcon />}
          sx={{ position: 'absolute', top: 12, right: 12 }}
        />
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AiIcon color="primary" />
            <Typography variant="h6" component="h2">
              Play vs AI
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Challenge our intelligent AI engine. Choose who goes first and watch the AI think through each move with visual feedback.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Features: AI difficulty settings, move analysis, thinking indicators
            </Typography>
          </Box>
        </CardContent>
        <CardActions>
          <Button 
            component={Link}
            href="/vs-ai"
            variant="contained" 
            fullWidth
            size="large"
            startIcon={<AiIcon />}
          >
            Start AI Game
          </Button>
        </CardActions>
      </Card>

      {/* Local Multiplayer Card */}
      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <GroupIcon color="secondary" />
            <Typography variant="h6" component="h2">
              Local Multiplayer
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Play with a friend on the same device. Take turns making moves and see who can master the ultimate tic-tac-toe strategy.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Features: Turn indicators, move analysis, game rules
            </Typography>
          </Box>
        </CardContent>
        <CardActions>
          <Button 
            variant="outlined" 
            fullWidth
            size="large"
            startIcon={<GroupIcon />}
            onClick={() => {
              // Scroll to the game board below
              const gameBoard = document.getElementById('game-board');
              gameBoard?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Play Local Game
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}
