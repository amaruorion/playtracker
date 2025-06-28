class PlayTracker {
    constructor() {
        this.currentPlayer = 0;
        this.timerInterval = null;
        this.startTime = null;
        this.pausedTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.firebaseRef = null;
        this.dataListener = null;
        
        this.initializeElements();
        this.initializeFirebase();
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
    }
    
    initializeFirebase() {
        if (this.checkFirebaseConnection()) {
            this.firebaseRef = database.ref('playtracker');
            this.setupFirebaseListener();
        }
    }
    
    setupFirebaseListener() {
        if (this.firebaseRef) {
            this.dataListener = this.firebaseRef.on('value', (snapshot) => {
                if (snapshot.exists()) {
                    this.firebaseData = snapshot.val();
                    this.updateTableDisplay();
                } else {
                    this.initializeDefaultData();
                }
            });
        }
    }
    
    async initializeDefaultData() {
        if (this.firebaseRef) {
            const defaultData = this.createDefaultData();
            try {
                await this.firebaseRef.set(defaultData);
                console.log('Initialized default data in Firebase');
            } catch (error) {
                console.error('Error initializing Firebase data:', error);
            }
        }
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
        
        if (!this.firebaseRef) {
            this.updateTableDisplay();
        }
    }
    
    updatePlayerName(playerIndex, newName) {
        const currentData = this.getStoredData();
        currentData.players[playerIndex].name = newName || `Player ${playerIndex + 1}`;
        this.saveData(currentData);
        
        if (!this.firebaseRef) {
            this.updatePlayerDropdown();
        }
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
        
        const playerNames = document.querySelectorAll('.player-name');
        playerNames.forEach((nameCell, index) => {
            nameCell.textContent = currentData.players[index].name;
        });
        
        this.updatePlayerDropdown();
    }
    
    createDefaultData() {
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
        
        return defaultData;
    }
    
    getStoredData() {
        if (this.firebaseRef && this.firebaseData) {
            return this.firebaseData;
        }
        
        const stored = localStorage.getItem('playTrackerData');
        return stored ? JSON.parse(stored) : this.createDefaultData();
    }
    
    async saveData(data) {
        data.lastUpdated = Date.now();
        
        if (this.firebaseRef) {
            try {
                await this.firebaseRef.set(data);
                console.log('Data saved to Firebase');
            } catch (error) {
                console.error('Error saving to Firebase:', error);
                localStorage.setItem('playTrackerData', JSON.stringify(data));
            }
        } else {
            localStorage.setItem('playTrackerData', JSON.stringify(data));
        }
    }
    
    async loadData() {
        const data = this.getStoredData();
        this.updateTableDisplay();
    }
    
    async clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone and will affect all users.')) {
            const defaultData = this.createDefaultData();
            await this.saveData(defaultData);
            
            if (!this.firebaseRef) {
                this.updateTableDisplay();
                this.resetTimer();
            }
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
    
    checkFirebaseConnection() {
        if (!window.firebase || !database) {
            console.warn('Firebase not available. Using localStorage only.');
            return false;
        }
        return true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PlayTracker();
});