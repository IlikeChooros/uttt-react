'use client';

import React, { useCallback } from 'react';
import { Box } from '@mui/material';
import { GameState, SmallBoard, Player, BoardSettings, AnalysisState } from '@/board';
import SmallBoardComponent from '@/components/game/SmallBoard';

interface GameBoardProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  boardSettings: BoardSettings;
  analysisState: AnalysisState;
}

export default function GameBoard({ 
  gameState, 
  setGameState, 
  boardSettings,
  analysisState 
}: GameBoardProps) {
  
  const checkSmallBoardWinner = useCallback((board: SmallBoard): Player => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6], // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }, []);

  const checkOverallWinner = useCallback((boards: GameState['boards']): Player => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6], // diagonals
    ];

    const winners = boards.map(b => b.winner);
    
    for (const [a, b, c] of lines) {
      if (winners[a] && winners[a] === winners[b] && winners[a] === winners[c]) {
        return winners[a];
      }
    }
    return null;
  }, []);

  const updateSmallBoardState = useCallback((board: SmallBoard) => {
    const winner = checkSmallBoardWinner(board);
    const isDraw = !winner && board.every(cell => cell !== null);
    return { board, winner, isDraw };
  }, [checkSmallBoardWinner]);

  const handleCellClick = useCallback((boardIndex: number, cellIndex: number) => {
    // Check if move is valid
    if (gameState.winner || gameState.isDraw) return;
    if (gameState.boards[boardIndex].board[cellIndex] !== null) return;
    if (gameState.boards[boardIndex].winner || gameState.boards[boardIndex].isDraw) return;
    if (gameState.activeBoard !== null && gameState.activeBoard !== boardIndex) return;

    // Make the move
    const newBoards = [...gameState.boards];
    const newBoard = [...newBoards[boardIndex].board];
    newBoard[cellIndex] = gameState.currentPlayer;
    
    // Update the small board state
    newBoards[boardIndex] = updateSmallBoardState(newBoard);
    
    // Determine next active board
    const nextActiveBoard = newBoards[cellIndex].winner || newBoards[cellIndex].isDraw 
      ? null // Can play anywhere if target board is complete
      : cellIndex;
    
    // Check for overall winner
    const overallWinner = checkOverallWinner(newBoards);
    const overallDraw = !overallWinner && newBoards.every(b => b.winner || b.isDraw);

    setGameState({
      boards: newBoards,
      currentPlayer: gameState.currentPlayer === 'X' ? 'O' : 'X',
      winner: overallWinner,
      isDraw: overallDraw,
      activeBoard: nextActiveBoard,
      lastMove: { boardIndex, cellIndex },
    });
  }, [gameState, setGameState, checkOverallWinner, updateSmallBoardState]);

  const isBoardActive = useCallback((boardIndex: number): boolean => {
    if (gameState.winner || gameState.isDraw) return false;
    if (gameState.boards[boardIndex].winner || gameState.boards[boardIndex].isDraw) return false;
    return gameState.activeBoard === null || gameState.activeBoard === boardIndex;
  }, [gameState]);

  return (
    <Box 
      sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 2,
        width: 'fit-content',
        mx: 'auto',
      }}
    >
      {Array.from({ length: 9 }, (_, boardIndex) => (
        <SmallBoardComponent
          key={boardIndex}
          boardIndex={boardIndex}
          smallBoard={gameState.boards[boardIndex]}
          isActive={isBoardActive(boardIndex)}
          cellSize={boardSettings.size}
          showAnalysis={boardSettings.showAnalysis}
          bestMove={analysisState.bestMove}
          topMoves={analysisState.topMoves}
          onCellClick={handleCellClick}
        />
      ))}
    </Box>
  );
}