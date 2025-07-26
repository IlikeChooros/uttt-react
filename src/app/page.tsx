import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';;
import Copyright from '@/components/Copyright';
import UltimateTicTacToeBoard from '@/components/game/UltimateTicTacToeGame';
import { getEngineLimits } from '@/api';
import Loading from '@/app/loading';

export default function Home() {

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >        
        <Box sx={{ mb: 4 }}>
            <UltimateTicTacToeBoard />
        </Box>
        <Copyright />
      </Box>
    </Container>
  );
}