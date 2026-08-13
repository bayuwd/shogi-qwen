// src/engine/board.ts
// Pure TypeScript - No React/DOM dependencies
// Immutable board operations

import { Piece, Owner, PieceType, createPiece } from './pieces';

export type Board = (Piece | null)[][];

export interface Position {
  row: number;
  col: number;
}

/**
 * Create the initial Shogi board setup
 * 
 * Board layout (9x9):
 * - Rows 0-2: Gote's pieces (top, moves downward)
 * - Rows 3-5: Empty
 * - Rows 6-8: Sente's pieces (bottom, moves upward)
 * 
 * Standard Shogi starting position:
 * Row 0 (Gote back rank): Lance, Knight, Silver, Gold, King, Gold, Silver, Knight, Lance
 * Row 1 (Gote): Empty, Rook, Empty, Empty, Empty, Empty, Empty, Bishop, Empty
 * Row 2 (Gote pawns): Pawn x9
 * Rows 3-5: Empty
 * Row 6 (Sente pawns): Pawn x9
 * Row 7 (Sente): Empty, Bishop, Empty, Empty, Empty, Empty, Empty, Rook, Empty
 * Row 8 (Sente back rank): Lance, Knight, Silver, Gold, King, Gold, Silver, Knight, Lance
 */
export function createInitialBoard(): Board {
  const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));

  // Place Gote pieces (owner: 'gote', rows 0-2)
  placeGotePieces(board);

  // Place Sente pieces (owner: 'sente', rows 6-8)
  placeSentePieces(board);

  return board;
}

function placeGotePieces(board: Board): void {
  const gote: Owner = 'gote';

  // Row 0: Back rank pieces
  const backRank: PieceType[] = ['lance', 'knight', 'silver', 'gold', 'king', 'gold', 'silver', 'knight', 'lance'];
  for (let col = 0; col < 9; col++) {
    board[0][col] = createPiece(backRank[col], gote, false);
  }

  // Row 1: Rook and Bishop
  board[1][1] = createPiece('rook', gote, false);
  board[1][7] = createPiece('bishop', gote, false);

  // Row 2: Pawns
  for (let col = 0; col < 9; col++) {
    board[2][col] = createPiece('pawn', gote, false);
  }
}

function placeSentePieces(board: Board): void {
  const sente: Owner = 'sente';

  // Row 8: Back rank pieces (mirrored from Gote)
  const backRank: PieceType[] = ['lance', 'knight', 'silver', 'gold', 'king', 'gold', 'silver', 'knight', 'lance'];
  for (let col = 0; col < 9; col++) {
    board[8][col] = createPiece(backRank[col], sente, false);
  }

  // Row 7: Bishop and Rook (mirrored from Gote)
  board[7][1] = createPiece('bishop', sente, false);
  board[7][7] = createPiece('rook', sente, false);

  // Row 6: Pawns
  for (let col = 0; col < 9; col++) {
    board[6][col] = createPiece('pawn', sente, false);
  }
}

/**
 * Get a piece at a position (immutable read)
 */
export function getPieceAt(board: Board, pos: Position): Piece | null {
  if (pos.row < 0 || pos.row >= 9 || pos.col < 0 || pos.col >= 9) {
    return null;
  }
  return board[pos.row][pos.col];
}

/**
 * Place a piece on the board (returns new board - immutable)
 */
export function placePiece(board: Board, pos: Position, piece: Piece | null): Board {
  if (pos.row < 0 || pos.row >= 9 || pos.col < 0 || pos.col >= 9) {
    throw new Error(`Invalid position: ${pos.row}, ${pos.col}`);
  }

  const newBoard = board.map(row => [...row]);
  newBoard[pos.row][pos.col] = piece;
  return newBoard;
}

/**
 * Move a piece from one position to another (returns new board - immutable)
 * Does NOT handle capture logic or promotion - those are handled by gameController
 */
export function movePiece(board: Board, from: Position, to: Position): Board {
  const piece = getPieceAt(board, from);
  if (!piece) {
    throw new Error(`No piece at position: ${from.row}, ${from.col}`);
  }

  let newBoard = board.map(row => [...row]);
  
  // Clear source
  newBoard[from.row][from.col] = null;
  
  // Place at destination (captures any existing piece - caller handles capture logic)
  newBoard[to.row][to.col] = piece;
  
  return newBoard;
}

/**
 * Check if a position is within the board bounds
 */
export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 9 && pos.col >= 0 && pos.col < 9;
}

/**
 * Check if a position is in the promotion zone for a given owner
 * Promotion zone: last 3 rows farthest from the player
 * - Sente: rows 0, 1, 2
 * - Gote: rows 6, 7, 8
 */
export function isInPromotionZone(pos: Position, owner: Owner): boolean {
  if (owner === 'sente') {
    return pos.row <= 2;
  } else {
    return pos.row >= 6;
  }
}

/**
 * Find all pieces of a specific owner on the board
 */
export function findPiecesByOwner(board: Board, owner: Owner): { piece: Piece; position: Position }[] {
  const result: { piece: Piece; position: Position }[] = [];
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.owner === owner) {
        result.push({ piece, position: { row, col } });
      }
    }
  }
  
  return result;
}

/**
 * Find the king of a specific owner
 */
export function findKing(board: Board, owner: Owner): Position | null {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.owner === owner) {
        return { row, col };
      }
    }
  }
  return null;
}

/**
 * Deep clone a board (for immutable operations)
 */
export function cloneBoard(board: Board): Board {
  return board.map(row => row.map(piece => (piece ? { ...piece } : null)));
}
