// ──────────────────────────────────────────────────────────────
// 📦 IMPORT DEPENDENCIES
// ──────────────────────────────────────────────────────────────
// These imports bring in external libraries required by the backend.
// Think of these as “tools” your server uses.

// EXPRESS → The core framework for handling HTTP requests (API routes).
import express from 'express';

// MYSQL → Used to connect this server to your MySQL database.
import mysql from 'mysql';

// BODY-PARSER → Helps Express read JSON data sent from the frontend.
import bodyParser from 'body-parser';

// CORS → Allows your React frontend to communicate with this backend,
// even though they run on different ports (3000 and 3001).
import cors from 'cors';



// ──────────────────────────────────────────────────────────────
// 🚀 INITIALIZE EXPRESS APP
// ──────────────────────────────────────────────────────────────

// Create the Express application object.
// This `app` is your server — it will contain all routes like
// GET /positions, POST /voters, etc.
const app = express();

// The port where your backend runs.
// Your frontend (React) runs on port 3000 — backend runs on 3001.
const PORT = 3001;

// Register middlewares
app.use(cors());            // Allows cross-origin requests
app.use(bodyParser.json()); // Converts JSON request body → JS object



// ──────────────────────────────────────────────────────────────
// 🗄️ MYSQL DATABASE CONNECTION
// ──────────────────────────────────────────────────────────────

// Create a MySQL connection object.
// This does NOT connect yet — it just prepares the configuration.
const db = mysql.createConnection({
  host: 'localhost',                
  user: 'root',                     
  password: '',                     
  database: 'election_system_db',   // Must match the DB name in phpMyAdmin
});

// Actually connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err);
    return;
  }
  console.log('✅ Connected to MySQL Database.');
});



// ──────────────────────────────────────────────────────────────
// 📋 SECTION 1: POSITIONS MANAGEMENT (CRUD)
// ──────────────────────────────────────────────────────────────
//
// CRUD means: Create, Read, Update, Delete.
// In this election system, "positions" = jobs you vote for,
// like President, Senator, Chairman, etc.
// This section controls the positions table.

// 🟢 READ all positions (GET request)
// Example URL: GET http://localhost:3001/api/positions
app.get('/api/positions', (req, res) => {
  const sql = 'SELECT * FROM positions';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch positions' });
    res.json(result);
  });
});


// 🟡 CREATE a new position (POST request)
// The React frontend sends JSON like: { "positionName": "Senator", "numOfPositions": 12 }
app.post('/api/positions', (req, res) => {
  const { positionName, numOfPositions } = req.body;

  // Insert into MySQL
  const sql = 'INSERT INTO positions (positionName, numOfPositions) VALUES (?, ?)';
  db.query(sql, [positionName, numOfPositions], (err, result) => {
    if (err)
      return res.status(500).json({ error: 'Failed to add position', details: err.message });

    res.json({
      message: 'Position added successfully',
      positionID: result.insertId,  // insertId = ID assigned by MySQL
    });
  });
});


// 🔵 UPDATE position details (PUT request)
// PUT = update data
app.put('/api/positions/:id', (req, res) => {
  const { id } = req.params;  // URL parameter ex: /positions/5
  const { positionName, numOfPositions } = req.body;

  const sql = `
    UPDATE positions
    SET positionName = ?, numOfPositions = ?
    WHERE positionID = ?
  `;

  db.query(sql, [positionName, numOfPositions, id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update position' });
    res.json({ message: 'Position updated successfully' });
  });
});


// 🔴 UPDATE status (Open or Closed)
// Closed = voting disabled for that position.
app.put('/api/positions/status/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = 'UPDATE positions SET status = ? WHERE positionID = ?';
  db.query(sql, [status, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to update position status' });

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Position not found' });

    res.json({ message: 'Position status updated successfully' });
  });
});



// ──────────────────────────────────────────────────────────────
// 🧑‍💻 SECTION 2: VOTER MANAGEMENT (CRUD)
// ──────────────────────────────────────────────────────────────

// 🟢 READ all voters
// Note: We do NOT return passwords for security
app.get('/api/voters', (req, res) => {
  const sql = `
    SELECT voterID, voterIDNum, voterFName, voterLName, voterStat, voted
    FROM voters
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch voters' });
    res.json(result);
  });
});


// 🟡 ADD new voter
app.post('/api/voters', (req, res) => {
  const { voterIDNum, voterPass, voterFName, voterLName, voterMName } = req.body;

  const sql = `
    INSERT INTO voters (voterIDNum, voterPass, voterFName, voterLName, voterMName)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [voterIDNum, voterPass, voterFName, voterLName, voterMName || null], (err, result) => {
    if (err)
      return res.status(500).json({ error: 'Failed to add voter', details: err.message });

    res.json({ message: 'Voter added successfully', voterID: result.insertId });
  });
});


// 🔵 UPDATE voter data
app.put('/api/voters/:id', (req, res) => {
  const { id } = req.params;
  const { voterFName, voterLName, voterMName, voterPass } = req.body;

  // COALESCE(x, existingColumn) = only update password if provided
  const sql = `
    UPDATE voters
    SET voterFName = ?, voterLName = ?, voterMName = ?, 
        voterPass = COALESCE(?, voterPass)
    WHERE voterID = ?
  `;

  db.query(sql, [voterFName, voterLName, voterMName || null, voterPass, id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update voter' });
    res.json({ message: 'Voter updated successfully' });
  });
});


// 🔴 Update voter status (Active or Inactive)
app.put('/api/voters/status/:id', (req, res) => {
  const { id } = req.params;
  const { voterStat } = req.body;

  const sql = 'UPDATE voters SET voterStat = ? WHERE voterID = ?';
  db.query(sql, [voterStat, id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update voter status' });
    res.json({ message: 'Voter status updated successfully' });
  });
});



// ──────────────────────────────────────────────────────────────
// 🧍 SECTION 3: CANDIDATE MANAGEMENT (CRUD)
// ──────────────────────────────────────────────────────────────

// 🟢 READ all candidates with their position name
app.get('/api/candidates', (req, res) => {
  const sql = `
    SELECT c.*, p.positionName
    FROM candidates c
    JOIN positions p ON c.positionID = p.positionID
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch candidates' });
    res.json(result);
  });
});


// 🟡 Add candidate
app.post('/api/candidates', (req, res) => {
  const { candidIDNum, candidFName, candidLName, candidMName, positionID } = req.body;

  const sql = `
    INSERT INTO candidates (candidIDNum, candidFName, candidLName, candidMName, positionID)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [candidIDNum, candidFName, candidLName, candidMName || null, positionID], (err) => {
    if (err)
      return res.status(500).json({ error: 'Failed to add candidate', details: err.message });

    res.json({ message: 'Candidate added successfully' });
  });
});


// 🔵 Update candidate
app.put('/api/candidates/:id', (req, res) => {
  const { id } = req.params;
  const { candidFName, candidLName, candidMName, positionID } = req.body;

  const sql = `
    UPDATE candidates
    SET candidFName = ?, candidLName = ?, candidMName = ?, positionID = ?
    WHERE candidID = ?
  `;

  db.query(sql, [candidFName, candidLName, candidMName || null, positionID, id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update candidate' });
    res.json({ message: 'Candidate updated successfully' });
  });
});


// 🔴 Update candidate status (Active / Inactive)
app.put('/api/candidates/status/:id', (req, res) => {
  const { id } = req.params;
  const { candStat } = req.body;

  const sql = 'UPDATE candidates SET candStat = ? WHERE candidID = ?';
  db.query(sql, [candStat, id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update candidate status' });
    res.json({ message: 'Candidate status updated successfully' });
  });
});



// ──────────────────────────────────────────────────────────────
// 🗳️ SECTION 4: VOTING (Login + Submission)
// ──────────────────────────────────────────────────────────────
//
// This section handles:
// 1. voter login
// 2. retrieving the ballot
// 3. submitting votes

// 🟢 LOGIN voter
app.post('/api/voters/login', (req, res) => {
  const { voterIDNum, voterPass } = req.body;

  // Step 1: Verify voter credentials
  const sqlVoter = `
    SELECT * FROM voters 
    WHERE voterIDNum = ? AND voterPass = ?
      AND voterStat = 'Active'
      AND voted = 'N'
  `;

  db.query(sqlVoter, [voterIDNum, voterPass], (err, voterResult) => {
    if (err || voterResult.length === 0) {
      return res.status(401).json({
        error: 'Login failed or voter inactive/already voted.',
      });
    }

    const voter = voterResult[0];

    // Step 2: Load the ballot (candidates for open positions only)
    const sqlCandidates = `
      SELECT c.*, p.positionName, p.numOfPositions
      FROM candidates c
      JOIN positions p ON c.positionID = p.positionID
      WHERE c.candStat = 'Active' AND p.status = 'Open'
      ORDER BY p.positionID, c.candidLName
    `;

    db.query(sqlCandidates, (err, candidates) => {
      if (err) return res.status(500).json({ error: 'Failed to load ballot.' });

      // Group candidates by position
      const grouped = candidates.reduce((acc, cand) => {
        const { positionID, positionName, numOfPositions, ...rest } = cand;

        if (!acc[positionID])
          acc[positionID] = { positionName, numOfPositions, candidateList: [] };

        acc[positionID].candidateList.push(rest);
        return acc;
      }, {});

      // Hide password before sending to user
      const { voterPass: _, ...safeVoter } = voter;

      res.json({ voter: safeVoter, candidates: grouped });
    });
  });
});


// 🟡 Submit votes
app.post('/api/votes', (req, res) => {
  const { votes, voterID } = req.body;

  if (!votes || votes.length === 0)
    return res.status(400).json({ error: 'No votes submitted.' });

  // Prepare bulk insert values
  const values = votes.map(v => [v.positionID, v.voterID, v.candidID]);

  const sqlInsert = 'INSERT INTO votes (positionID, voterID, candidID) VALUES ?';

  // Step 1: Save votes
  db.query(sqlInsert, [values], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to record votes.' });

    // Step 2: Update voter as "voted"
    const sqlUpdate = 'UPDATE voters SET voted = "Y" WHERE voterID = ?';

    db.query(sqlUpdate, [voterID], (err) => {
      if (err)
        return res.status(500).json({
          message: 'Votes recorded, but failed to mark voter as voted.',
          warning: true,
        });

      res.json({ message: 'Votes successfully recorded and voter marked as voted.' });
    });
  });
});



// ──────────────────────────────────────────────────────────────
// 📊 SECTION 5: ELECTION RESULTS & WINNERS
// ──────────────────────────────────────────────────────────────
//
// This does not pick winners yet —
// It only returns vote counts sorted by highest votes.

// 🟢 GET raw results
app.get('/api/results', (req, res) => {
  const sql = `
    SELECT
      p.positionID,
      p.positionName,
      c.candidID,
      c.candidFName,
      c.candidLName,
      COUNT(v.voteID) AS voteCount,
      (
        SELECT COUNT(*)
        FROM votes v_total
        WHERE v_total.positionID = p.positionID
      ) AS totalVotesForPosition
    FROM positions p
    JOIN candidates c ON p.positionID = c.positionID
    LEFT JOIN votes v ON c.candidID = v.candidID
    GROUP BY p.positionID, c.candidID
    ORDER BY p.positionID, voteCount DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to calculate results.' });
    res.json(result);
  });
});


// 🟡 GET winners (ranked by vote count)
app.get('/api/winners', (req, res) => {
  const sql = `
    SELECT
      p.positionID,
      p.positionName,
      p.numOfPositions,
      c.candidID,
      c.candidFName,
      c.candidLName,
      COUNT(v.voteID) AS voteCount
    FROM positions p
    JOIN candidates c ON p.positionID = c.positionID
    LEFT JOIN votes v ON c.candidID = v.candidID
    GROUP BY p.positionID, c.candidID
    ORDER BY p.positionID, voteCount DESC
  `;

  db.query(sql, (err, result) => {
    if (err)
      return res.status(500).json({ error: 'Failed to calculate election winners.' });

    res.json(result);
  });
});



// ──────────────────────────────────────────────────────────────
// 🏁 START THE SERVER
// ──────────────────────────────────────────────────────────────
// This activates your API so you can access routes like:
// http://localhost:3001/api/positions
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
