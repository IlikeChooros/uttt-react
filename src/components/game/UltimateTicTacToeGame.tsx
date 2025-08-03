'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Box, CircularProgress } from '@mui/material';
import { EngineAPI, EngineLimits, EngineMove, getEngineLimits } from '@/api';
import { 
  GameState, ToNotation, 
  getInitialBoardState, 
  getInitialAnalysisState, 
  getIntialBoardSettings, 
  AnalysisState, BoardSettings, 
  SmallBoard, Player, 
  toAnalysisRequest,
  BoardSizeOption 
} from '@/board';
import GameBoard from '@/components/game/GameBoard';
import GameStatus from '@/components/game/GameStatus';
import GameControls from '@/components/game/GameControls';
import SettingsPanel from '@/components/settings/SettingsPanel';
import AnalysisPanel from '@/components/analysis/AnalysisPanel';
import GameRules from '@/components/ui/GameRules';

export default function UltimateTicTacToeGame() {
  const [engineLimits, setEngineLimits] = useState<EngineLimits>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [gameState, setGameState] = useState<GameState>(getInitialBoardState());
  const [analysisState, setAnalysisState] = useState<AnalysisState>(getInitialAnalysisState());
  const [boardSettings, setBoardSettings] = useState<BoardSettings>(getIntialBoardSettings());

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


  const openWebSocket = async function() {
    console.log("Establishing WebSocket connection...");
    
    try {
      // Make sure we're using the correct protocol (ws:// for http, wss:// for https)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//localhost:8080/rt-analysis`;
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = (event) => {
        console.log("Connected to websocket", event);
        setAnalysisState((prev) => ({...prev, ws}));
      };
      
      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log("Analysis response:", response);
          
          if (response.error) {
            console.error("Analysis error:", response.error);
            setAnalysisState(prev => ({ ...prev, thinking: false }));
            return;
          }

          
          let bestMove = EngineAPI.parseAnalysisResponse(response);

          // Update analysis state with response
          setAnalysisState(prev => ({
            ...prev,
            enabled: true,
            currentEvaluation: response.eval || "0",
            thinking: !response.final,
            bestMove,
            topMoves: [bestMove],
          }));
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };
      
      ws.onclose = (ev) => {
        console.log("WebSocket closed:", ev);
        setAnalysisState(prev => ({ ...prev, ws: null, thinking: false }));
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setAnalysisState(prev => ({ ...prev, ws: null, thinking: false }));
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
    }
  }

  // Handle WebSocket connection for analysis
  useEffect(() => {
    if (boardSettings.showAnalysis && !analysisState.ws) {
      openWebSocket();
    } else if (!boardSettings.showAnalysis && analysisState.ws) {
      // Close WebSocket when analysis is disabled
      console.log("Closing WebSocket connection...");
      analysisState.ws.close();
    }
  }, [boardSettings.showAnalysis]);
  
  // Send analysis requests when game state changes
  useEffect(() => {
    if (boardSettings.showAnalysis && 
        !gameState.winner && 
        !gameState.isDraw) {

      if (analysisState.ws && 
        analysisState.ws.readyState === WebSocket.OPEN) {
        
        console.log("Sending analysis request...");
        setAnalysisState(prev => ({ ...prev, thinking: true }));
        analysisState.ws.send(JSON.stringify(toAnalysisRequest(boardSettings, gameState)));
      }
    }
  }, [analysisState.ws, gameState.boards, gameState.currentPlayer, gameState.activeBoard, 
      boardSettings.engineDepth, boardSettings.nThreads, boardSettings.memorySizeMb]);

  // Close on unmount
  useEffect(() => {
    return () => {
      if (analysisState.ws) {
        analysisState.ws.close();
      }
    }
  }, [analysisState.ws]);

  // Reset the game
  const resetGame = () => {
    setGameState(getInitialBoardState());
    setAnalysisState(getInitialAnalysisState());
  };

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
      enabled: true,
    });
  }, [gameState, checkOverallWinner, updateSmallBoardState]);

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

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: {
          xs: 1,
          sm: 4,
        },
        borderRadius: 3,
        width: '100%',
      }}
    >
      <GameStatus 
        gameState={gameState} 
      />
      
      <GameControls 
        onReset={resetGame} 
      />
      
      <SettingsPanel 
        limits={engineLimits}
        settings={boardSettings} 
        onSettingsChange={setBoardSettings} 
      />
      
      {boardSettings.showAnalysis && (
        <AnalysisPanel 
          analysisState={analysisState} 
          thinking={analysisState.thinking} 
        />
      )}
      
      <GameBoard 
        gameState={gameState} 
        handleCellClick={handleMakeMove}
        boardSettings={boardSettings}
        analysisState={analysisState}
      />
      
      {(gameState.winner || gameState.isDraw) && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <GameControls onReset={resetGame} showNewGameButton />
        </Box>
      )}
      
      <GameRules showAnalysis={boardSettings.showAnalysis} />
    </Paper>
  );
}