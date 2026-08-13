import { Board, Owner, PieceType } from './pieces';
import { LegalMove, Move, DropMove, Hand, generateLegalMoves } from './moveGenerator';
import { filterLegalMoves, isSquareAttacked, isInCheck } from './gameController';

/**
 * Piece values for AI evaluation
 */
const PIECE_VALUES: Record<PieceType, number> = {
  king: 10000,
  rook: 10,
  bishop: 8,
  gold: 6,
  silver: 5,
  knight: 4,
  lance: 3,
  pawn: 1
};

/**
 * Priority tiers for move selection
 */
enum MovePriority {
  CHECKMATE = 100,      // Winning move
  CHECK = 50,           // Puts opponent in check
  CAPTURE_HIGH = 40,    // Captures high-value piece
  CAPTURE_MEDIUM = 30,  // Captures medium-value piece
  CAPTURE_LOW = 20,     // Captures low-value piece
  DEFEND_KING = 25,     // Moves king out of danger
  DROP_DEFEND = 20,     // Drop that defends own king
  NORMAL = 10,          // Regular move
  PROMOTION = 15        // Promotes a piece
}

/**
 * Smart Semi-Random AI
 * Generates all legal moves and prioritizes:
 * 1. Moves that check the opponent
 * 2. Moves that capture high-value pieces
 * 3. Drops that defend own king
 * 4. Random selection from highest priority tier
 */
export function getAIMove(
  board: Board,
  owner: Owner,
  hand: Hand
): LegalMove | null {
  const opponent = owner === 'sente' ? 'gote' : 'sente';
  
  // Generate all legal moves
  const allMoves = generateLegalMoves(board, owner, hand);
  if (allMoves.length === 0) {
    return null;
  }
  
  // Filter moves that don't leave own king in check
  const validMoves = filterLegalMoves(board, owner, allMoves, hand);
  if (validMoves.length === 0) {
    return null;
  }
  
  // Calculate priority for each move
  const movePriorities = validMoves.map(move => ({
    move,
    priority: calculateMovePriority(board, move, owner, opponent, hand)
  }));
  
  // Find the highest priority
  const maxPriority = Math.max(...movePriorities.map(mp => mp.priority));
  
  // Get all moves with the highest priority
  const bestMoves = movePriorities.filter(mp => mp.priority === maxPriority);
  
  // Randomly select from the best moves
  const randomIndex = Math.floor(Math.random() * bestMoves.length);
  return bestMoves[randomIndex].move;
}

/**
 * Calculate priority score for a move
 */
function calculateMovePriority(
  board: Board,
  move: LegalMove,
  owner: Owner,
  opponent: Owner,
  hand: Hand
): number {
  const { applyMove } = require('./moveGenerator');
  const { isInCheck: checkAfterMove } = require('./gameController');
  
  // Apply the move to see resulting state
  const { board: newBoard, capturedPiece } = applyMove(board, move, hand);
  
  let priority = MovePriority.NORMAL;
  
  // Check if this move puts opponent in check
  if (isInCheck(newBoard, opponent)) {
    priority = Math.max(priority, MovePriority.CHECK);
  }
  
  // Check if this move captures a piece
  if (capturedPiece) {
    const captureValue = PIECE_VALUES[capturedPiece.type];
    if (captureValue >= PIECE_VALUES.rook) {
      priority = Math.max(priority, MovePriority.CAPTURE_HIGH);
    } else if (captureValue >= PIECE_VALUES.silver) {
      priority = Math.max(priority, MovePriority.CAPTURE_MEDIUM);
    } else {
      priority = Math.max(priority, MovePriority.CAPTURE_LOW);
    }
  }
  
  // Check if this is a promotion
  if ('promotes' in move && move.promotes) {
    priority = Math.max(priority, MovePriority.PROMOTION);
  }
  
  // Check if this move defends own king (moves out of attack)
  if (isKingInDanger(board, owner)) {
    if (!isKingInDanger(newBoard, owner)) {
      priority = Math.max(priority, MovePriority.DEFEND_KING);
    }
  }
  
  // Bonus for drop moves that defend key squares near own king
  if ('isDrop' in move && move.isDrop) {
    if (isDefensiveDrop(board, move, owner)) {
      priority = Math.max(priority, MovePriority.DROP_DEFEND);
    }
  }
  
  return priority;
}

/**
 * Check if the king is currently under threat
 */
function isKingInDanger(board: Board, owner: Owner): boolean {
  const kingPos = findKingPosition(board, owner);
  if (!kingPos) return false;
  
  const opponent = owner === 'sente' ? 'gote' : 'sente';
  return isSquareAttacked(board, kingPos, opponent);
}

/**
 * Find king position
 */
function findKingPosition(board: Board, owner: Owner): { row: number; col: number } | null {
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
 * Check if a drop move helps defend the king
 */
function isDefensiveDrop(board: Board, move: DropMove, owner: Owner): boolean {
  const kingPos = findKingPosition(board, owner);
  if (!kingPos) return false;
  
  // Calculate distance from king
  const rowDist = Math.abs(move.to.row - kingPos.row);
  const colDist = Math.abs(move.to.col - kingPos.col);
  
  // Drop within 2 squares of king is considered defensive
  return rowDist <= 2 && colDist <= 2;
}

/**
 * Get a simple evaluation score for a board position
 * Positive = good for sente, Negative = good for gote
 */
export function evaluateBoard(board: Board, senteHand: Hand, goteHand: Hand): number {
  let score = 0;
  
  // Evaluate pieces on board
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece) {
        const value = PIECE_VALUES[piece.type];
        const promotedBonus = piece.isPromoted ? 2 : 0;
        
        if (piece.owner === 'sente') {
          score += value + promotedBonus;
        } else {
          score -= value + promotedBonus;
        }
      }
    }
  }
  
  // Evaluate hands (captured pieces)
  for (const [pieceType, count] of Object.entries(senteHand)) {
    score += PIECE_VALUES[pieceType as PieceType] * count;
  }
  
  for (const [pieceType, count] of Object.entries(goteHand)) {
    score -= PIECE_VALUES[pieceType as PieceType] * count;
  }
  
  return score;
}
