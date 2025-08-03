import { EngineMove, AnalysisRequest } from "@/api";

export type Player = 'X' | 'O' | null;
export type SmallBoard = Player[];

export interface SmallBoardState {
  board: SmallBoard;
  winner: Player;
  isDraw: boolean;
}

export interface GameState {
  boards: SmallBoardState[];
  currentPlayer: Player;
  winner: Player;
  isDraw: boolean;
  activeBoard: number | null; // Which small board the next player must play in
  lastMove: { boardIndex: number; cellIndex: number } | null;
  enabled: boolean;
}

export function getInitialAnalysisState(): AnalysisState {
  return {
    enabled: false,
    currentEvaluation: "",
    bestMove: null,
    topMoves: [],
    thinking: false,
    ws: null,
  }
}

export interface AnalysisState {
  enabled: boolean;
  currentEvaluation: string;
  bestMove: EngineMove | null;
  topMoves: EngineMove[];
  thinking: boolean;
  ws: WebSocket | null;
}

export type BoardSizeOption = 'small' | 'normal' | 'large';

export function getIntialBoardSettings(): BoardSettings {
  return {
    boardSize: 'normal',
    showAnalysis: false,
    engineDepth: 16,
    nThreads: 4,
    memorySizeMb: 16,
  }
}

export interface BoardSettings {
  boardSize: BoardSizeOption;
  showAnalysis: boolean;
  engineDepth: number;
  nThreads: number;
  memorySizeMb: number;
}

export function toAnalysisRequest(settings: BoardSettings, gameState: GameState): AnalysisRequest {
  return {
    position: ToNotation(gameState),
    depth: settings.engineDepth,
    threads: settings.nThreads,
    sizemb: settings.memorySizeMb,
  }
}

export const getInitialBoardState = (): GameState => {
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
    enabled: true,
  };
}

/**
 * Convert given game state into string notation of the board
 * @param state state of the game
 * @returns string notation, as specified in notation.go
 */
export function ToNotation(state: GameState): string {
    let notation = "";
    let emptyCounter = 0,
        rowIndex = 0;

    // Build the position notation
    for (; rowIndex < 9; rowIndex++) {
        emptyCounter = 0;

        for (let i = 0; i < 9; i++) {
            switch (state.boards[rowIndex].board[i]) {
                case 'O':
                case 'X':
                    if (emptyCounter > 0) {
                        notation += emptyCounter.toFixed(0);
                        emptyCounter = 0;
                    }

                    notation += state.boards[rowIndex].board[i] == 'X' ? 'x' : 'o';
                    break;
                default:
                    emptyCounter += 1;
            }
        }

        if (emptyCounter > 0) {
            notation += emptyCounter.toFixed(0);
        }

        if (rowIndex != 8) {
            notation += '/';
        }
    }

    // Add the turn
    notation += ' ';
    notation += state.currentPlayer == 'X' ? 'x' : 'o'

    // Add the active board index
    notation += ' ';
    if (state.activeBoard == null) {
        notation += '-';
    } else {
        notation += state.activeBoard.toFixed(0);
    }

    return notation;
}