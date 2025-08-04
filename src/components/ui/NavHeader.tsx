'use client';

import React, { useMemo } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
} from '@mui/material';
import { 
  Home as HomeIcon,
  Psychology as AiIcon,
  Group
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavHeader() {
  const pathname = usePathname();
  const navData = useMemo<Array<{href: string, name: string, icon: React.ReactElement}>>(() => [
    {href: '/', name: 'Home', icon: <HomeIcon />},
    {href: '/vs-ai', name: 'VS AI', icon: <AiIcon />},
    {href: '/local', name: 'Local', icon: <Group />},
  ], []);

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
          {navData.map(({href, name, icon}, index) => {
            return (
              <Button
                key={`${href}-${index}`}
                component={Link}
                href={href}
                startIcon={icon}
                variant={pathname === href ? 'contained' : 'text'}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 2
                }}
              >
                {name}
              </Button>
            )
          })}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
