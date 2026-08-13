'use client';

import React from 'react';
import { Piece as PieceType, Owner, PIECE_DICTIONARY } from '../engine/pieces';
import { themeConfig } from '../config/theme';

interface PieceProps {
  piece: PieceType;
  size?: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export const Piece: React.FC<PieceProps> = ({ 
  piece, 
  size = 50, 
  isSelected = false, 
  onClick 
}) => {
  const dict = PIECE_DICTIONARY[piece.type];
  const isPromoted = piece.isPromoted;
  
  // Get the correct text based on promotion state
  const kanji = isPromoted ? dict.promotedKanji : dict.kanji;
  const english = isPromoted ? dict.promotedEng : dict.eng;
  
  // Determine orientation and rotation
  const isGote = piece.owner === 'gote';
  const rotation = isGote ? 180 : 0;
  
  // Colors based on owner and selection
  const fillColor = isSelected 
    ? themeConfig.colors.selectedPiece 
    : (isGote ? themeConfig.colors.gotePiece : themeConfig.colors.sentePiece);
  
  const strokeColor = themeConfig.colors.pieceStroke;
  
  return (
    <g 
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Piece Shape (Pentagon for Shogi) */}
      <polygon
        points={`0,${-size * 0.45} ${size * 0.4},${size * 0.45} ${-size * 0.4},${size * 0.45}`}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="2"
        transform={`rotate(${rotation})`}
      />
      
      {/* Kanji Text (Large, Top/Center) */}
      <text
        x="0"
        y="-5"
        textAnchor="middle"
        fontSize={size * 0.5}
        fontFamily="serif, 'Noto Serif JP', 'Yu Mincho', sans-serif"
        fill={themeConfig.colors.kanjiText}
        fontWeight="bold"
        transform={`rotate(${rotation})`}
        style={{ pointerEvents: 'none' }}
      >
        {kanji}
      </text>
      
      {/* English Text (Small, Bottom) */}
      <text
        x="0"
        y={size * 0.35}
        textAnchor="middle"
        fontSize={size * 0.18}
        fontFamily="sans-serif, 'Noto Sans JP', Arial"
        fill={themeConfig.colors.englishText}
        transform={`rotate(${rotation})`}
        style={{ pointerEvents: 'none' }}
      >
        {english}
      </text>
    </g>
  );
};
