# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web application for tracking playtime across multiple players and days of the week with real-time multi-device synchronization using Firebase Realtime Database. All users share the same global database.

## Development Setup

**Firebase Setup Required:**
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Realtime Database in your Firebase project
3. Update `firebase-config.js` with your Firebase project credentials:
   - Copy the Firebase config object from your project settings
   - Replace the placeholder values in `firebase-config.js`

**Running the Application:**
- Open `index.html` directly in a web browser
- Or serve statically: `python -m http.server`
- No build process or Node.js server required

**Database Rules (Firebase Console):**
```json
{
  "rules": {
    "playtracker": {
      ".read": true,
      ".write": true
    }
  }
}
```

## Architecture

### Core Components

**PlayTracker Class** (`script.js`): Single JavaScript class managing all functionality
- Timer management with start/pause/stop controls
- Real-time multi-device synchronization via Firebase
- Global shared database - all users see the same data
- Automatic fallback to localStorage when Firebase unavailable
- Player management (5 players with customizable names)
- Time tracking across 7 days of the week
- CSV export functionality

**Firebase Realtime Database**: Cloud-based global data persistence
- Single shared database at `/playtracker` path
- Real-time data synchronization across all connected devices
- Automatic conflict resolution with instant updates
- Persistent data storage (survives browser restarts)
- No user isolation - everyone shares the same data

**Data Structure**: Stored in Firebase as JSON at `/playtracker`:
```javascript
{
  players: [
    {
      name: "Player 1", 
      days: [0, 0, 0, 0, 0, 0, 0] // Mon-Sun in milliseconds
    }
  ],
  lastUpdated: 1234567890123 // Timestamp for tracking changes
}
```

**Timer Logic**: Uses `setInterval` with millisecond precision, tracks elapsed time since start, handles pause/resume by storing paused duration.

**Real-time Sync**: Firebase listeners automatically update all connected devices when any device modifies data.

### File Organization

- `index.html`: Complete HTML with timer controls and weekly table
- `styles.css`: Responsive styling with mobile-first approach
- `script.js`: Single class containing all client logic (~300 lines)
- `firebase-config.js`: Firebase project configuration (must be customized)

### Key Interactions

- Application automatically connects to global Firebase database on load
- Real-time listeners automatically sync changes across all devices
- Player selection updates `currentPlayer` index
- Timer operations modify DOM and sync with Firebase/localStorage
- Table cells update in real-time when any device adds sessions
- Player names are editable via `contenteditable` attributes and sync globally
- Day calculation uses `Date().getDay()` with Sunday=0 converted to array index 6

### Data Flow

**Multi-User Mode (Firebase Connected):**
1. Page load → connects to global Firebase database → loads shared data
2. Timer runs → updates display every 10ms
3. Stop button → saves to Firebase → automatically syncs to all devices
4. Real-time listeners → instantly update all connected devices
5. Player name changes → sync immediately to all users

**Single-User Mode (Offline/Firebase unavailable):**
1. Standard localStorage-based operations
2. Graceful fallback when Firebase configuration missing or network unavailable

## Development Notes

- No server setup required - fully client-side with Firebase backend
- Requires valid Firebase project configuration in `firebase-config.js`
- Mobile responsive design included
- Time format: HH:MM:SS throughout application
- Supports multiple sessions per day (time accumulates)
- Real-time synchronization with automatic conflict resolution
- Data persists permanently in Firebase
- Global shared database - all users see and modify the same data
- Clear data button affects all users globally