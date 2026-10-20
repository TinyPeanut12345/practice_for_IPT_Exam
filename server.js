const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// GET all requests
app.get('/api/requests', (req, res) => {
    const requests = readData();
    res.json(requests);
});

// GET request by numeric ID
app.get('/api/requests/:id', (req, res) => {
    const requests = readData();
    const requestId = parseInt(req.params.id, 10);
    const request = requests.find(r => r.id === requestId);

    if (!request) {
        return res.status(404).json({ error: 'Request not found' });
    }

    res.status(200).json(request);
});

// POST new request (auto-increment numeric ID)
app.post('/api/requests', (req, res) => {
    const requests = readData();

    // Calculate next highest integer ID
    const maxId = requests.reduce((max, item) => {
        const idNum = Number(item.id);
        return (!isNaN(idNum)) ? Math.max(max, idNum) : max;
    }, 0);

    const newRequest = {
        id: maxId + 1, // Store ID directly as a number
        ...req.body
    };

    requests.push(newRequest);
    writeData(requests);

    res.status(201).json(newRequest);
});

// DELETE request by numeric ID
app.delete('/api/requests/:id', (req, res) => {
    const requests = readData();
    const requestId = parseInt(req.params.id, 10);

    const index = requests.findIndex(r => r.id === requestId);

    if (index === -1) {
        return res.status(404).json({ error: 'Request not found' });
    }

    const deletedRequest = requests.splice(index, 1);
    writeData(requests);

    res.status(200).json({ message: 'Deleted successfully', deleted: deletedRequest[0] });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/api/requests', (req, res) => {
    console.time('Fetch Time');
    
    const requests = readData(); // Time how long this takes
    
    console.timeEnd('Fetch Time');
    res.json(requests);
});