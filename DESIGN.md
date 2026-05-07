# CryptoMeter Clone - Design Document

## Design Philosophy
**Modern Crypto Dashboard** - Professional financial UI with dark theme, real-time data visualization, and clear information hierarchy.

### Core Principles
1. **Data Clarity**: Numerical data presented with visual hierarchy (price > volume > trades)
2. **Real-time Aesthetic**: Live updates feel immediate with color-coded buy/sell indicators
3. **Professional Minimalism**: Dark background with strategic accent colors (green/red)
4. **Responsive Efficiency**: Compact layouts that scale from mobile to desktop

### Color Palette
- **Background**: Deep charcoal (#1a1a1a)
- **Surface**: Dark gray (#2a2a2a)
- **Buy/Positive**: Bright green (#10b981)
- **Sell/Negative**: Bright red (#ef4444)
- **Text Primary**: Off-white (#f5f5f5)
- **Text Secondary**: Light gray (#a0a0a0)
- **Accent**: Cyan (#06b6d4)

### Typography
- **Display**: Bold sans-serif for price (48px+)
- **Heading**: Medium weight for section titles (20px)
- **Body**: Regular weight for data (14px)
- **Mono**: Monospace for precise numbers

### Layout Paradigm
- Left sidebar: Navigation (collapsible on mobile)
- Main content: Two-column grid
  - Left: Price card, stats, charts
  - Right: Live trade updates (scrollable)
- Bottom: Large activity tables

### Signature Elements
1. **Buy/Sell Volume Bars**: Horizontal stacked bars showing percentage split
2. **Color-coded Trades**: Green for BUY, Red for SELL
3. **Real-time Badges**: "LIVE" indicators on active sections

### Animation
- Smooth transitions on hover (200ms)
- Pulse animation on "LIVE" badges
- Chart animations on load (1s ease-out)
- Volume bar fills animate on data update

### Interaction
- Hover effects on tradeable elements
- Click to expand/collapse sections
- Timeframe selector for charts
- Sortable table columns
