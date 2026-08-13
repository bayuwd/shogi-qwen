'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { Board } from './Board';
import { Komadai } from './Komadai';
import { themeConfig } from '../config/theme';

export const GameUI: React.FC = () => {
  const {
    board,
    currentTurn,
    selectedPos,
    selectedHandPiece,
    senteHand,
    goteHand,
    legalMoves,
    gameStatus,
    winner,
    selectSquare,
    selectHandPiece,
    makeMove,
    triggerAIMove,
    resetGame,
  } = useGameStore();
  
  // Trigger AI move when it's Gote's turn
  useEffect(() => {
    if (currentTurn === 'gote' && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        triggerAIMove();
      }, 500); // Small delay for better UX
      
      return () => clearTimeout(timer);
    }
  }, [currentTurn, gameStatus, triggerAIMove]);
  
  // Handle square click
  const handleSquareClick = (row: number, col: number) => {
    if (gameStatus !== 'playing') return;
    
    // If player is selecting a piece from hand to drop
    if (selectedHandPiece) {
      makeMove({ 
        type: 'drop',
        pieceType: selectedHandPiece,
        toRow: row,
        toCol: col,
      });
      return;
    }
    
    // Select/deselect piece or make move
    selectSquare(row, col);
  };
  
  // Handle hand piece selection
  const handleHandPieceClick = (pieceType: any) => {
    if (gameStatus !== 'playing' || currentTurn !== 'sente') return;
    selectHandPiece(pieceType);
  };
  
  // Get status message
  const getStatusMessage = () => {
    if (winner) {
      return winner === 'sente' ? 'Sente Wins!' : 'Gote Wins!';
    }
    
    switch (gameStatus) {
      case 'check':
        return `${currentTurn === 'sente' ? 'Sente' : 'Gote'} is in Check!`;
      case 'checkmate':
        return `Checkmate! ${winner === 'sente' ? 'Sente' : 'Gote'} wins!`;
      case 'stalemate':
        return 'Stalemate!';
      default:
        return `${currentTurn === 'sente' ? 'Sente' : 'Gote'}'s Turn`;
    }
  };
  
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: themeConfig.colors.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Header */}
      <h1
        style={{
          color: themeConfig.colors.textPrimary,
          marginBottom: '10px',
          fontSize: '28px',
          fontWeight: 'bold',
        }}
      >
        Shogi - Player vs AI
      </h1>
      
      {/* Status Bar */}
      <div
        style={{
          backgroundColor: themeConfig.colors.statusBackground,
          padding: '10px 20px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: themeConfig.colors.statusShadow,
        }}
      >
        <span
          style={{
            color: themeConfig.colors.textPrimary,
            fontSize: '18px',
            fontWeight: '600',
          }}
        >
          {getStatusMessage()}
        </span>
      </div>
      
      {/* Game Area */}
      <div
        style={{
          display: 'flex',
          gap: '30px',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {/* Gote Hand (AI) */}
        <div style={{ alignSelf: 'flex-start' }}>
          <Komadai
            hand={goteHand}
            owner="gote"
            selectedPiece={null} // AI doesn't select from hand in UI
            onPieceClick={() => {}}
          />
        </div>
        
        {/* Board */}
        <div>
          <Board
            board={board}
            selectedPos={selectedPos}
            legalMoves={legalMoves}
            onSquareClick={handleSquareClick}
          />
        </div>
        
        {/* Sente Hand (Player) */}
        <div style={{ alignSelf: 'flex-end' }}>
          <Komadai
            hand={senteHand}
            owner="sente"
            selectedPiece={selectedHandPiece}
            onPieceClick={handleHandPieceClick}
          />
        </div>
      </div>
      
      {/* Controls */}
      <div
        style={{
          marginTop: '30px',
          display: 'flex',
          gap: '15px',
        }}
      >
        <button
          onClick={resetGame}
          style={{
            backgroundColor: themeConfig.colors.buttonPrimary,
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          New Game
        </button>
        
        {selectedHandPiece && (
          <button
            onClick={() => selectHandPiece(null)}
            style={{
              backgroundColor: themeConfig.colors.buttonSecondary,
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            Cancel Drop
          </button>
        )}
      </div>
      
      {/* Instructions */}
      <div
        style={{
          marginTop: '20px',
          maxWidth: '600px',
          textAlign: 'center',
          color: themeConfig.colors.textSecondary,
          fontSize: '14px',
          lineHeight: '1.6',
        }}
      >
        <p><strong>How to play:</strong> Click a piece to select it, then click a highlighted square to move.</p>
        <p>Click a piece in your hand (bottom right) to drop it on the board.</p>
        <p>You are <strong>Sente</strong> (First player, moves upward). AI is <strong>Gote</strong>.</p>
      </div>
    </div>
  );
};
