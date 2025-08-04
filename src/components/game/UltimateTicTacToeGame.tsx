'use client'

import React, { useState, useEffect } from 'react';
import { Paper, Box } from '@mui/material';
import { EngineAPI, toAnalysisRequest, getInitialAnalysisState, AnalysisState } from '@/api';
import GameBoard from '@/components/game/GameBoard';
import GameStatus from '@/components/game/GameStatus';
import GameControls from '@/components/game/GameControls';
import SettingsPanel from '@/components/settings/SettingsPanel';
import AnalysisPanel from '@/components/analysis/AnalysisPanel';
import GameRules from '@/components/ui/GameRules';
import { useGameLogic } from './GameLogic';

export default function UltimateTicTacToeGame() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>(getInitialAnalysisState);
  const [gameLogic, gameLogicDispatch] = useGameLogic();

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

          
          const bestMove = EngineAPI.parseAnalysisResponse(response);

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
    if (gameLogic.settings.showAnalysis && !analysisState.ws) {
      openWebSocket();
    } else if (!gameLogic.settings.showAnalysis && analysisState.ws) {
      // Close WebSocket when analysis is disabled
      console.log("Closing WebSocket connection...");
      analysisState.ws.close();
    }
  }, [gameLogic.settings, analysisState.ws]);
  
  // Send analysis requests when game state changes
  useEffect(() => {
    if (gameLogic.settings.showAnalysis && 
        !gameLogic.game.winner && 
        !gameLogic.game.isDraw) {

      if (analysisState.ws && 
        analysisState.ws.readyState === WebSocket.OPEN) {
        
        console.log("Sending analysis request...");
        setAnalysisState(prev => ({ ...prev, thinking: true }));
        analysisState.ws.send(JSON.stringify(toAnalysisRequest(gameLogic.settings, gameLogic.game)));
      }
    }
  }, [analysisState.ws, gameLogic.game, gameLogic.game.currentPlayer, gameLogic.game.activeBoard, 
      gameLogic.settings, gameLogic.settings.nThreads, gameLogic.settings.memorySizeMb]);

  // Close on unmount
  useEffect(() => {
    return () => {
      if (analysisState.ws) {
        analysisState.ws.close();
      }
    }
  }, [analysisState.ws]);

  // Reset the game
  const resetGame = () => gameLogicDispatch({type: 'reset'});

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
        gameState={gameLogic.game} 
      />
      
      <GameControls 
        onReset={resetGame} 
      />
      
      <SettingsPanel 
        loading={gameLogic.loadingLimits}
        limits={gameLogic.limits}
        settings={gameLogic.settings} 
        onSettingsChange={(newSettings) => gameLogicDispatch({type: 'change-settings', newSettings})} 
      />
      
      {gameLogic.settings.showAnalysis && (
        <AnalysisPanel 
          analysisState={analysisState} 
          thinking={analysisState.thinking} 
        />
      )}
      
      <GameBoard 
        gameState={gameLogic.game} 
        handleCellClick={(boardIndex, cellIndex) => gameLogicDispatch({type: 'makemove', move: {boardIndex, cellIndex}})}
        boardSettings={gameLogic.settings}
        analysisState={analysisState}
      />
      
      {(gameLogic.game.winner || gameLogic.game.isDraw) && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <GameControls onReset={resetGame} showNewGameButton />
        </Box>
      )}
      
      <GameRules showAnalysis={gameLogic.settings.showAnalysis} />
    </Paper>
  );
}