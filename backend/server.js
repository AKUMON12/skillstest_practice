// ──────────────────────────────────────────────────────────────
// 📦 IMPORT DEPENDENCIES
// ──────────────────────────────────────────────────────────────
// These are all the modules your server needs to run.
import express from 'express';          // Web framework for building the server & API endpoints
import mysql from 'mysql';              // MySQL client for connecting & querying the database
import bodyParser from 'body-parser';   // Middleware for parsing incoming JSON request bodies
import cors from 'cors';                // Enables Cross-Origin Resource Sharing (for frontend-backend connection)


// ──────────────────────────────────────────────────────────────
// 🚀 INITIALIZE EXPRESS APP
// ──────────────────────────────────────────────────────────────
const app = express();
const PORT = 3001;          // The backend server will run on http://localhost:3001

// Apply middleware
app.use(cors());            // Allows frontend (React) to communicate with backend
app.use(bodyParser.json()); // Converts JSON request bodies into JS objects


// ──────────────────────────────────────────────────────────────
// 🗄️ MYSQL DATABASE CONNECTION
// ──────────────────────────────────────────────────────────────
const db = mysql.createConnection({
  host: 'localhost',                // Usually 'localhost' when using XAMPP
  user: 'root',                     // Default MySQL user for XAMPP
  password: '',                     // Default password is empty
  database: 'election_system_db',   // Your database name
});

// Connect to MySQL and confirm the connection
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

// 🟢 READ all positions
app.get('/api/positions', (req, res) => {
  const sql = 'SELECT * FROM positions';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch positions' });
    res.json(result);
  });
});

// 🟡 CREATE a new position
app.post('/api/positions', (req, res) => {
  const { positionName, numOfPositions } = req.body;
  const sql = 'INSERT INTO positions (positionName, numOfPositions) VALUES (?, ?)';
  db.query(sql, [positionName, numOfPositions], (err, result) => {
    if (err)
      return res.status(500).json({ error: 'Failed to add position', details: err.message });
    res.json({ message: 'Position added successfully', positionID: result.insertId });
  });
});

// 🔵 UPDATE position details
app.put('/api/positions/:id', (req, res) => {
  const { id } = req.params;
  const { positionName, numOfPositions } = req.body;
  const sql =
    'UPDATE positions SET positionName = ?, numOfPositions = ? WHERE positionID = ?';
  db.query(sql, [positionName, numOfPositions, id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update position' });
    res.json({ message: 'Position updated successfully' });
  });
});

// 🔴 UPDATE position status (Open / Closed)
app.put('/api/positions/status/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Expected values: 'Open' or 'Closed'
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

// 🟢 READ all voters (excluding passwords for security)
app.get('/api/voters', (req, res) => {
  const sql =
    'SELECT voterID, voterIDNum, voterFName, voterLName, voterStat, voted FROM voters';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch voters' });
    res.json(result);
  });
});

// 🟡 CREATE new voter
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

// 🔵 UPDATE voter details
app.put('/api/voters/:id', (req, res) => {
  const { id } = req.params;
  const { voterFName, voterLName, voterMName, voterPass } = req.body;
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

// 🔴 UPDATE voter status (Active / Inactive)
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

// 🟢 READ all candidates (joined with position name)
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

// 🟡 CREATE new candidate
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

// 🔵 UPDATE candidate details
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

// 🔴 UPDATE candidate status (Active / Inactive)
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

// 🟢 Voter Login
// Checks credentials and loads active candidates for open positions.
app.post('/api/voters/login', (req, res) => {
  const { voterIDNum, voterPass } = req.body;

  const sqlVoter = `
    SELECT * FROM voters 
    WHERE voterIDNum = ? AND voterPass = ?
      AND voterStat = 'Active' AND voted = 'N'
  `;

  db.query(sqlVoter, [voterIDNum, voterPass], (err, voterResult) => {
    if (err || voterResult.length === 0) {
      return res.status(401).json({
        error: 'Login failed or voter inactive/already voted.',
      });
    }

    const voter = voterResult[0];

    // Get active candidates for all open positions
    const sqlCandidates = `
      SELECT c.*, p.positionName, p.numOfPositions
      FROM candidates c
      JOIN positions p ON c.positionID = p.positionID
      WHERE c.candStat = 'Active' AND p.status = 'Open'
      ORDER BY p.positionID, c.candidLName
    `;

    db.query(sqlCandidates, (err, candidates) => {
      if (err) return res.status(500).json({ error: 'Failed to load ballot.' });

      // Group candidates by their position
      const grouped = candidates.reduce((acc, cand) => {
        const { positionID, positionName, numOfPositions, ...rest } = cand;
        if (!acc[positionID])
          acc[positionID] = { positionName, numOfPositions, candidateList: [] };
        acc[positionID].candidateList.push(rest);
        return acc;
      }, {});

      // Remove password before sending response
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

  const values = votes.map(v => [v.positionID, v.voterID, v.candidID]);
  const sqlInsert = 'INSERT INTO votes (positionID, voterID, candidID) VALUES ?';

  // Record the votes
  db.query(sqlInsert, [values], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to record votes.' });

    // Update voter's "voted" flag
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

// 🟢 GET election results (vote counts per candidate)
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
        SELECT COUNT(*) FROM votes v_total WHERE v_total.positionID = p.positionID
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

// 🟡 GET election winners
// Returns ranked candidates; frontend determines winners based on numOfPositions
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
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});