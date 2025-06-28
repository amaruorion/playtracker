class PlayTracker {
    constructor() {
        this.currentPlayer = 0;
        this.timerInterval = null;
        this.startTime = null;
        this.pausedTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.currentRoom = null;
        this.lastUpdated = 0;
        this.syncInterval = null;
        this.serverData = null;
        
        this.initializeElements();
        this.loadData();
        this.setupEventListeners();
        this.updatePlayerDropdown();
    }
    
    initializeElements() {
        this.timerDisplay = document.getElementById('timer');
        this.playerSelect = document.getElementById('player-select');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.clearBtn = document.getElementById('clear-data');
        this.exportBtn = document.getElementById('export-data');
        this.playTable = document.getElementById('play-table');
        this.roomIdInput = document.getElementById('room-id');
        this.joinRoomBtn = document.getElementById('join-room');
        this.createRoomBtn = document.getElementById('create-room');
        this.roomStatusText = document.getElementById('room-status-text');
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.pauseBtn.addEventListener('click', () => this.pauseTimer());
        this.stopBtn.addEventListener('click', () => this.stopTimer());
        this.clearBtn.addEventListener('click', () => this.clearAllData());
        this.exportBtn.addEventListener('click', () => this.exportData());
        this.playerSelect.addEventListener('change', (e) => {
            this.currentPlayer = parseInt(e.target.value);
        });
        
        const playerNames = document.querySelectorAll('.player-name');
        playerNames.forEach((nameCell, index) => {
            nameCell.addEventListener('blur', () => {
                this.updatePlayerName(index, nameCell.textContent.trim());
                this.updatePlayerDropdown();
            });
            nameCell.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    nameCell.blur();
                }
            });
        });
        
        this.joinRoomBtn.addEventListener('click', () => this.joinRoom());
        this.createRoomBtn.addEventListener('click', () => this.createRoom());
        this.roomIdInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.joinRoom();
            }
        });
    }
    
    startTimer() {
        if (this.isPaused) {
            this.startTime = Date.now() - this.pausedTime;
            this.isPaused = false;
        } else {
            this.startTime = Date.now();
            this.pausedTime = 0;
        }
        
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.stopBtn.disabled = false;
        
        this.timerInterval = setInterval(() => {
            this.updateTimerDisplay();
        }, 10);
    }
    
    pauseTimer() {
        if (this.isRunning && !this.isPaused) {
            this.pausedTime = Date.now() - this.startTime;
            this.isPaused = true;
            this.isRunning = false;
            
            clearInterval(this.timerInterval);
            
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.stopBtn.disabled = false;
        }
    }
    
    stopTimer() {
        if (this.isRunning || this.isPaused) {
            const totalTime = this.isPaused ? this.pausedTime : Date.now() - this.startTime;
            this.addTimeToPlayer(this.currentPlayer, totalTime);
            
            this.resetTimer();
        }
    }
    
    resetTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.startTime = null;
        this.pausedTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.stopBtn.disabled = true;
        
        this.timerDisplay.textContent = '00:00:00';
    }
    
    updateTimerDisplay() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.startTime;
        this.timerDisplay.textContent = this.formatTime(elapsedTime);
    }
    
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    addTimeToPlayer(playerIndex, milliseconds) {
        const today = new Date().getDay();
        const dayIndex = today === 0 ? 6 : today - 1;
        
        const currentData = this.getStoredData();
        if (!currentData.players[playerIndex].days[dayIndex]) {
            currentData.players[playerIndex].days[dayIndex] = 0;
        }
        
        currentData.players[playerIndex].days[dayIndex] += milliseconds;
        this.saveData(currentData);
        this.updateTableDisplay();
    }
    
    updatePlayerName(playerIndex, newName) {
        const currentData = this.getStoredData();
        currentData.players[playerIndex].name = newName || `Player ${playerIndex + 1}`;
        this.saveData(currentData);
    }
    
    updatePlayerDropdown() {
        const currentData = this.getStoredData();
        const options = this.playerSelect.querySelectorAll('option');
        
        options.forEach((option, index) => {
            option.textContent = currentData.players[index].name;
        });
    }
    
    updateTableDisplay() {
        const currentData = this.getStoredData();
        const rows = this.playTable.querySelectorAll('tbody tr');
        
        rows.forEach((row, playerIndex) => {
            const timeCells = row.querySelectorAll('.time-cell');
            timeCells.forEach((cell, dayIndex) => {
                const totalTime = currentData.players[playerIndex].days[dayIndex] || 0;
                cell.textContent = this.formatTime(totalTime);
            });
        });
    }
    
    getStoredData() {
        const defaultData = {
            players: [],
            lastUpdated: Date.now()
        };
        
        for (let i = 0; i < 5; i++) {
            defaultData.players.push({
                name: `Player ${i + 1}`,
                days: [0, 0, 0, 0, 0, 0, 0]
            });
        }
        
        if (this.currentRoom && this.serverData) {
            return this.serverData;
        }
        
        const stored = localStorage.getItem('playTrackerData');
        return stored ? JSON.parse(stored) : defaultData;
    }
    
    async saveData(data) {
        data.lastUpdated = Date.now();
        this.lastUpdated = data.lastUpdated;
        
        if (this.currentRoom) {
            try {
                const response = await fetch(`/api/rooms/${this.currentRoom}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    this.serverData = result.data;
                } else {
                    console.error('Failed to save to server');
                    localStorage.setItem('playTrackerData', JSON.stringify(data));
                }
            } catch (error) {
                console.error('Error saving to server:', error);
                localStorage.setItem('playTrackerData', JSON.stringify(data));
            }
        } else {
            localStorage.setItem('playTrackerData', JSON.stringify(data));
        }
    }
    
    async loadData() {
        const data = this.getStoredData();
        
        const playerNames = document.querySelectorAll('.player-name');
        playerNames.forEach((nameCell, index) => {
            nameCell.textContent = data.players[index].name;
        });
        
        this.updateTableDisplay();
        this.updatePlayerDropdown();
    }
    
    async clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            const defaultData = {
                players: [],
                lastUpdated: Date.now()
            };
            
            for (let i = 0; i < 5; i++) {
                defaultData.players.push({
                    name: `Player ${i + 1}`,
                    days: [0, 0, 0, 0, 0, 0, 0]
                });
            }
            
            await this.saveData(defaultData);
            
            const playerNames = document.querySelectorAll('.player-name');
            playerNames.forEach((nameCell, index) => {
                nameCell.textContent = `Player ${index + 1}`;
            });
            
            const timeCells = document.querySelectorAll('.time-cell');
            timeCells.forEach(cell => {
                cell.textContent = '00:00:00';
            });
            
            this.updatePlayerDropdown();
            this.resetTimer();
        }
    }
    
    exportData() {
        const data = this.getStoredData();
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        let csvContent = 'Player,' + dayNames.join(',') + ',Total\n';
        
        data.players.forEach(player => {
            const dayTimes = player.days.map(time => this.formatTime(time));
            const totalTime = player.days.reduce((sum, time) => sum + time, 0);
            const row = `"${player.name}",` + dayTimes.join(',') + ',' + this.formatTime(totalTime);
            csvContent += row + '\n';
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `play-tracker-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
    
    async createRoom() {
        try {
            const response = await fetch('/api/create-room', {
                method: 'POST'
            });
            
            if (response.ok) {
                const result = await response.json();
                this.roomIdInput.value = result.roomId;
                await this.joinRoom();
            } else {
                alert('Failed to create room');
            }
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Error creating room. Please try again.');
        }
    }
    
    async joinRoom() {
        const roomId = this.roomIdInput.value.trim().toUpperCase();
        
        if (!roomId) {
            alert('Please enter a room ID');
            return;
        }
        
        try {
            const existsResponse = await fetch(`/api/rooms/${roomId}/exists`);
            const existsResult = await existsResponse.json();
            
            if (!existsResult.exists) {
                alert('Room not found. Please check the room ID or create a new room.');
                return;
            }
            
            const response = await fetch(`/api/rooms/${roomId}`);
            
            if (response.ok) {
                const data = await response.json();
                this.currentRoom = roomId;
                this.serverData = data;
                this.lastUpdated = data.lastUpdated || 0;
                
                this.updateRoomStatus(true, roomId);
                this.loadData();
                this.startSyncInterval();
                
                localStorage.setItem('currentRoom', roomId);
            } else {
                alert('Failed to join room');
            }
        } catch (error) {
            console.error('Error joining room:', error);
            alert('Error joining room. Please try again.');
        }
    }
    
    updateRoomStatus(connected, roomId = null) {
        const statusElement = this.roomStatusText.parentElement;
        
        if (connected && roomId) {
            this.roomStatusText.textContent = `Connected to room: ${roomId}`;
            statusElement.classList.add('connected');
        } else {
            this.roomStatusText.textContent = 'Not connected to room';
            statusElement.classList.remove('connected');
        }
    }
    
    startSyncInterval() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.syncInterval = setInterval(async () => {
            if (this.currentRoom) {
                await this.syncWithServer();
            }
        }, 5000);
    }
    
    async syncWithServer() {
        if (!this.currentRoom) return;
        
        try {
            const response = await fetch(`/api/rooms/${this.currentRoom}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lastUpdated: this.lastUpdated })
            });
            
            if (response.ok) {
                const result = await response.json();
                
                if (result.needsUpdate) {
                    this.serverData = result.data;
                    this.lastUpdated = result.data.lastUpdated;
                    this.loadData();
                }
            }
        } catch (error) {
            console.error('Sync error:', error);
        }
    }
    
    async initializeFromStorage() {
        const savedRoom = localStorage.getItem('currentRoom');
        if (savedRoom) {
            this.roomIdInput.value = savedRoom;
            await this.joinRoom();
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const tracker = new PlayTracker();
    await tracker.initializeFromStorage();
});