'use client';

import React from 'react';
import { Hand, Piece } from '../engine/pieces';
import { Piece as PieceComponent } from './Piece';
import { themeConfig } from '../config/theme';

interface KomadaiProps {
  hand: Hand;
  owner: 'sente' | 'gote';
  selectedPiece: Piece['type'] | null;
  onPieceClick: (pieceType: Piece['type']) => void;
}

export const Komadai: React.FC<KomadaiProps> = ({
  hand,
  owner,
  selectedPiece,
  onPieceClick,
}) => {
  const isSente = owner === 'sente';
  
  // Convert hand object to array for rendering
  const piecesInHand: { type: Piece['type']; count: number }[] = [];
  
  // Define the order of pieces to display (by value/importance)
  const pieceOrder: Piece['type'][] = [
    'rook', 'bishop', 'gold', 'silver', 'knight', 'lance', 'pawn'
  ];
  
  for (const type of pieceOrder) {
    const count = hand[type] || 0;
    if (count > 0) {
      piecesInHand.push({ type, count });
    }
  }
  
  if (piecesInHand.length === 0) {
    return null;
  }
  
  return (
    <div
      style={{
        backgroundColor: themeConfig.colors.handBackground,
        borderRadius: '8px',
        padding: '12px',
        minWidth: '120px',
        boxShadow: themeConfig.colors.handShadow,
        border: `2px solid ${themeConfig.colors.handBorder}`,
      }}
    >
      <h3
        style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          color: themeConfig.colors.textPrimary,
          textAlign: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {isSente ? 'Sente Hand' : 'Gote Hand'}
      </h3>
      
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center',
        }}
      >
        {piecesInHand.map(({ type, count }) => {
          const isSelected = selectedPiece === type;
          
          // Create a dummy piece for rendering
          const dummyPiece: Piece = {
            type,
            owner,
            isPromoted: false,
          };
          
          return (
            <div
              key={type}
              onClick={() => onPieceClick(type)}
              style={{
                position: 'relative',
                cursor: 'pointer',
                opacity: isSelected ? 1 : 0.8,
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="50" height="50">
                <PieceComponent
                  piece={dummyPiece}
                  size={45}
                  isSelected={isSelected}
                />
              </svg>
              
              {/* Count badge */}
              {count > 1 && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-5px',
                    right: '-5px',
                    backgroundColor: themeConfig.colors.countBadge,
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    border: `2px solid ${themeConfig.colors.pieceStroke}`,
                  }}
                >
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
