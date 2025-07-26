import React from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';

interface GameRulesProps {
  showAnalysis: boolean;
}

export default function GameRules({ showAnalysis }: GameRulesProps) {
  const theme = useTheme();
  
  return (
    <Box sx={{ mt: 4, p: 2, backgroundColor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
        How to Play
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        • Win 3 small boards in a row to win the game
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        • Your move determines which board your opponent plays in next
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        • If sent to a completed board, you can play anywhere
      </Typography>
      {showAnalysis && (
        <>
          <Typography variant="body2" sx={{ mb: 1, mt: 2, fontWeight: 500 }}>
            Analysis Features:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • <span style={{ color: theme.palette.success.main }}>Green borders</span>: Best move according to engine
          </Typography>
          <Typography variant="body2">
            • <span style={{ color: theme.palette.warning.main }}>Orange borders</span>: Other good moves
          </Typography>
        </>
      )}
    </Box>
  );
}