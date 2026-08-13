import { create } from 'zustand';
import { Board, Owner } from './pieces';
import { createInitialBoard } from './board';
import { Hand, createEmptyHand, LegalMove, applyMove } from './moveGenerator';
import { getGameStatus, GameStatus } from './gameController';
import { getAIMove } from './ai';

export interface GameState {
  // Game state
  board: Board;
  currentTurn: Owner;
  senteHand: Hand;
  goteHand: Hand;
  gameStatus: GameStatus;
  winner: Owner | null;
  
  // UI state
  selectedPosition: { row: number; col: number } | null;
  legalMoves: LegalMove[];
  lastMove: { from: { row: number; col: number }; to: { row: number; col: number } } | null;
  
  // Actions
  selectSquare: (row: number, col: number) => void;
  makeMove: (move: LegalMove) => void;
  resetGame: () => void;
  triggerAIMove: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  board: createInitialBoard(),
  currentTurn: 'sente',
  senteHand: createEmptyHand(),
  goteHand: createEmptyHand(),
  gameStatus: 'playing',
  winner: null,
  selectedPosition: null,
  legalMoves: [],
  lastMove: null,
  
  selectSquare: (row: number, col: number) => {
    const state = get();
    
    // If game is over, do nothing
    if (state.gameStatus === 'checkmate' || state.gameStatus === 'stalemate') {
      return;
    }
    
    // If it's AI's turn (gote), do nothing
    if (state.currentTurn === 'gote') {
      return;
    }
    
    const piece = state.board[row][col];
    
    // If a piece is already selected
    if (state.selectedPosition) {
      const { row: selectedRow, col: selectedCol } = state.selectedPosition;
      
      // Check if clicking on a legal move destination
      const move = state.legalMoves.find(m => 
        m.to.row === row && m.to.col === col
      );
      
      if (move) {
        // Make the move
        state.makeMove(move);
        return;
      }
      
      // If clicking on own piece, change selection
      if (piece && piece.owner === state.currentTurn) {
        const moves = getLegalMovesForPiece(state.board, state.currentTurn, { row, col }, state.senteHand, state.goteHand);
        set({ 
          selectedPosition: { row, col },
          legalMoves: moves
        });
        return;
      }
      
      // Deselect if clicking elsewhere
      set({ 
        selectedPosition: null,
        legalMoves: []
      });
      return;
    }
    
    // No piece selected yet - select if it's own piece
    if (piece && piece.owner === state.currentTurn) {
      const moves = getLegalMovesForPiece(state.board, state.currentTurn, { row, col }, state.senteHand, state.goteHand);
      set({ 
        selectedPosition: { row, col },
        legalMoves: moves
      });
    }
  },
  
  makeMove: (move: LegalMove) => {
    const state = get();
    const { board: newBoard, hand: newHand, capturedPiece } = applyMove(
      state.board,
      move,
      state.currentTurn === 'sente' ? state.senteHand : state.goteHand
    );
    
    // Update hands based on whose turn it was
    const senteHand = state.currentTurn === 'sente' 
      ? newHand 
      : state.senteHand;
    const goteHand = state.currentTurn === 'gote' 
      ? newHand 
      : state.goteHand;
    
    // Add captured piece to hand
    let updatedSenteHand = senteHand;
    let updatedGoteHand = goteHand;
    
    if (capturedPiece) {
      if (state.currentTurn === 'sente') {
        updatedSenteHand = { ...senteHand, [capturedPiece.type]: senteHand[capturedPiece.type] + 1 };
      } else {
        updatedGoteHand = { ...goteHand, [capturedPiece.type]: goteHand[capturedPiece.type] + 1 };
      }
    }
    
    // Handle drop moves
    if ('isDrop' in move && move.isDrop) {
      if (state.currentTurn === 'sente') {
        updatedSenteHand = { ...updatedSenteHand, [move.pieceType]: updatedSenteHand[move.pieceType] - 1 };
      } else {
        updatedGoteHand = { ...updatedGoteHand, [move.pieceType]: updatedGoteHand[move.pieceType] - 1 };
      }
    }
    
    // Determine next turn
    const nextTurn = state.currentTurn === 'sente' ? 'gote' : 'sente';
    
    // Get game status for next player
    const status = getGameStatus(newBoard, nextTurn, { sente: updatedSenteHand, gote: updatedGoteHand });
    
    set({
      board: newBoard,
      currentTurn: nextTurn,
      senteHand: updatedSenteHand,
      goteHand: updatedGoteHand,
      gameStatus: status,
      winner: status === 'checkmate' ? state.currentTurn : null,
      selectedPosition: null,
      legalMoves: [],
      lastMove: 'isDrop' in move && move.isDrop 
        ? null 
        : { from: move.from, to: move.to }
    });
  },
  
  resetGame: () => {
    set({
      board: createInitialBoard(),
      currentTurn: 'sente',
      senteHand: createEmptyHand(),
      goteHand: createEmptyHand(),
      gameStatus: 'playing',
      winner: null,
      selectedPosition: null,
      legalMoves: [],
      lastMove: null
    });
  },
  
  triggerAIMove: () => {
    const state = get();
    
    // Only AI (gote) should trigger
    if (state.currentTurn !== 'gote') {
      return;
    }
    
    const move = getAIMove(state.board, 'gote', state.goteHand);
    
    if (move) {
      state.makeMove(move);
    }
  }
}));

/**
 * Helper function to get legal moves for a specific piece
 */
function getLegalMovesForPiece(
  board: Board,
  owner: Owner,
  position: { row: number; col: number },
  senteHand: Hand,
  goteHand: Hand
): LegalMove[] {
  const { generateLegalMoves, filterLegalMoves } = require('./moveGenerator');
  const { isUchifuzume } = require('./gameController');
  
  const hand = owner === 'sente' ? senteHand : goteHand;
  const allMoves = generateLegalMoves(board, owner, hand);
  
  // Filter for moves from this position (for piece moves) or drops
  const pieceMoves = allMoves.filter(move => {
    if ('isDrop' in move && move.isDrop) {
      return true; // Include all drops
    }
    return move.from.row === position.row && move.from.col === position.col;
  });
  
  // Filter out moves that leave king in check
  const validMoves = filterLegalMoves(board, owner, pieceMoves, hand);
  
  // Filter out uchifuzume drops
  const finalMoves = validMoves.filter(move => {
    if ('isDrop' in move && move.isDrop) {
      return !isUchifuzume(board, move, hand);
    }
    return true;
  });
  
  return finalMoves;
}
