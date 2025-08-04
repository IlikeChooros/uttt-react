import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Copyright from '@/components/Copyright';
import GameModeSelector from '@/components/ui/GameModeSelector';

export default function Home() {
  return (
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Page Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Ultimate Tic Tac Toe
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
            Experience the strategic depth of Ultimate Tic-Tac-Toe. Choose your game mode and start playing!
          </Typography>
        </Box>

        {/* Game Mode Selection */}
        <GameModeSelector />   

        <Copyright />
      </Box>
  );
}