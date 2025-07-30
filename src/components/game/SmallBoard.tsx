'use client';

import React from 'react';
import { Paper, Box, useTheme, alpha } from '@mui/material';
import { SmallBoardState } from '@/board';
import { EngineMove } from '@/api';
import Cell from '@/components/game/Cell'

interface SmallBoardProps {
  boardIndex: number;
  smallBoard: SmallBoardState;
  isActive: boolean;
  cellSize: number;
  showAnalysis: boolean;
  bestMove: EngineMove | null;
  topMoves: EngineMove[];
  onCellClick: (boardIndex: number, cellIndex: number) => void;
}

export default function SmallBoard({
  boardIndex,
  smallBoard,
  isActive,
  cellSize,
  showAnalysis,
  bestMove,
  topMoves,
  onCellClick
}: SmallBoardProps) {
  const theme = useTheme();

  return (
    <Paper
      elevation={isActive ? 4 : 1}
      sx={{
        p: 1,
        borderRadius: 2,
        backgroundColor: isActive 
          ? alpha(theme.palette.primary.main, 0.1)
          : 'transparent',
        border: isActive 
          ? `2px solid ${theme.palette.primary.main}`
          : `1px solid ${theme.palette.divider}`,
        position: 'relative',
        transition: 'all 0.3s ease-in-out',
        '&:hover': isActive ? {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[6],
        } : {},
      }}
    >
      {/* Winner overlay */}
      {(smallBoard.winner || smallBoard.isDraw) && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: alpha(
              smallBoard.winner === 'X' 
                ? theme.palette.primary.main 
                : smallBoard.winner === 'O'
                  ? theme.palette.secondary.main
                  : theme.palette.grey[500], 
              0.8
            ),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              color: 'white',
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              fontSize: cellSize > 48 ? '2rem' : '1.5rem',
            }}
          >
            {smallBoard.isDraw ? '—' : smallBoard.winner}
          </Box>
        </Box>
      )}
      
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0.5,
        }}
      >
        {Array.from({ length: 9 }, (_, cellIndex) => {
          const value = smallBoard.board[cellIndex];
          const canClick = isActive && !value && !smallBoard.winner && !smallBoard.isDraw;
          const isBestMove = bestMove?.boardIndex === boardIndex && bestMove?.cellIndex === cellIndex;
          const isTopMove = topMoves.some(move => 
            move.boardIndex === boardIndex && move.cellIndex === cellIndex
          );
          
          return (
            <Cell
              key={cellIndex}
              value={value}
              size={cellSize}
              canClick={canClick}
              isBestMove={isBestMove}
              isTopMove={isTopMove && showAnalysis}
              onClick={() => onCellClick(boardIndex, cellIndex)}
            />
          );
        })}
      </Box>
    </Paper>
  );
}