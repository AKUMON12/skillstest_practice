// Simplified Logic for VotingUI.js
import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const VotingUI = () => {
    const [loginData, setLoginData] = useState({ voterIDNum: '', voterPass: '' });
    const [voter, setVoter] = useState(null); // Holds logged-in voter data
    const [candidates, setCandidates] = useState([]); // Candidates grouped by position
    const [selectedVotes, setSelectedVotes] = useState({}); // { positionID: [candidID1, candidID2, ...], ... }
    const [message, setMessage] = useState('');

    // Step 1: Handle Voter Login
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Backend route for login (Must implement this route in server.js)
            const response = await axios.post('http://localhost:3001/api/voters/login', loginData);
            setVoter(response.data.voter);
            setCandidates(response.data.candidates); // Assuming backend sends candidates on successful login
            setMessage('Login successful! Please cast your votes.');
        } catch (error) {
            setMessage('Login failed. Check ID/Password or your Active/Voted status.');
            setVoter(null);
        }
    };
    
    // Step 3: Handle selection of candidates
    const handleVoteSelection = (positionID, candidID, numOfPositions) => {
        const currentVotes = selectedVotes[positionID] || [];
        const isSelected = currentVotes.includes(candidID);

        if (isSelected) {
            // Deselect: remove the candidate
            const newSelection = currentVotes.filter(id => id !== candidID);
            setSelectedVotes({ ...selectedVotes, [positionID]: newSelection });
        } else if (currentVotes.length < numOfPositions) {
            // Select: add the candidate, checking the constraint
            setSelectedVotes({ ...selectedVotes, [positionID]: [...currentVotes, candidID] });
        } else {
            setMessage(`Constraint: You can only vote for up to ${numOfPositions} candidate(s) for this position.`);
        }
    };

    // Step 4: Submit Final Votes
    const handleSubmitVotes = async () => {
        if (!voter) return;

        // Flatten the selectedVotes object into an array of { voterID, positionID, candidID }
        const finalVotes = Object.entries(selectedVotes).flatMap(([positionID, candidIDs]) =>
            candidIDs.map(candidID => ({
                voterID: voter.voterID, // Use the logged-in voter's internal ID
                positionID: parseInt(positionID),
                candidID: candidID
            }))
        );

        try {
            // Backend route for submitting votes and setting voted='Y' (Must implement)
            await axios.post('http://localhost:3001/api/votes', { votes: finalVotes, voterID: voter.voterID });
            setMessage('🗳️ Your votes have been successfully submitted! You cannot vote again.');
            setVoter(null); // Log out after voting
            setSelectedVotes({});
        } catch (error) {
            setMessage('Error submitting votes. Please check server logs.');
        }
    };
    
    // ... JSX for login form (if !voter) and voting form (if voter) ...
    
    return (
        <div>
            <h2>🗳️ Voting/Votation UI</h2>
            {message && <Alert variant="info">{message}</Alert>}

            {!voter ? (
                // Login Form
                <Card>
                    <Card.Body>
                        <Form onSubmit={handleLogin}>
                            <Form.Group className="mb-3"><Form.Label>Voter ID Num (Username)</Form.Label><Form.Control type="text" name="voterIDNum" value={loginData.voterIDNum} onChange={(e) => setLoginData({...loginData, voterIDNum: e.target.value})} required/></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Voter Pass (Password)</Form.Label><Form.Control type="password" name="voterPass" value={loginData.voterPass} onChange={(e) => setLoginData({...loginData, voterPass: e.target.value})} required/></Form.Group>
                            <Button variant="primary" type="submit">Login to Vote</Button>
                        </Form>
                    </Card.Body>
                </Card>
            ) : (
                // Voting Interface
                <div>
                    <h4>Welcome, {voter.voterFName} {voter.voterLName}. Cast your votes below.</h4>
                    {/* ... Map through candidates by position ... */}
                    {Object.entries(candidates).map(([positionID, { positionName, numOfPositions, candidateList }]) => (
                        <Card key={positionID} className="mb-3">
                            <Card.Header>
                                **{positionName}** (Select max {numOfPositions})
                            </Card.Header>
                            <Card.Body>
                                {candidateList.map(cand => (
                                    <Form.Check
                                        key={cand.candidID}
                                        type="checkbox"
                                        label={`${cand.candidFName} ${cand.candidLName}`}
                                        checked={selectedVotes[positionID] && selectedVotes[positionID].includes(cand.candidID)}
                                        onChange={() => handleVoteSelection(positionID, cand.candidID, numOfPositions)}
                                    />
                                ))}
                            </Card.Body>
                        </Card>
                    ))}
                    <Button variant="success" onClick={handleSubmitVotes} className="mt-3">
                        Submit Final Votes
                    </Button>
                </div>
            )}
        </div>
    );
};

export default VotingUI;