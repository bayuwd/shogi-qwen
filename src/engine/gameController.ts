import { Board, Position, Owner, Piece } from './pieces';
import { LegalMove, Move, DropMove, applyMove, Hand } from './moveGenerator';
import { getPieceAt, findKing } from './board';

/**
 * Check if the given owner's king is in check
 */
export function isInCheck(board: Board, owner: Owner): boolean {
  const kingPos = findKing(board, owner);
  if (!kingPos) return false;
  
  return isSquareAttacked(board, kingPos, owner === 'sente' ? 'gote' : 'sente');
}

/**
 * Check if a square is attacked by any piece of the attacking owner
 */
export function isSquareAttacked(board: Board, pos: Position, attacker: Owner): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.owner === attacker) {
        if (canPieceAttackSquare(board, { row, col }, piece, pos)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Check if a specific piece can attack a specific square
 */
function canPieceAttackSquare(
  board: Board,
  from: Position,
  piece: Piece,
  target: Position
): boolean {
  const deltas = getAttackDeltas(piece);
  
  for (const delta of deltas) {
    // For sliding pieces, trace the path
    if (delta.slide) {
      const steps = Math.max(Math.abs(delta.row), Math.abs(delta.col));
      const stepRow = delta.row === 0 ? 0 : delta.row / Math.abs(delta.row);
      const stepCol = delta.col === 0 ? 0 : delta.col / Math.abs(delta.col);
      
      for (let i = 1; i <= steps; i++) {
        const checkRow = from.row + stepRow * i;
        const checkCol = from.col + stepCol * i;
        
        if (checkRow === target.row && checkCol === target.col) {
          return true;
        }
        
        // Stop if blocked
        if (board[checkRow][checkCol]) {
          break;
        }
      }
    } else {
      // Non-sliding piece
      const toRow = from.row + delta.row;
      const toCol = from.col + delta.col;
      
      if (toRow === target.row && toCol === target.col) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Get attack deltas for a piece (what squares it can attack)
 */
function getAttackDeltas(piece: Piece): Array<{ row: number; col: number; slide?: boolean }> {
  const forward = piece.owner === 'sente' ? -1 : 1;
  
  if (piece.isPromoted) {
    switch (piece.type) {
      case 'rook':
        return [
          { row: -1, col: 0, slide: true }, { row: 1, col: 0, slide: true },
          { row: 0, col: -1, slide: true }, { row: 0, col: 1, slide: true },
          { row: -1, col: -1 }, { row: -1, col: 1 },
          { row: 1, col: -1 }, { row: 1, col: 1 }
        ];
      case 'bishop':
        return [
          { row: -1, col: -1, slide: true }, { row: -1, col: 1, slide: true },
          { row: 1, col: -1, slide: true }, { row: 1, col: 1, slide: true },
          { row: -1, col: 0 }, { row: 1, col: 0 },
          { row: 0, col: -1 }, { row: 0, col: 1 }
        ];
      case 'silver':
      case 'knight':
      case 'lance':
      case 'pawn':
        return getGoldDeltas(piece.owner);
      default:
        return getGoldDeltas(piece.owner);
    }
  }
  
  switch (piece.type) {
    case 'king':
      return [
        { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
        { row: 0, col: -1 }, { row: 0, col: 1 },
        { row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 }
      ];
    
    case 'gold':
      return getGoldDeltas(piece.owner);
    
    case 'silver':
      return [
        { row: forward, col: -1 }, { row: forward, col: 0 }, { row: forward, col: 1 },
        { row: 0, col: -1 }, { row: 0, col: 1 },
        { row: -forward, col: 0 }
      ];
    
    case 'knight':
      return [
        { row: forward * 2, col: -1 },
        { row: forward * 2, col: 1 }
      ];
    
    case 'lance':
      return [{ row: forward, col: 0, slide: true }];
    
    case 'pawn':
      return [{ row: forward, col: 0 }];
    
    case 'rook':
      return [
        { row: -1, col: 0, slide: true }, { row: 1, col: 0, slide: true },
        { row: 0, col: -1, slide: true }, { row: 0, col: 1, slide: true }
      ];
    
    case 'bishop':
      return [
        { row: -1, col: -1, slide: true }, { row: -1, col: 1, slide: true },
        { row: 1, col: -1, slide: true }, { row: 1, col: 1, slide: true }
      ];
    
    default:
      return [];
  }
}

function getGoldDeltas(owner: Owner): Array<{ row: number; col: number }> {
  const forward = owner === 'sente' ? -1 : 1;
  return [
    { row: forward, col: -1 }, { row: forward, col: 0 }, { row: forward, col: 1 },
    { row: 0, col: -1 }, { row: 0, col: 1 },
    { row: -forward, col: 0 }
  ];
}

/**
 * Filter moves that would leave own king in check
 */
export function filterLegalMoves(
  board: Board,
  owner: Owner,
  moves: LegalMove[],
  hand: Hand
): LegalMove[] {
  return moves.filter(move => {
    const { board: newBoard } = applyMove(board, move, hand);
    return !isInCheck(newBoard, owner);
  });
}

/**
 * Check for Uchifuzume (drop pawn mate)
 * ILLEGAL to drop a pawn if it causes immediate checkmate
 */
export function isUchifuzume(
  board: Board,
  dropMove: DropMove,
  hand: Hand
): boolean {
  if (dropMove.pieceType !== 'pawn') {
    return false;
  }
  
  // Apply the drop
  const { board: newBoard } = applyMove(board, dropMove, hand);
  const opponent = dropMove.owner === 'sente' ? 'gote' : 'sente';
  
  // Check if it puts opponent in check
  if (!isInCheck(newBoard, opponent)) {
    return false;
  }
  
  // Check if opponent has ANY legal move to escape
  const { generateLegalMoves } = require('./moveGenerator');
  const opponentMoves = generateLegalMoves(newBoard, opponent, hand);
  const validMoves = filterLegalMoves(newBoard, opponent, opponentMoves, hand);
  
  return validMoves.length === 0;
}

/**
 * Check if current position is checkmate
 */
export function isCheckmate(board: Board, owner: Owner, hand: Hand): boolean {
  if (!isInCheck(board, owner)) {
    return false;
  }
  
  const { generateLegalMoves } = require('./moveGenerator');
  const moves = generateLegalMoves(board, owner, hand);
  const validMoves = filterLegalMoves(board, owner, moves, hand);
  
  // Filter out uchifuzume drops
  const finalMoves = validMoves.filter(move => {
    if ('isDrop' in move && move.isDrop) {
      return !isUchifuzume(board, move, hand);
    }
    return true;
  });
  
  return finalMoves.length === 0;
}

/**
 * Check if current position is stalemate (not in check but no legal moves)
 * Note: Stalemate is rare in Shogi but possible
 */
export function isStalemate(board: Board, owner: Owner, hand: Hand): boolean {
  if (isInCheck(board, owner)) {
    return false;
  }
  
  const { generateLegalMoves } = require('./moveGenerator');
  const moves = generateLegalMoves(board, owner, hand);
  const validMoves = filterLegalMoves(board, owner, moves, hand);
  
  // Filter out uchifuzume drops
  const finalMoves = validMoves.filter(move => {
    if ('isDrop' in move && move.isDrop) {
      return !isUchifuzume(board, move, hand);
    }
    return true;
  });
  
  return finalMoves.length === 0;
}

/**
 * Get game status
 */
export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate';

export function getGameStatus(
  board: Board,
  currentTurn: Owner,
  hand: { sente: Hand; gote: Hand }
): GameStatus {
  const currentHand = hand[currentTurn];
  
  if (isCheckmate(board, currentTurn, currentHand)) {
    return 'checkmate';
  }
  
  if (isStalemate(board, currentTurn, currentHand)) {
    return 'stalemate';
  }
  
  if (isInCheck(board, currentTurn)) {
    return 'check';
  }
  
  return 'playing';
}
