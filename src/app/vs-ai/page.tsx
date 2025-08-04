import * as React from 'react';
import Box from '@mui/material/Box';
import Copyright from '@/components/Copyright';
import VersusAiGame from '@/components/vs-ai/VersusAiGame';

export default function VsAiPage() {
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
      <Box sx={{ mb: 4, width: '100%' }}>
        <VersusAiGame />
      </Box>
      <Copyright />
    </Box>
  );
}
