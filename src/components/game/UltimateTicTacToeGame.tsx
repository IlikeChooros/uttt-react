'use client'

import React, { useState, useEffect, use } from 'react';
import { Paper, Box } from '@mui/material';
import { EngineAPI, EngineLimits, EngineMove, getEngineLimits } from '@/api';
import { GameState, ToNotation, getInitialBoardState, AnalysisState, BoardSettings } from '@/board';
import GameBoard from '@/components/game/GameBoard';
import GameStatus from '@/components/game/GameStatus';
import GameControls from '@/components/game/GameControls';
import SettingsPanel from '@/components/settings/SettingsPanel';
import AnalysisPanel from '@/components/analysis/AnalysisPanel';
import GameRules from '@/components/ui/GameRules';

// interface UltimateTicTacToeProps {
//   limits: Promise<EngineLimits>
// }

export default function UltimateTicTacToeGame() {
  const [engineLimits, setEngineLimits] = useState<EngineLimits>()
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
    engineDepth: 3,
    nThreads: 2,
    memorySizeMb: 4,
  });

  // Analyze current position when settings or game state changes
  useEffect(() => {
    async function analyzePosition() {
      if (!boardSettings.showAnalysis || gameState.winner || gameState.isDraw) return;
      
      setAnalysisState(prev => ({ ...prev, thinking: true }));    
      const topMoves: EngineMove[] = await EngineAPI.analyze({
        position: ToNotation(gameState), 
        depth: boardSettings.engineDepth,
        threads: boardSettings.nThreads,
        sizemb: boardSettings.memorySizeMb,
      });
      
      const bestMove = topMoves[0] || null;
      const currentEval = bestMove ? bestMove.evaluation : "0";
      
      setAnalysisState({
        enabled: true,
        currentEvaluation: currentEval,
        bestMove,
        topMoves: topMoves.slice(0, 5),
        thinking: false,
      });
    }
    
    if (boardSettings.showAnalysis) {
      analyzePosition();
    }
  }, [gameState.boards, gameState.currentPlayer, gameState.activeBoard, boardSettings.showAnalysis, boardSettings.engineDepth]);

  useEffect(() => {
    getEngineLimits().then((v) => setEngineLimits(v))
  }, [])

  // Reset the game
  const resetGame = () => {
    setGameState(getInitialBoardState());
    setAnalysisState({
      enabled: false,
      currentEvaluation: "0",
      bestMove: null,
      topMoves: [],
      thinking: false,
    });
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
        setGameState={setGameState} 
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