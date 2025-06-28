# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a client-side web application for tracking playtime across multiple players and days of the week. The application consists of three main files that work together to provide a complete time tracking solution.

## Development Setup

This application now includes both client-side and server-side components for multi-user data sharing.

**Server Setup:**
```bash
npm install
npm start
```

**Development Mode:**
```bash
npm run dev  # Uses nodemon for auto-restart
```

**Client-Only Mode:**
- Open `index.html` directly in browser (uses localStorage only)
- Or serve statically: `python -m http.server`

**Server URL:** http://localhost:3000

## Architecture

### Core Components

**PlayTracker Class** (`script.js`): Single JavaScript class managing all functionality
- Timer management with start/pause/stop controls
- Multi-device data synchronization via server API
- Room-based data sharing with 8-character room IDs
- Fallback to localStorage when server unavailable
- Player management (5 players with customizable names)
- Time tracking across 7 days of the week
- CSV export functionality

**Express Server** (`server.js`): Node.js backend for data persistence
- In-memory room storage using Map
- RESTful API endpoints for room operations
- Automatic room creation with UUID generation
- Data synchronization with timestamp-based conflict resolution

**Data Structure**: Shared between client/server as JSON:
```javascript
{
  players: [
    {
      name: "Player 1", 
      days: [0, 0, 0, 0, 0, 0, 0] // Mon-Sun in milliseconds
    }
  ],
  lastUpdated: 1234567890123 // Timestamp for sync
}
```

**Timer Logic**: Uses `setInterval` with millisecond precision, tracks elapsed time since start, handles pause/resume by storing paused duration.

**Sync Logic**: Polls server every 5 seconds, compares timestamps to determine if local data needs updating.

### File Organization

- `index.html`: Complete HTML with timer controls, room management, and weekly table
- `styles.css`: Responsive styling with mobile-first approach, includes room UI styling
- `script.js`: Single class containing all client logic (~420 lines)
- `server.js`: Express server with REST API endpoints (~80 lines)
- `package.json`: Node.js dependencies and npm scripts

### Key Interactions

- Room creation generates 8-character UUID, auto-joins created room
- Room joining validates existence, loads server data, starts sync timer
- Player selection updates `currentPlayer` index
- Timer operations modify DOM and sync with server/localStorage
- Table cells update in real-time when sessions complete
- Player names are editable via `contenteditable` attributes
- Day calculation uses `Date().getDay()` with Sunday=0 converted to array index 6

### Data Flow

**Multi-User Mode (Server Connected):**
1. User creates/joins room → validates with server → loads shared data
2. Timer runs → updates display every 10ms
3. Stop button → saves to server → updates local display
4. Background sync every 5s → checks for server updates → merges changes
5. Page load → attempts to reconnect to saved room

**Single-User Mode (Offline):**
1. Standard localStorage-based operations
2. Graceful fallback when server unavailable

## Development Notes

- Server requires Node.js and npm dependencies (express, cors, uuid)
- Client works offline with localStorage fallback
- Mobile responsive design included
- Time format: HH:MM:SS throughout application
- Supports multiple sessions per day (time accumulates)
- Room data stored in server memory (not persistent across restarts)
- Automatic reconnection to saved rooms on page load