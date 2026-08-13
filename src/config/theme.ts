/**
 * Theme Configuration for Shogi MVP
 * 
 * All colors, dimensions, and visual properties are centralized here
 * to enable easy customization and skin support in the future.
 */

export const themeConfig = {
  // ===== Colors =====
  colors: {
    // Board
    boardBackground: '#E8D0AA', // Traditional wood color
    gridLine: '#5C4033',
    starPoint: '#5C4033',
    
    // Pieces
    sentePiece: '#F5DEB3', // Light wheat for player
    gotePiece: '#DEB887', // Slightly darker for AI
    pieceStroke: '#3D2817',
    selectedPiece: '#FFD700', // Gold highlight
    
    // Text
    kanjiText: '#1a1a1a',
    englishText: '#666666',
    
    // Indicators
    legalMoveIndicator: '#4CAF50', // Green dots
    lastMoveHighlight: 'rgba(76, 175, 80, 0.3)',
    
    // Hands (Komadai)
    handBackground: '#FFF8DC',
    handBorder: '#8B7355',
    handShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    countBadge: '#FF6B6B',
    
    // UI Elements
    background: '#2C3E50',
    textPrimary: '#ECF0F1',
    textSecondary: '#BDC3C7',
    statusBackground: '#34495E',
    statusShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    
    // Buttons
    buttonPrimary: '#3498DB',
    buttonSecondary: '#95A5A6',
    buttonDanger: '#E74C3C',
  },
  
  // ===== Dimensions =====
  dimensions: {
    boardSize: 9,
    cellSize: 60,
    boardPadding: 20,
    pieceSizeRatio: 0.85,
    
    // Text sizes (relative to piece size)
    kanjiFontSizeRatio: 0.5,
    englishFontSizeRatio: 0.18,
    
    // Hand display
    handPieceSize: 45,
    countBadgeSize: 20,
  },
  
  // ===== Fonts =====
  fonts: {
    kanji: "serif, 'Noto Serif JP', 'Yu Mincho', sans-serif",
    english: "sans-serif, 'Noto Sans JP', Arial",
    ui: "sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto",
  },
  
  // ===== Animations =====
  animations: {
    pieceTransition: 'all 0.2s ease',
    hoverScale: 1.1,
    selectedScale: 1.15,
  },
  
  // ===== Piece Shape (SVG Points) =====
  // Standard Shogi piece is a pentagon
  pieceShape: {
    points: (size: number) => 
      `0,${-size * 0.45} ${size * 0.4},${size * 0.45} ${-size * 0.4},${size * 0.45}`,
    strokeWidth: 2,
  },
};

// Export individual color palettes for easy theming
export const lightTheme = {
  ...themeConfig,
  colors: {
    ...themeConfig.colors,
    boardBackground: '#E8D0AA',
    background: '#F5F5F5',
    textPrimary: '#333333',
  },
};

export const darkTheme = {
  ...themeConfig,
  colors: {
    ...themeConfig.colors,
    boardBackground: '#4A3728',
    gridLine: '#D4C4A8',
    starPoint: '#D4C4A8',
    background: '#1a1a2e',
    textPrimary: '#EEEEEE',
  },
};

export type ThemeConfig = typeof themeConfig;
