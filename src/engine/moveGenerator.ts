import { Board, Position, Owner, Piece, PieceType } from './pieces';
import { getPieceAt, cloneBoard, isInPromotionZone } from './board';

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  isDrop?: false;
  promotes?: boolean;
}

export interface DropMove {
  pieceType: PieceType;
  to: Position;
  owner: Owner;
  isDrop: true;
}

export type LegalMove = Move | DropMove;

/**
 * Generate all legal moves for a given owner
 */
export function generateLegalMoves(board: Board, owner: Owner, hand: Hand): LegalMove[] {
  const moves: LegalMove[] = [];
  
  // Generate moves for pieces on board
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.owner === owner) {
        const pieceMoves = generatePieceMoves(board, { row, col }, piece);
        moves.push(...pieceMoves);
      }
    }
  }
  
  // Generate drop moves from hand
  const dropMoves = generateDropMoves(board, owner, hand);
  moves.push(...dropMoves);
  
  return moves;
}

/**
 * Generate all legal moves for a specific piece at a position
 */
function generatePieceMoves(board: Board, from: Position, piece: Piece): Move[] {
  const moves: Move[] = [];
  const deltas = getPieceDeltas(piece.type, piece.owner, piece.isPromoted);
  
  for (const delta of deltas) {
    const to = { row: from.row + delta.row, col: from.col + delta.col };
    
    // Check bounds
    if (to.row < 0 || to.row > 8 || to.col < 0 || to.col > 8) {
      continue;
    }
    
    const targetPiece = board[to.row][to.col];
    
    // Can't capture own pieces
    if (targetPiece && targetPiece.owner === piece.owner) {
      continue;
    }
    
    // For sliding pieces, check path
    if (delta.slide) {
      let blocked = false;
      const steps = Math.max(Math.abs(delta.row), Math.abs(delta.col));
      const stepRow = delta.row === 0 ? 0 : delta.row / Math.abs(delta.row);
      const stepCol = delta.col === 0 ? 0 : delta.col / Math.abs(delta.col);
      
      for (let i = 1; i < steps; i++) {
        const checkRow = from.row + stepRow * i;
        const checkCol = from.col + stepCol * i;
        if (board[checkRow][checkCol]) {
          blocked = true;
          break;
        }
      }
      
      if (blocked) {
        continue;
      }
    }
    
    // Check promotion rules
    const canPromote = canPiecePromote(piece, from, to);
    const mustPromoteValue = mustPromote(piece, from, to);
    
    if (canPromote && !piece.isPromoted) {
      // Optional promotion
      if (!mustPromoteValue) {
        moves.push({
          from,
          to,
          piece: { ...piece },
          isDrop: false,
          promotes: false
        });
      }
      
      // Forced or optional promotion
      moves.push({
        from,
        to,
        piece: { ...piece },
        isDrop: false,
        promotes: true
      });
    } else {
      // No promotion possible
      moves.push({
        from,
        to,
        piece: { ...piece },
        isDrop: false,
        promotes: false
      });
    }
  }
  
  return moves;
}

/**
 * Get movement deltas for a piece type
 */
function getPieceDeltas(
  type: PieceType,
  owner: Owner,
  isPromoted: boolean
): Array<{ row: number; col: number; slide?: boolean }> {
  const forward = owner === 'sente' ? -1 : 1;
  
  if (isPromoted) {
    switch (type) {
      case 'rook':
        // Dragon: Rook moves + 1 step diagonally
        return [
          { row: -1, col: 0, slide: true }, { row: 1, col: 0, slide: true },
          { row: 0, col: -1, slide: true }, { row: 0, col: 1, slide: true },
          { row: -1, col: -1 }, { row: -1, col: 1 },
          { row: 1, col: -1 }, { row: 1, col: 1 }
        ];
      case 'bishop':
        // Horse: Bishop moves + 1 step orthogonally
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
        // Promoted Silver/Knight/Lance/Pawn move like Gold
        return getGoldDeltas(owner);
      default:
        return getGoldDeltas(owner);
    }
  }
  
  switch (type) {
    case 'king':
      return [
        { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
        { row: 0, col: -1 }, { row: 0, col: 1 },
        { row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 }
      ];
    
    case 'gold':
      return getGoldDeltas(owner);
    
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

/**
 * Gold General movement (depends on owner for direction)
 */
function getGoldDeltas(owner: Owner): Array<{ row: number; col: number }> {
  const forward = owner === 'sente' ? -1 : 1;
  return [
    { row: forward, col: -1 }, { row: forward, col: 0 }, { row: forward, col: 1 },
    { row: 0, col: -1 }, { row: 0, col: 1 },
    { row: -forward, col: 0 }
  ];
}

/**
 * Check if a piece can promote when moving from->to
 */
function canPiecePromote(piece: Piece, from: Position, to: Position): boolean {
  if (piece.isPromoted || piece.type === 'king' || piece.type === 'gold') {
    return false;
  }
  
  const ownerPromotionZone = piece.owner === 'sente' ? [0, 1, 2] : [6, 7, 8];
  
  return (
    ownerPromotionZone.includes(from.row) ||
    ownerPromotionZone.includes(to.row)
  );
}

/**
 * Check if a piece MUST promote
 */
export function mustPromote(piece: Piece, from: Position, to: Position): boolean {
  if (piece.isPromoted || piece.type === 'king' || piece.type === 'gold') {
    return false;
  }
  
  const lastRow = piece.owner === 'sente' ? 0 : 8;
  const secondLastRow = piece.owner === 'sente' ? 1 : 7;
  
  // Pawn or Lance reaching last row
  if ((piece.type === 'pawn' || piece.type === 'lance') && to.row === lastRow) {
    return true;
  }
  
  // Knight reaching last or second-to-last row
  if (piece.type === 'knight' && (to.row === lastRow || to.row === secondLastRow)) {
    return true;
  }
  
  return false;
}

/**
 * Generate all legal drop moves from hand
 */
function generateDropMoves(board: Board, owner: Owner, hand: Hand): DropMove[] {
  const moves: DropMove[] = [];
  
  for (const [pieceType, count] of Object.entries(hand)) {
    if (count <= 0) continue;
    
    const type = pieceType as PieceType;
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const to = { row, col };
        
        // Can only drop on empty squares
        if (board[row][col] !== null) {
          continue;
        }
        
        // Check dead square rules
        if (isDeadSquare(type, owner, to)) {
          continue;
        }
        
        // Check Nifu (two pawns in same column)
        if (type === 'pawn' && hasNifu(board, owner, col)) {
          continue;
        }
        
        moves.push({
          pieceType: type,
          to,
          owner,
          isDrop: true
        });
      }
    }
  }
  
  return moves;
}

/**
 * Check if a square is a "dead square" where piece cannot move
 */
function isDeadSquare(type: PieceType, owner: Owner, pos: Position): boolean {
  const lastRow = owner === 'sente' ? 0 : 8;
  const secondLastRow = owner === 'sente' ? 1 : 7;
  
  // Pawn and Lance cannot be dropped on last row
  if ((type === 'pawn' || type === 'lance') && pos.row === lastRow) {
    return true;
  }
  
  // Knight cannot be dropped on last or second-to-last row
  if (type === 'knight' && (pos.row === lastRow || pos.row === secondLastRow)) {
    return true;
  }
  
  return false;
}

/**
 * Check for Nifu (two unpromoted pawns in same column)
 */
function hasNifu(board: Board, owner: Owner, col: number): boolean {
  for (let row = 0; row < 9; row++) {
    const piece = board[row][col];
    if (
      piece &&
      piece.owner === owner &&
      piece.type === 'pawn' &&
      !piece.isPromoted
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Apply a move to the board and return new state
 */
export function applyMove(
  board: Board,
  move: LegalMove,
  hand: Hand
): { board: Board; hand: Hand; capturedPiece: Piece | null } {
  const newBoard = cloneBoard(board);
  const newHand = { ...hand };
  let capturedPiece: Piece | null = null;
  
  if ('isDrop' in move && move.isDrop) {
    // Drop move
    const dropMove = move as DropMove;
    newBoard[dropMove.to.row][dropMove.to.col] = {
      type: dropMove.pieceType,
      owner: dropMove.owner,
      isPromoted: false
    };
    newHand[dropMove.pieceType]--;
  } else {
    // Regular move
    const regularMove = move as Move;
    const targetPiece = newBoard[regularMove.to.row][regularMove.to.col];
    
    // Capture
    if (targetPiece) {
      capturedPiece = targetPiece;
      // Add to hand (unpromoted)
      const unpromotedType = targetPiece.type;
      newHand[unpromotedType] = (newHand[unpromotedType] || 0) + 1;
    }
    
    // Move piece
    newBoard[regularMove.from.row][regularMove.from.col] = null;
    
    if (regularMove.promotes) {
      newBoard[regularMove.to.row][regularMove.to.col] = {
        ...regularMove.piece,
        isPromoted: true
      };
    } else {
      newBoard[regularMove.to.row][regularMove.to.col] = regularMove.piece;
    }
  }
  
  return { board: newBoard, hand: newHand, capturedPiece };
}

export interface Hand {
  king: number;
  rook: number;
  bishop: number;
  gold: number;
  silver: number;
  knight: number;
  lance: number;
  pawn: number;
}

export function createEmptyHand(): Hand {
  return {
    king: 0,
    rook: 0,
    bishop: 0,
    gold: 0,
    silver: 0,
    knight: 0,
    lance: 0,
    pawn: 0
  };
}
