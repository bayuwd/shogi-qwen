# Shogi MVP - Player vs AI

A web-based Shogi (Japanese Chess) game built with Next.js, React, and TypeScript.

## 🎯 Killer Feature

Every piece displays:
- **Large Kanji** (Top/Center) - Traditional Japanese characters
- **Small English** (Bottom) - Translation for learning

## 🏛️ Architecture

- **Pure Game Logic**: All rules in `/src/engine/` (no React/DOM)
- **Immutable State**: Board state never mutated directly
- **Server-like Authority**: UI cannot force illegal moves
- **SVG Rendering**: Board and pieces rendered as SVG
- **Theme Configuration**: Easy customization via `themeConfig`

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main page
│   └── layout.tsx         # Root layout
├── components/
│   ├── Board.tsx          # SVG 9x9 board renderer
│   ├── Piece.tsx          # Kanji + English piece renderer
│   ├── Komadai.tsx        # Hand/captured pieces
│   └── GameUI.tsx         # Main game wrapper
├── engine/                # PURE LOGIC (No React)
│   ├── board.ts           # Board initialization & types
│   ├── pieces.ts          # Piece dictionary & interfaces
│   ├── moveGenerator.ts   # Legal move calculation
│   ├── dropValidator.ts   # Nifu, Uchifuzume validation
│   ├── gameController.ts  # Check, Checkmate, Game Loop
│   └── ai.ts              # Smart Semi-Random AI
├── stores/
│   └── gameStore.ts       # Zustand state management
└── config/
    └── theme.ts           # Theme configuration
```

## ♟️ Shogi Rules Implemented

✅ Standard piece movement (including Knight's forward-L only)
✅ Promotion zone (last 3 rows)
✅ Forced promotion (Pawn/Lance to last row, Knight to penultimate)
✅ Drop rule (Komidai)
✅ Nifu (Two Pawn) prevention
✅ Uchifuzume (Drop Pawn Mate) detection
✅ Dead square prevention for drops
✅ Check and Checkmate detection

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 How to Play

1. **You are Sente** (First player, moves upward from bottom)
2. **AI is Gote** (Second player, moves downward from top)
3. Click a piece to select it
4. Click a highlighted square to move
5. Click a piece in your hand (bottom right) to drop it on the board

## 🧠 AI Engine

The Phase 1 AI uses a Smart Semi-Random approach:
- Generates all legal moves
- Prioritizes checks
- Prioritizes high-value captures
- Prioritizes defensive drops near king
- Randomly selects from highest priority tier

## 🎨 Customization

Edit `src/config/theme.ts` to customize:
- Colors (board, pieces, UI)
- Dimensions
- Fonts
- Animations

## 📝 License

ISC
