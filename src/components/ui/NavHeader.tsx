'use client';

import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  useTheme
} from '@mui/material';
import { 
  Home as HomeIcon,
  Psychology as AiIcon 
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavHeader() {
  const theme = useTheme();
  const pathname = usePathname();

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, fontWeight: 600 }}
        >
          Ultimate Tic Tac Toe
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            component={Link}
            href="/"
            startIcon={<HomeIcon />}
            variant={pathname === '/' ? 'contained' : 'text'}
            sx={{ 
              textTransform: 'none',
              borderRadius: 2
            }}
          >
            Home
          </Button>
          
          <Button
            component={Link}
            href="/vs-ai"
            startIcon={<AiIcon />}
            variant={pathname === '/vs-ai' ? 'contained' : 'text'}
            sx={{ 
              textTransform: 'none',
              borderRadius: 2
            }}
          >
            VS AI
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
