# 🗳️ Election Project: Full Stack Skills Test

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18.16.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v19.2.0-blue)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-v10.4.32-orange)](https://www.mysql.com/)

Greetings! I am **AKUMON**, and this repository demonstrates a practice **full-stack web application** for an upcoming skills test. The project uses the **MySQL, Express, React, Node.js (MERN-like) stack**.  

---

## 📌 Table of Contents

1. [Tech Stack Overview](#-tech-stack-overview)
2. [Project Structure](#-project-structure)
3. [Backend Setup (Node + Express + MySQL)](#-backend-setup-node--express--mysql)
4. [Frontend Setup (React)](#-frontend-setup-react)
5. [Running the Application](#-running-the-application)
6. [Notes & Best Practices](#-notes--best-practices)
7. [Next Steps](#-next-steps)
8. [License](#-license)

---

## 🛠 Tech Stack Overview

| Technology | Role | Description |
|-----------------|------------------------|-------------------------------------------------------|
| __MySQL__ | Database | Stores all application data. |
| __Express.js__ | Backend Framework | Handles server logic and API routes. |
| __React__ | Frontend Library | Builds interactive user interfaces. |
| __Node.js__ | Runtime Environment  Executes JavaScript on the server side. |

---

## 📂 Project Structure

```bash
election_project/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── node_modules/
└── client/
├── src/
├── public/
├── package.json
└── node_modules/
```

---

# Phase 1️⃣
> Backend handles API logic and database interaction, while frontend is the user interface.

---

## ⚙️ Backend Setup (Node + Express + MySQL)

1. **Create MySQL database**using PhpMyAdmin.  

```sql

-- 1. Create the database
CREATE DATABASE election_system_db;
USE election_system_db;

-- 2. Positions Table
-- status: 'Open' / 'Closed'
CREATE TABLE positions (
    positionID INT AUTO_INCREMENT PRIMARY KEY,
    positionName VARCHAR(100) NOT NULL UNIQUE,
    numOfPositions INT NOT NULL, -- Max number of candidates a voter can choose for this position (e.g., 1 for President, 12 for Senator)
    status ENUM('Open', 'Closed') DEFAULT 'Open' -- 'Open' for active voting, 'Closed' for results
);

-- 3. Voters Table
-- voterStat: 'Active' / 'Inactive'
-- voted: 'Y' / 'N'
-- NOTE: I'm adding a simple password column (voterPass) as the instructions require login with voterID and VoterPass.
CREATE TABLE voters (
    voterID INT AUTO_INCREMENT PRIMARY KEY,
    voterIDNum VARCHAR(50) NOT NULL UNIQUE, -- Used for login/username
    voterPass VARCHAR(255) NOT NULL, -- Password for login (e.g., hash it later, but for this exam, a plain string might suffice)
    voterFName VARCHAR(100) NOT NULL,
    voterLName VARCHAR(100) NOT NULL,
    voterMName VARCHAR(100),
    voterStat ENUM('Active', 'Inactive') DEFAULT 'Inactive',
    voted ENUM('Y', 'N') DEFAULT 'N'
);

-- 4. Candidates Table
-- candStat: 'Active' / 'Inactive'
CREATE TABLE candidates (
    candidID INT AUTO_INCREMENT PRIMARY KEY,
    candidIDNum VARCHAR(50) NOT NULL UNIQUE, -- Candidate's unique ID/number
    candidFName VARCHAR(100) NOT NULL,
    candidLName VARCHAR(100) NOT NULL,
    candidMName VARCHAR(100),
    positionID INT NOT NULL,
    candStat ENUM('Active', 'Inactive') DEFAULT 'Active',
    FOREIGN KEY (positionID) REFERENCES positions(positionID)
);

-- 5. Votes Table
CREATE TABLE votes (
    voteID INT AUTO_INCREMENT PRIMARY KEY,
    positionID INT NOT NULL,
    voterID INT NOT NULL,
    candidID INT NOT NULL,
    -- Added a unique constraint to prevent a voter from voting twice for the *same* position/candidate (though the 'voted' field handles the overall voting)
    -- This constraint is more of a safety measure: each voter gets one row per candidate vote.
    UNIQUE KEY unique_vote (voterID, positionID, candidID),
    FOREIGN KEY (positionID) REFERENCES positions(positionID),
    FOREIGN KEY (voterID) REFERENCES voters(voterID),
    FOREIGN KEY (candidID) REFERENCES candidates(candidID)
);

-- You'll need to fill in some dummy data for testing.

```

2. **Organize folders**:

```bash
mkdir backend frontend
```

> Or name them `server` and `client` as preferred.

3. **Initialize backend**:

```bash
cd backend
npm init -y
npm install express mysql body-parser cors nodemon
```

4. **Backend Dependencies Breakdown**:

| Package     | Role            | Purpose                                 |
| ----------- | --------------- | --------------------------------------- |
| express     | Web framework   | Build APIs and handle routes            |
| mysql       | Database driver | Connect to MySQL database               |
| body-parser | Middleware      | Parse incoming JSON/form data           |
| cors        | Middleware      | Enable frontend ↔ backend communication |
| nodemon     | Dev tool        | Auto-restart server on code changes     |

5. **Configure `package.json` scripts**:

```json
"main": "server.js",
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

6. **Create `server.js`** in the backend folder.

   * Add your Express server code.
   * Test backend:

```bash
npm run dev
```

---

## ⚛️ Frontend Setup (React)

1. **Create a React application**:

```bash
cd ..
npx create-react-app client
```

> You can name it `frontend` if you prefer.

2. **Install frontend dependencies**:

```bash
cd client
npm install bootstrap react-bootstrap axios react-router-dom
```

3. **Frontend Dependencies Breakdown**:

| Package / Command             | Purpose                                | Example Usage                                                      |
| ----------------------------- | -------------------------------------- | ------------------------------------------------------------------ |
| `npx create-react-app client` | Initialize React project               | `npx create-react-app myapp`                                       |
| bootstrap                     | CSS framework for styling              | `<button className="btn btn-primary">Click</button>`               |
| react-bootstrap               | React components styled with Bootstrap | `<Button variant="success">Save</Button>`                          |
| axios                         | HTTP client for API calls              | `axios.get('/api/users')`                                          |
| react-router-dom              | Client-side routing                    | `import { BrowserRouter, Routes, Route } from 'react-router-dom';` |

4. **Setup Proxy for API calls on Frontend**:

```json
"proxy": "http://localhost:3001"
```

> Requests from React (port 3000) are forwarded to the backend server (port 3001) to avoid CORS issues.

---

## 🚀 Running the Application

1. **Start Backend**:

```bash
cd backend
npm run dev
```

2. **Start Frontend**:

```bash
cd client
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to see the frontend, communicating with backend at [http://localhost:3001](http://localhost:3001).

---

# Phase 2️⃣
> Developing application

1. Go to `App.js` located in frontend/src/App.js and modify the and change the code. (Rest of the comments and instructions are in the code itself)

2. go to `src` folder and create a folder named `components` as well as creating the necessary modules the importeted in the `App.js` (CRUDs)

> Component folder are the reusable, modular pieces of your UI.

```bash
cd frontend
cd src
mkdir components
cd components
touch touch PositionsManagement.js VoterManagement.js CandidateManagement.js VotingUI.js ResultsUI.js WinnersUI.js Home.js
```

3. Go to `PositionsManagement.js` file under `components` folder and encode the necessary code to function the logic of Positions. (Rest of the comments and instructions are in the code itself)

4. Go to `VotingUI.js` file under `components` folder and encode the necessary code to function the logic of Positions. (Rest of the comments and instructions are in the code itself)

> This is the most complex module due to the constraints.
> **Key Steps & Logic:**
- **Voter Login:** Collect `voterIDNum` and `voterPass`.
  - **Backend Check:** Verify credentials, check `voterStat = 'Active'`, and check `voted = 'N'`.
- **Display Positions/Candidates:** On successful login, fetch all **'Active'** candidates grouped by **'Open'** positions.
- **Handle Voting:** Allow the user to select candidates.
  - **Frontend Constraint:** Enforce that the number of selected candidates for a position (e.g., Senator) is $\le$ `numOfPositions` for that position.
- **Vote Submission:** Send the final list of votes (an array of `positionID` and `candidID`) to the backend.
  - **Backend Action:** Insert all votes into the `votes` table.
  - **Backend Action:** **Crucially**, update the logged-in voter's `voted` field to `'Y'`.



5. Go to `ResultsUI.js` file under `components` folder and encode the necessary code to function the logic of Positions. (Rest of the comments and instructions are in the code itself)

6. Go to `WinnersUI.js` file under `components` folder and encode the necessary code to function the logic of Positions. (Rest of the comments and instructions are in the code itself)

7. Go to `Home.js` (Landing Page) file under `components` folder and encode the necessary code to function the logic of Positions. (Rest of the comments and instructions are in the code itself)

>This component simply acts as the landing page, providing context for the application.

8. Go to `VoterManagement.js` (Landing Page) file under `components` folder and encode the necessary code to function the logic of Positions. (Rest of the comments and instructions are in the code itself)

> This code includes:
- Form for Adding a voter.
- Table to Read all voters.
- Modal or Form for Updating details.
- Button for Deactivating (`voterStat` to 'Inactive').

9. Go to `CandidateManagement.js` (Landing Page) file under `components` folder and encode the necessary code to function the logic of Positions. (Rest of the comments and instructions are in the code itself)

> This component requires CRUD (Create, Read, Update, Deactivate) operations against the /api/candidates endpoint, and requires fetching the list of Positions to assign a candidate to a role.