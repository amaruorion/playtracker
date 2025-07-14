# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web application for tracking playtime across multiple players and days of the week with real-time multi-device synchronization using Firebase Realtime Database. All users share the same global database.

## Development Setup

**Firebase Setup Required:**

**Step 1: Create Firebase Project**
1. Go to https://console.firebase.google.com
2. Sign in with Google account
3. Click "Add project" or "Create a project"
4. Enter project name (e.g., "playtracker")
5. Disable Google Analytics (optional)
6. Click "Create project"

**Step 2: Enable Realtime Database**
1. In left sidebar, click "Realtime Database"
2. Click "Create Database"
3. Choose location close to your users
4. Select "Start in test mode"
5. Database is now created

**Step 3: Get Configuration**
1. Click gear icon ⚙️ → "Project settings"
2. Scroll to "Your apps" → click web icon `</>`
3. App nickname: "Play Tracker"
4. Don't check Firebase Hosting
5. Click "Register app"
6. Copy the firebaseConfig object

**Step 4: Update Configuration File**
1. Open `firebase-config.js`
2. Replace the firebaseConfig object with your actual config from Step 3
3. Keep the initialization lines unchanged

**Step 5: Set Database Rules**
1. Go to Realtime Database → "Rules" tab
2. Replace rules with:
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
3. Click "Publish"

**Step 6: Test Setup**
1. Open `index.html` in web browser
2. Check Developer Tools (F12) Console for:
   - No Firebase errors
   - "Initialized default data in Firebase" (first load)
   - "Data saved to Firebase" (when using timer)
3. Test multi-device sync by opening same page in another browser

**Running the Application:**
- Open `index.html` directly in a web browser
- Or serve statically: `python -m http.server`
- No build process or Node.js server required

**Troubleshooting:**
- **Firebase errors**: Check firebase-config.js values and database URL
- **No sync**: Verify database rules are published and internet connection
- **No initialization**: Check Firebase Console → Realtime Database → Data tab for `playtracker` node

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