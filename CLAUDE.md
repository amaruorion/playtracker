# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a client-side web application for tracking playtime across multiple players and days of the week. The application consists of three main files that work together to provide a complete time tracking solution.

## Development Setup

This is a static web application with no build process or dependencies. To run:
- Open `index.html` directly in a web browser
- Or serve locally with any static file server (e.g., `python -m http.server`)

## Architecture

### Core Components

**PlayTracker Class** (`script.js`): Single JavaScript class that manages all application state and functionality
- Timer management with start/pause/stop controls
- Data persistence using browser localStorage  
- Player management (5 players with customizable names)
- Time tracking across 7 days of the week
- CSV export functionality

**Data Structure**: Application stores data in localStorage as JSON:
```javascript
{
  players: [
    {
      name: "Player 1",
      days: [0, 0, 0, 0, 0, 0, 0] // Mon-Sun in milliseconds
    }
  ]
}
```

**Timer Logic**: Uses `setInterval` with millisecond precision, tracks elapsed time since start, handles pause/resume by storing paused duration.

### File Organization

- `index.html`: Complete HTML structure with timer controls and weekly tracking table
- `styles.css`: Responsive styling with mobile-first approach, uses CSS Grid/Flexbox
- `script.js`: Single class containing all application logic (~200 lines)

### Key Interactions

- Player selection updates `currentPlayer` index
- Timer operations modify DOM and localStorage simultaneously  
- Table cells are updated in real-time when sessions complete
- Player names are editable via `contenteditable` attributes
- Day calculation uses `Date().getDay()` with Sunday=0 converted to array index 6

### Data Flow

1. User selects player → updates `currentPlayer`
2. Timer runs → updates display every 10ms
3. Stop button → calculates total time → adds to player's current day → saves to localStorage → updates table display
4. Page load → reads localStorage → populates table and player names

## Development Notes

- No external dependencies or build tools required
- All state management handled through localStorage
- Mobile responsive design included
- Time format: HH:MM:SS throughout application
- Supports multiple sessions per day (time accumulates)