'use client';

import React, { useCallback } from 'react';
import { Box } from '@mui/material';
import { GameState, BoardSettings, AnalysisState } from '@/board';
import SmallBoardComponent from '@/components/game/SmallBoard';

interface GameBoardProps {
  gameState: GameState;
  handleCellClick: (boardIndex: number, cellIndex: number) => void;
  boardSettings: BoardSettings;
  analysisState: AnalysisState;
}

export default function GameBoard({ 
  gameState, 
  handleCellClick,
  boardSettings,
  analysisState
}: GameBoardProps) {

  const isBoardActive = useCallback((boardIndex: number): boolean => {
    if (gameState.winner || gameState.isDraw || !gameState.enabled) return false;
    if (gameState.boards[boardIndex].winner || gameState.boards[boardIndex].isDraw) return false;
    return gameState.activeBoard === null || gameState.activeBoard === boardIndex;
  }, [gameState]);

  return (
    <Box 
      sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: {
          xs: 1,
          sm: 1.5,
          md: 2,
          lg: 2.5,
        },
        width: 'fit-content',
        mx: 'auto',
        opacity: typeof handleCellClick === 'function' ? 1 : 0.6,
        pointerEvents: typeof handleCellClick === 'function' ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-in-out',
      }}
    >
      {Array.from({ length: 9 }, (_, boardIndex) => (
        <SmallBoardComponent
          key={boardIndex}
          boardIndex={boardIndex}
          smallBoard={gameState.boards[boardIndex]}
          isActive={isBoardActive(boardIndex)}
          showAnalysis={boardSettings.showAnalysis}
          bestMove={analysisState.bestMove}
          topMoves={analysisState.topMoves}
          onCellClick={handleCellClick}
        />
      ))}
    </Box>
  );
}