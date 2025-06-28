const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const rooms = new Map();

function getDefaultData() {
    return {
        players: Array.from({ length: 5 }, (_, i) => ({
            name: `Player ${i + 1}`,
            days: [0, 0, 0, 0, 0, 0, 0]
        })),
        lastUpdated: Date.now()
    };
}

app.get('/api/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    
    if (!rooms.has(roomId)) {
        rooms.set(roomId, getDefaultData());
    }
    
    res.json(rooms.get(roomId));
});

app.post('/api/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    const data = req.body;
    
    data.lastUpdated = Date.now();
    rooms.set(roomId, data);
    
    res.json({ success: true, data });
});

app.post('/api/rooms/:roomId/sync', (req, res) => {
    const { roomId } = req.params;
    const { lastUpdated } = req.body;
    
    if (!rooms.has(roomId)) {
        rooms.set(roomId, getDefaultData());
    }
    
    const roomData = rooms.get(roomId);
    
    if (roomData.lastUpdated > lastUpdated) {
        res.json({ 
            needsUpdate: true, 
            data: roomData 
        });
    } else {
        res.json({ 
            needsUpdate: false 
        });
    }
});

app.post('/api/create-room', (req, res) => {
    const roomId = uuidv4().substring(0, 8);
    rooms.set(roomId, getDefaultData());
    
    res.json({ roomId });
});

app.get('/api/rooms/:roomId/exists', (req, res) => {
    const { roomId } = req.params;
    res.json({ exists: rooms.has(roomId) });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Play Tracker server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});