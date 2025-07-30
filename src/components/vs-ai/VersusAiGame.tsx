'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Box, CircularProgress, Alert, Chip } from '@mui/material';
import { EngineAPI, EngineLimits, EngineMove, getEngineLimits } from '@/api';
import { GameState, BoardSettings, AnalysisState, SmallBoard, Player, ToNotation, getInitialBoardState, toAnalysisRequest } from '@/board';
import GameBoard from '@/components/game/GameBoard';
import GameStatus from '@/components/game/GameStatus';
import GameControls from '@/components/game/GameControls';
import SettingsPanel from '@/components/settings/SettingsPanel';
import VersusAiControls from '@/components/vs-ai/VersusAiControls';
import VersusAiStatus from '@/components/vs-ai/VersusAiStatus';

interface VersusState {
  ready: boolean;
  on: boolean;
  thinking: boolean;
  engineTurn: Player;
  gameMode: 'setup' | 'playing' | 'finished';
}

export default function VersusAiGame() {
  const [engineLimits, setEngineLimits] = useState<EngineLimits>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [gameState, setGameState] = useState<GameState>(getInitialBoardState());
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
    engineDepth: 16,
    nThreads: 4,
    memorySizeMb: 16,
  });
  const [versusState, setVersusState] = useState<VersusState>({
    ready: false,
    on: false,
    thinking: false,
    engineTurn: 'O', // Default: human is X, AI is O
    gameMode: 'setup'
  });

  // Load engine limits on mount
  useEffect(() => {
    async function fetchLimits() {
      try {
        setIsLoading(true);
        const limits = await getEngineLimits();
        setEngineLimits(limits);
        
        setBoardSettings(prev => ({
          ...prev,
          engineDepth: Math.min(prev.engineDepth, limits?.depth || 10),
          nThreads: Math.min(prev.nThreads, limits?.threads || 4),
          memorySizeMb: Math.min(prev.memorySizeMb, limits?.mbsize || 16)
        }));
      } catch (error) {
        console.error("Failed to fetch engine limits:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLimits();
  }, []);

  // AI move logic
  useEffect(() => {
    async function makeAiMove() {
      if (!versusState.on || !versusState.ready || versusState.thinking) return;
      if (versusState.engineTurn !== gameState.currentPlayer) return;
      if (gameState.winner || gameState.isDraw) return;

      setVersusState(prev => ({ ...prev, thinking: true }));
      
      try {
        const moves = await EngineAPI.analyze(toAnalysisRequest(boardSettings, gameState));

        const bestMove = moves[0] || null;
        
        if (bestMove != null) {
            // Add a small delay to make AI thinking visible
            console.log('made move', bestMove);
            handleMakeMove(bestMove.boardIndex, bestMove.cellIndex);
        }

        setVersusState(prev => ({ ...prev, thinking: false }));
      } catch (error) {
        console.error("AI move failed:", error);
        setVersusState(prev => ({ ...prev, thinking: false }));
      }
    }

    if (versusState.gameMode === 'playing') {
      makeAiMove();
    }
  }, [gameState.currentPlayer, versusState.on, versusState.ready, versusState.thinking, versusState.engineTurn, versusState.gameMode]);

  // Update game mode based on game state
  useEffect(() => {
    if (gameState.winner || gameState.isDraw) {
      setVersusState(prev => ({ ...prev, gameMode: 'finished', thinking: false }));
    } else if (versusState.on && versusState.ready) {
      setVersusState(prev => ({ ...prev, gameMode: 'playing' }));
    }
  }, [gameState.winner, gameState.isDraw, versusState.on, versusState.ready]);

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

  const handleMakeMove = useCallback((boardIndex: number, cellIndex: number) => {

    // Check if move is valid
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
  }, [gameState, versusState.thinking, versusState.on, versusState.engineTurn, checkOverallWinner, updateSmallBoardState]);

  const handlePlayerMove = useCallback((boardIndex: number, cellIndex: number) => {
    // Prevent moves during AI thinking or if game is over
    if (versusState.thinking || gameState.winner || gameState.isDraw) return;
    
    // In VS AI mode, prevent moves when it's the AI's turn
    if (versusState.on && versusState.engineTurn === gameState.currentPlayer) return;

    handleMakeMove(boardIndex, cellIndex);
  }, [gameState, versusState.thinking, versusState.on, versusState.engineTurn, checkOverallWinner, updateSmallBoardState])

  
  const startVersusAi = (humanPlaysFirst: boolean) => {
    setGameState(getInitialBoardState());
    setVersusState({
      ready: true,
      on: true,
      thinking: false,
      engineTurn: humanPlaysFirst ? 'O' : 'X',
      gameMode: 'playing'
    });
  };

  const stopVersusAi = () => {
    setVersusState({
      ready: false,
      on: false,
      thinking: false,
      engineTurn: 'O',
      gameMode: 'setup'
    });
  };

  const resetGame = () => {
    setGameState(getInitialBoardState());
    setAnalysisState({
      enabled: false,
      currentEvaluation: "0",
      bestMove: null,
      topMoves: [],
      thinking: false,
    });
    if (versusState.on) {
      setVersusState(prev => ({ ...prev, thinking: false, gameMode: 'playing' }));
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  const isHumanTurn = !versusState.on || versusState.engineTurn !== gameState.currentPlayer;
  const canMakeMove = isHumanTurn && !versusState.thinking && !gameState.winner && !gameState.isDraw;

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
      <GameStatus gameState={gameState} />
      
      <VersusAiStatus 
        versusState={versusState}
        gameState={gameState}
        engineLimits={engineLimits}
      />

      <VersusAiControls
        versusState={versusState}
        onStartGame={startVersusAi}
        onStopGame={stopVersusAi}
        onReset={resetGame}
      />
      
      {/* <SettingsPanel 
        limits={engineLimits}
        settings={boardSettings} 
        onSettingsChange={setBoardSettings} 
      /> */}
      
      <GameBoard 
        gameState={gameState} 
        handleCellClick={canMakeMove ? handlePlayerMove : () => {}}
        boardSettings={boardSettings}
        analysisState={analysisState}
      />
      
      {(gameState.winner || gameState.isDraw) && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Alert severity={gameState.winner ? 'success' : 'info'} sx={{ mb: 2 }}>
            {gameState.winner 
              ? `${gameState.winner === versusState.engineTurn ? 'AI' : 'You'} won!`
              : 'Game ended in a draw!'
            }
          </Alert>
          <GameControls onReset={resetGame} showNewGameButton />
        </Box>
      )}
    </Paper>
  );
}
