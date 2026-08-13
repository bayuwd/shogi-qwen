// src/engine/pieces.ts
// Pure TypeScript - No React/DOM dependencies

export type Owner = 'sente' | 'gote';

export type PieceType = 
  | 'king'
  | 'rook'
  | 'bishop'
  | 'gold'
  | 'silver'
  | 'knight'
  | 'lance'
  | 'pawn';

export interface Piece {
  readonly type: PieceType;
  readonly owner: Owner;
  readonly promoted: boolean;
}

export interface PieceDefinition {
  kanji: string;
  english: string;
  promotedKanji?: string;
  promotedEnglish?: string;
}

export const PIECE_DICTIONARY: Record<PieceType, PieceDefinition> = {
  king: {
    kanji: '王',
    english: 'King',
    // Note: Gote King uses 玉 instead of 王, handled separately in rendering
  },
  rook: {
    kanji: '飛',
    english: 'Rook',
    promotedKanji: '龍',
    promotedEnglish: 'Dragon',
  },
  bishop: {
    kanji: '角',
    english: 'Bishop',
    promotedKanji: '馬',
    promotedEnglish: 'Horse',
  },
  gold: {
    kanji: '金',
    english: 'Gold',
    // Gold cannot promote
  },
  silver: {
    kanji: '銀',
    english: 'Silver',
    promotedKanji: '全',
    promotedEnglish: 'Prom. Silver',
  },
  knight: {
    kanji: '桂',
    english: 'Knight',
    promotedKanji: '圭',
    promotedEnglish: 'Prom. Knight',
  },
  lance: {
    kanji: '香',
    english: 'Lance',
    promotedKanji: '杏',
    promotedEnglish: 'Prom. Lance',
  },
  pawn: {
    kanji: '歩',
    english: 'Pawn',
    promotedKanji: 'と',
    promotedEnglish: 'Prom. Pawn',
  },
};

/**
 * Get the display text for a piece based on its promotion state
 * @returns { kanji: string, english: string }
 */
export function getPieceText(piece: Piece, isGoteKing: boolean = false): { kanji: string; english: string } {
  // Special case: Gote King uses 玉 instead of 王
  if (piece.type === 'king' && piece.owner === 'gote' && isGoteKing) {
    return { kanji: '玉', english: 'King' };
  }

  const definition = PIECE_DICTIONARY[piece.type];

  if (piece.promoted && definition.promotedKanji && definition.promotedEnglish) {
    return {
      kanji: definition.promotedKanji,
      english: definition.promotedEnglish,
    };
  }

  return {
    kanji: definition.kanji,
    english: definition.english,
  };
}

/**
 * Create a new piece instance
 */
export function createPiece(type: PieceType, owner: Owner, promoted: boolean = false): Piece {
  return { type, owner, promoted };
}

/**
 * Check if a piece can promote (based on type)
 */
export function canPiecePromote(type: PieceType): boolean {
  return type !== 'king' && type !== 'gold';
}

/**
 * Check if a piece must promote (forced promotion rules)
 * @param type - Piece type
 * @param row - Row index (0-8, from Gote's perspective)
 * @param owner - Piece owner
 * @param isEntering - Whether the piece is entering the promotion zone via drop/move
 */
export function mustPromote(type: PieceType, row: number, owner: Owner): boolean {
  // Promotion zone for Sente: rows 0, 1, 2
  // Promotion zone for Gote: rows 6, 7, 8
  
  if (owner === 'sente') {
    // Sente moves upward (decreasing row index)
    // Must promote if:
    // - Pawn or Lance reaches row 0 (furthest row)
    // - Knight reaches row 0 or 1 (cannot move further)
    if ((type === 'pawn' || type === 'lance') && row === 0) {
      return true;
    }
    if (type === 'knight' && row <= 1) {
      return true;
    }
  } else {
    // Gote moves downward (increasing row index)
    // Must promote if:
    // - Pawn or Lance reaches row 8 (furthest row)
    // - Knight reaches row 7 or 8 (cannot move further)
    if ((type === 'pawn' || type === 'lance') && row === 8) {
      return true;
    }
    if (type === 'knight' && row >= 7) {
      return true;
    }
  }
  
  return false;
}

/**
 * Promote a piece (returns new piece instance - immutable)
 */
export function promotePiece(piece: Piece): Piece {
  if (!canPiecePromote(piece.type)) {
    return piece; // Cannot promote
  }
  return { ...piece, promoted: true };
}
