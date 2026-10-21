const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to read data from data.json
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Helper function to write data to data.json
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// GET /api/visitors - Fetch all visitors
app.get('/api/visitors', (req, res) => {
    const visitors = readData();
    res.status(200).json(visitors);
});

// GET /api/visitors/:id - Fetch visitor by numeric ID
app.get('/api/visitors/:id', (req, res) => {
    const visitors = readData();
    const visitorId = parseInt(req.params.id, 10);
    const visitor = visitors.find(v => Number(v.id) === visitorId);

    if (!visitor) {
        return res.status(404).json({ error: 'Visitor not found' });
    }

    res.status(200).json(visitor);
});

// POST /api/visitors - Add a new visitor
app.post('/api/visitors', (req, res) => {
    const visitors = readData();

    // Auto-increment numeric ID
    const maxId = visitors.reduce((max, item) => {
        const idNum = Number(item.id);
        return (!isNaN(idNum)) ? Math.max(max, idNum) : max;
    }, 0);

    const newVisitor = {
        id: maxId + 1,
        ...req.body
    };

    visitors.push(newVisitor);
    writeData(visitors);

    res.status(201).json(newVisitor);
});

// DELETE /api/visitors/:id - Delete visitor by numeric ID
app.delete('/api/visitors/:id', (req, res) => {
    const visitors = readData();
    const visitorId = parseInt(req.params.id, 10);

    const index = visitors.findIndex(v => Number(v.id) === visitorId);

    if (index === -1) {
        return res.status(404).json({ error: 'Visitor not found' });
    }

    const deletedVisitor = visitors.splice(index, 1);
    writeData(visitors);

    res.status(200).json({ message: 'Visitor deleted successfully', deleted: deletedVisitor[0] });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});