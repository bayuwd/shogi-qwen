'use client';

import React from 'react';
import { Board as BoardType, Piece } from '../engine/board';
import { Move } from '../engine/moveGenerator';
import { Piece as PieceComponent } from './Piece';
import { themeConfig } from '../config/theme';

interface BoardProps {
  board: BoardType;
  selectedPos: { row: number; col: number } | null;
  legalMoves: Move[];
  onSquareClick: (row: number, col: number) => void;
}

export const Board: React.FC<BoardProps> = ({
  board,
  selectedPos,
  legalMoves,
  onSquareClick,
}) => {
  const BOARD_SIZE = 9;
  const CELL_SIZE = 60;
  const PADDING = 20;
  
  // Calculate SVG dimensions
  const width = BOARD_SIZE * CELL_SIZE + PADDING * 2;
  const height = BOARD_SIZE * CELL_SIZE + PADDING * 2;
  
  // Helper to check if a position is in legal moves
  const isLegalMove = (row: number, col: number): boolean => {
    return legalMoves.some(move => move.toRow === row && move.toCol === col);
  };
  
  // Render grid lines
  const renderGrid = () => {
    const lines = [];
    
    // Vertical lines
    for (let i = 0; i <= BOARD_SIZE; i++) {
      lines.push(
        <line
          key={`v-${i}`}
          x1={PADDING + i * CELL_SIZE}
          y1={PADDING}
          x2={PADDING + i * CELL_SIZE}
          y2={PADDING + BOARD_SIZE * CELL_SIZE}
          stroke={themeConfig.colors.gridLine}
          strokeWidth="1.5"
        />
      );
    }
    
    // Horizontal lines
    for (let i = 0; i <= BOARD_SIZE; i++) {
      lines.push(
        <line
          key={`h-${i}`}
          x1={PADDING}
          y1={PADDING + i * CELL_SIZE}
          x2={PADDING + BOARD_SIZE * CELL_SIZE}
          y2={PADDING + i * CELL_SIZE}
          stroke={themeConfig.colors.gridLine}
          strokeWidth="1.5"
        />
      );
    }
    
    return lines;
  };
  
  // Render star points (Hoshi)
  const renderStarPoints = () => {
    const stars = [
      { row: 2, col: 2 },
      { row: 2, col: 6 },
      { row: 6, col: 2 },
      { row: 6, col: 6 },
      { row: 4, col: 4 },
    ];
    
    return stars.map((star, idx) => (
      <circle
        key={`star-${idx}`}
        cx={PADDING + star.col * CELL_SIZE + CELL_SIZE / 2}
        cy={PADDING + star.row * CELL_SIZE + CELL_SIZE / 2}
        r="4"
        fill={themeConfig.colors.starPoint}
      />
    ));
  };
  
  // Render legal move indicators
  const renderLegalMoveIndicators = () => {
    return legalMoves.map((move, idx) => (
      <circle
        key={`move-${idx}`}
        cx={PADDING + move.toCol * CELL_SIZE + CELL_SIZE / 2}
        cy={PADDING + move.toRow * CELL_SIZE + CELL_SIZE / 2}
        r="8"
        fill={themeConfig.colors.legalMoveIndicator}
        opacity="0.6"
      />
    ));
  };
  
  // Render pieces
  const renderPieces = () => {
    const pieces = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        if (piece) {
          const isSelected = selectedPos?.row === row && selectedPos?.col === col;
          const x = PADDING + col * CELL_SIZE + CELL_SIZE / 2;
          const y = PADDING + row * CELL_SIZE + CELL_SIZE / 2;
          
          pieces.push(
            <g
              key={`piece-${row}-${col}`}
              transform={`translate(${x}, ${y})`}
            >
              <PieceComponent
                piece={piece}
                size={CELL_SIZE * 0.85}
                isSelected={isSelected}
                onClick={() => onSquareClick(row, col)}
              />
            </g>
          );
        }
      }
    }
    
    return pieces;
  };
  
  // Render clickable squares for empty positions
  const renderEmptySquares = () => {
    const squares = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (!board[row][col]) {
          const x = PADDING + col * CELL_SIZE;
          const y = PADDING + row * CELL_SIZE;
          
          squares.push(
            <rect
              key={`empty-${row}-${col}`}
              x={x}
              y={y}
              width={CELL_SIZE}
              height={CELL_SIZE}
              fill="transparent"
              onClick={() => onSquareClick(row, col)}
              style={{ cursor: 'pointer' }}
            />
          );
        }
      }
    }
    
    return squares;
  };
  
  return (
    <svg
      width={width}
      height={height}
      style={{ 
        backgroundColor: themeConfig.colors.boardBackground,
        borderRadius: '8px',
        boxShadow: themeConfig.colors.boardShadow
      }}
    >
      {renderGrid()}
      {renderStarPoints()}
      {renderLegalMoveIndicators()}
      {renderEmptySquares()}
      {renderPieces()}
    </svg>
  );
};
