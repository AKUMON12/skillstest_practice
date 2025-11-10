// server.js
const express = require('express');             // ──
const mysql = require('mysql');                 //   ├── Importing all necessary dependencies
const bodyParser = require('body-parser');      //   ├── the one I installed via npm
const cors = require('cors');                   // ──

const app = express();  // Initialize INSTANCE of Express app
const PORT = 3001;      // Backend will run on port 3001

// Middlewares
app.use(cors());                // Allow cross-origin requests from the React frontend
app.use(bodyParser.json());     // To parse JSON bodies from POST requests

// MySQL Connection Setup
const db = mysql.createConnection({
    host: 'localhost',      // Your XAMPP host
    user: 'root',           // Your XAMPP default username
    password: '',           // Your XAMPP default password (usually empty)
    database: 'election_db' // The database you created
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL Database.');
});

// --- API ROUTES GO HERE ---

// Example: Get all positions (for Positions Management UI)
app.get('/api/positions', (req, res) => {
    const sql = "SELECT * FROM positions";
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching positions:', err);
            return res.status(500).json({ error: 'Failed to fetch positions' });
        }
        res.json(result); // Send the list of positions back to the frontend
    });
});

// Example: Add a new position [1] (for Positions Management UI)
app.post('/api/positions', (req, res) => {
    const { positionName, numOfPositions } = req.body;
    // status defaults to 'Open' in the SQL table definition
    const sql = "INSERT INTO positions (positionName, numOfPositions) VALUES (?, ?)";
    db.query(sql, [positionName, numOfPositions], (err, result) => {
        if (err) {
            console.error('Error adding position:', err);
            return res.status(500).json({ error: 'Failed to add position', details: err.message });
        }
        res.json({ message: 'Position added successfully', positionID: result.insertId });
    });
});

// Example: Deactivate/Close a position [2] (for Positions Management UI)
app.put('/api/positions/status/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Expecting 'Open' or 'Closed'
    const sql = "UPDATE positions SET status = ? WHERE positionID = ?";
    db.query(sql, [status, id], (err, result) => {
        if (err) {
            console.error('Error updating position status:', err);
            return res.status(500).json({ error: 'Failed to update status' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Position not found' });
        }
        res.json({ message: 'Position status updated successfully' });
    });
});


// --- The remaining 6 Modules will require more specific routes: ---

// 1. Positions Management (Read, Add, Update, Deactivate)
//    - Already showed Read, Add, and Deactivate (Update is similar to Deactivate but modifies name/count)
// 2. Voter Management (Read, Add, Update, Deactivate)
//    - Routes: GET /api/voters, POST /api/voters, PUT /api/voters/:id (for update), PUT /api/voters/status/:id (for deactivation)
// 3. Candidate Management (Read, Add, Update, Deactivate)
//    - Routes: GET /api/candidates, POST /api/candidates, PUT /api/candidates/:id, PUT /api/candidates/status/:id

// 4. Voting/Votation UI (Login, Vote Submission)
//    - POST /api/voters/login (Check credentials, voterStat, voted)
//    - POST /api/votes (Submit vote, update 'voted' flag in voters table)

// 5. Election Results UI (Tally Votes, Calculate Percentage)
//    - GET /api/results (Complex query to count votes and join with positions/candidates)

// 6. Election Winners UI (Identify Winners)
//    - GET /api/winners (Even more complex query/logic to determine winner/s based on numOfPositions)


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});