'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  IconButton,
  useTheme,
  alpha,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  useColorScheme,
} from '@mui/material';
import { 
  RestartAlt as RestartIcon,
  ExpandMore as ExpandMoreIcon,
  Psychology as AnalysisIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import { EngineAPI, EngineMove } from '@/api';
import { Player, SmallBoardState, SmallBoard, GameState, ToNotation } from '@/board';

interface AnalysisState {
  enabled: boolean;
  currentEvaluation: string;
  bestMove: EngineMove | null;
  topMoves: EngineMove[];
  thinking: boolean;
}

interface BoardSettings {
  size: number;
  showAnalysis: boolean;
  engineDepth: number;
}

const getInitialBoardState = (): GameState => {
  const boards: SmallBoardState[] = [];
  for (let i = 0; i < 9; i++) {
    boards.push({
      board: Array(9).fill(null),
      winner: null,
      isDraw: false,
    });
  }
  
  return {
    boards,
    currentPlayer: 'X',
    winner: null,
    isDraw: false,
    activeBoard: null, // First move can be anywhere
    lastMove: null,
  };
}

const UltimateTicTacToeBoard: React.FC = () => {
  const theme = useTheme();
  const { mode, setMode } = useColorScheme();
  const [gameState, setGameState] = useState<GameState>(getInitialBoardState);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    enabled: false,
    currentEvaluation: "0",
    bestMove: null,
    topMoves: [],
    thinking: false,
  });
  const [boardSettings, setBoardSettings] = useState<BoardSettings>({
    size: 64,
    showAnalysis: false,
    engineDepth: 3,
  });

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

  const checkOverallWinner = useCallback((boards: SmallBoardState[]): Player => {
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

  const updateSmallBoardState = useCallback((board: SmallBoard): SmallBoardState => {
    const winner = checkSmallBoardWinner(board);
    const isDraw = !winner && board.every(cell => cell !== null);
    return { board, winner, isDraw };
  }, [checkSmallBoardWinner]);

  // Analyze current position
  const analyzePosition = useCallback(async () => {
    if (!boardSettings.showAnalysis || gameState.winner || gameState.isDraw) return;
    
    setAnalysisState(prev => ({ ...prev, thinking: true }));    
    const topMoves: EngineMove[] = await EngineAPI.analyze({position: ToNotation(gameState), depth: boardSettings.engineDepth});
    const bestMove = topMoves[0] || null;
    const currentEval = bestMove ? bestMove.evaluation : "0";
    
    setAnalysisState({
      enabled: true,
      currentEvaluation: currentEval,
      bestMove,
      topMoves: topMoves.slice(0, 5),
      thinking: false,
    });
  }, [gameState, boardSettings.showAnalysis, boardSettings.engineDepth, updateSmallBoardState]);

  // Run analysis when position changes
  useEffect(() => {
    if (boardSettings.showAnalysis) {
      analyzePosition();
    }
  }, [gameState.boards, gameState.currentPlayer, gameState.activeBoard, boardSettings.showAnalysis, analyzePosition]);

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
  }, [gameState, checkOverallWinner, updateSmallBoardState]);

  const resetGame = useCallback(() => {
    setGameState(getInitialBoardState());
    setAnalysisState({
      enabled: false,
      currentEvaluation: "0",
      bestMove: null,
      topMoves: [],
      thinking: false,
    });
  }, []);

  const isBoardActive = useCallback((boardIndex: number): boolean => {
    if (gameState.winner || gameState.isDraw) return false;
    if (gameState.boards[boardIndex].winner || gameState.boards[boardIndex].isDraw) return false;
    return gameState.activeBoard === null || gameState.activeBoard === boardIndex;
  }, [gameState]);

  const renderSmallBoard = (boardIndex: number) => {
    const smallBoard = gameState.boards[boardIndex];
    const isActive = isBoardActive(boardIndex);
    const bestMoveInBoard = analysisState.bestMove?.boardIndex === boardIndex;
    
    return (
      <Paper
        key={boardIndex}
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
          transition: 'all 0.2s ease-in-out',
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
            <Typography
              variant="h2"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                fontSize: boardSettings.size > 48 ? '2rem' : '1.5rem',
              }}
            >
              {smallBoard.isDraw ? '—' : smallBoard.winner}
            </Typography>
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
            const isBestMove = bestMoveInBoard && analysisState.bestMove?.cellIndex === cellIndex;
            const isTopMove = analysisState.topMoves.some(move => 
              move.boardIndex === boardIndex && move.cellIndex === cellIndex
            );
            
            return (
              <Button
                key={cellIndex}
                variant="outlined"
                onClick={() => handleCellClick(boardIndex, cellIndex)}
                disabled={!canClick}
                sx={{
                  width: boardSettings.size,
                  height: boardSettings.size,
                  minWidth: 'unset',
                  fontSize: boardSettings.size > 48 ? '2rem' : boardSettings.size > 32 ? '1.5rem' : '1rem',
                  fontWeight: 'bold',
                  borderRadius: 1,
                  border: isBestMove 
                    ? `2px solid ${theme.palette.success.main}`
                    : isTopMove && boardSettings.showAnalysis
                      ? `2px solid ${theme.palette.warning.main}`
                      : `1px solid ${theme.palette.divider}`,
                  backgroundColor: isBestMove 
                    ? alpha(theme.palette.success.main, 0.1)
                    : isTopMove && boardSettings.showAnalysis
                      ? alpha(theme.palette.warning.main, 0.05)
                      : 'transparent',
                  '&:hover': canClick ? {
                    backgroundColor: isBestMove
                      ? alpha(theme.palette.success.main, 0.2)
                      : alpha(theme.palette.action.hover, 0.8),
                    borderColor: isBestMove 
                      ? theme.palette.success.main
                      : theme.palette.primary.main,
                  } : {},
                  '&.Mui-disabled': {
                    color: value === 'X' 
                      ? theme.palette.primary.main 
                      : value === 'O' 
                        ? theme.palette.secondary.main 
                        : theme.palette.text.disabled,
                    borderColor: isBestMove 
                      ? theme.palette.success.main
                      : isTopMove && boardSettings.showAnalysis
                        ? theme.palette.warning.main
                        : theme.palette.divider,
                    backgroundColor: isBestMove 
                      ? alpha(theme.palette.success.main, 0.1)
                      : isTopMove && boardSettings.showAnalysis
                        ? alpha(theme.palette.warning.main, 0.05)
                        : 'transparent',
                  },
                }}
              >
                {value}
              </Button>
            );
          })}
        </Box>
      </Paper>
    );
  };

  const getStatusMessage = () => {
    if (gameState.winner) {
      return `Player ${gameState.winner} wins the game!`;
    }
    if (gameState.isDraw) {
      return "The game is a draw!";
    }
    
    let message = `Current player: ${gameState.currentPlayer}`;
    
    if (gameState.activeBoard !== null) {
      message += ` (must play in highlighted board)`;
    } else {
      message += ` (can play in any available board)`;
    }
    
    return message;
  };

  const getStatusSeverity = () => {
    if (gameState.winner) return 'success';
    if (gameState.isDraw) return 'warning';
    return 'info';
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 4, 
        borderRadius: 3,
        maxWidth: Math.max(800, boardSettings.size * 9 + 200),
        mx: 'auto',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ fontWeight: 500 }}
        >
          Ultimate Tic Tac Toe
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Alert 
            severity={getStatusSeverity()}
            sx={{ flexGrow: 1, justifyContent: 'center', fontSize: '0.9rem' }}
          >
            {getStatusMessage()}
          </Alert>
          
          <IconButton 
            onClick={resetGame}
            color="primary"
            size="small"
            sx={{ 
              ml: 1,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            <RestartIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Settings Panel */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TuneIcon />
            <Typography variant="h6">Settings & Analysis</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography gutterBottom>Board Size</Typography>
              <Slider
                value={boardSettings.size}
                onChange={(_, value) => setBoardSettings(prev => ({ ...prev, size: value as number }))}
                min={24}
                max={96}
                step={8}
                marks={[
                  { value: 24, label: 'Small' },
                  { value: 64, label: 'Medium' },
                  { value: 96, label: 'Large' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={mode || 'light'}
                  onChange={(e) => setMode?.(e.target.value as 'light' | 'dark')}
                  label="Theme"
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant={boardSettings.showAnalysis ? "contained" : "outlined"}
                  onClick={() => setBoardSettings(prev => ({ ...prev, showAnalysis: !prev.showAnalysis }))}
                  startIcon={<AnalysisIcon />}
                  size="small"
                >
                  {boardSettings.showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
                </Button>
                
                {boardSettings.showAnalysis && (
                  <Box>
                    <Typography gutterBottom sx={{ fontSize: '0.8rem' }}>
                      Engine Depth: {boardSettings.engineDepth}
                    </Typography>
                    <Slider
                      value={boardSettings.engineDepth}
                      onChange={(_, value) => setBoardSettings(prev => ({ ...prev, engineDepth: value as number }))}
                      min={1}
                      max={15}
                      step={1}
                      size="small"
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Analysis Panel */}
      {boardSettings.showAnalysis && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AnalysisIcon color="primary" />
            <Typography variant="h6">Engine Analysis</Typography>
            {analysisState.thinking && (
              <Chip label="Thinking..." size="small" color="primary" />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Position Evaluation:</strong> {analysisState.currentEvaluation}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Best Move:</strong> {
                  analysisState.bestMove 
                    ? `Board ${analysisState.bestMove.boardIndex + 1}, Cell ${analysisState.bestMove.cellIndex + 1}`
                    : 'None'
                }
              </Typography>
              <Typography variant="body2">
                <strong>Depth:</strong> {analysisState.bestMove?.depth}
              </Typography>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Top Moves:</strong>
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {analysisState.topMoves.slice(0, 3).map((move, index) => (
                  <Chip
                    key={`${move.boardIndex}-${move.cellIndex}`}
                    label={`${move.boardIndex + 1}${move.cellIndex + 1} (${move.evaluation})`}
                    size="small"
                    color={index === 0 ? "success" : "warning"}
                    variant={index === 0 ? "filled" : "outlined"}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
          width: 'fit-content',
          mx: 'auto',
        }}
      >
        {Array.from({ length: 9 }, (_, index) => renderSmallBoard(index))}
      </Box>

      {(gameState.winner || gameState.isDraw) && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="contained"
            onClick={resetGame}
            startIcon={<RestartIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            New Game
          </Button>
        </Box>
      )}

      {/* Game Rules */}
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
        {boardSettings.showAnalysis && (
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
    </Paper>
  );
};

export default UltimateTicTacToeBoard;