import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import NextLink from 'next/link';
import Copyright from '@/components/Copyright';
import UltimateTicTacToeBoard from '@/components/UltimateTicTacToeBoard';

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
        
        <Link href="/login" color="secondary" component={NextLink}>
          Go to login
        </Link>
        <Copyright />
      </Box>
    </Container>
  );
}