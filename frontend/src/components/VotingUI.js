// Import necessary libraries and components
import React, { useState } from 'react';  // Import React and the useState hook for managing state
import { Card, Form, Button, Alert } from 'react-bootstrap';  // Import Bootstrap components for styling
import axios from 'axios';  // Import axios to make HTTP requests to the backend API

import '../styles/VotingUI.css';  // Import custom CSS for styling

const VotingUI = () => {
    // State variables to manage various parts of the voting process
    const [loginData, setLoginData] = useState({ voterIDNum: '', voterPass: '' });  // Stores login credentials (ID and password)
    const [voter, setVoter] = useState(null);  // Holds the logged-in voter's data
    const [candidates, setCandidates] = useState([]);  // Holds the list of candidates, grouped by position
    const [selectedVotes, setSelectedVotes] = useState({});  // Stores the selected votes for each position
    const [message, setMessage] = useState('');  // Stores any informational or error messages to show to the user

    // Step 1: Handle Voter Login
    const handleLogin = async (e) => {
        e.preventDefault();  // Prevent form submission (default behavior)
        try {
            // Backend route for voter login. The API checks the voter credentials and returns data
            const response = await axios.post('http://localhost:3001/api/voters/login', loginData);
            setVoter(response.data.voter);  // Set the logged-in voter's data
            setCandidates(response.data.candidates);  // Set the list of candidates for the voter
            setMessage('Login successful! Please cast your votes.');  // Show success message
        } catch (error) {
            setMessage('Login failed. Check ID/Password or your Active/Voted status.');  // Show error message if login fails
            setVoter(null);  // Reset voter data on login failure
        }
    };

    // Step 3: Handle selection of candidates for voting
    const handleVoteSelection = (positionID, candidID, numOfPositions) => {
        const currentVotes = selectedVotes[positionID] || [];  // Get the current selected votes for the given position
        const isSelected = currentVotes.includes(candidID);  // Check if the candidate is already selected

        if (isSelected) {
            // Deselect the candidate: remove the candidate from the current selection
            const newSelection = currentVotes.filter(id => id !== candidID);
            setSelectedVotes({ ...selectedVotes, [positionID]: newSelection });  // Update the selected votes
        } else if (currentVotes.length < numOfPositions) {
            // Select the candidate: add the candidate to the current selection
            setSelectedVotes({ ...selectedVotes, [positionID]: [...currentVotes, candidID] });  // Update the selected votes
        } else {
            // Show a message if the voter tries to select more than allowed candidates for this position
            setMessage(`Constraint: You can only vote for up to ${numOfPositions} candidate(s) for this position.`);
        }
    };

    // Step 4: Submit the final votes to the backend
    const handleSubmitVotes = async () => {
        if (!voter) return;  // If no voter is logged in, do nothing

        // Flatten the selectedVotes object to create an array of vote objects for submission
        const finalVotes = Object.entries(selectedVotes).flatMap(([positionID, candidIDs]) =>
            candidIDs.map(candidID => ({
                voterID: voter.voterID,  // Use the logged-in voter's internal ID
                positionID: parseInt(positionID),  // Convert positionID to an integer
                candidID: candidID  // Candidate ID for the selected candidate
            }))
        );

        try {
            // Backend route to submit the votes and set the voter's "voted" status to 'Y'
            await axios.post('http://localhost:3001/api/votes', { votes: finalVotes, voterID: voter.voterID });
            setMessage('🗳️ Your votes have been successfully submitted! You cannot vote again.');  // Show success message
            setVoter(null);  // Log out the user after submitting votes
            setSelectedVotes({});  // Clear the selected votes
        } catch (error) {
            setMessage('Error submitting votes. Please check server logs.');  // Show error message if vote submission fails
        }
    };

    // JSX to render the login form (if no voter is logged in) or the voting interface (if the voter is logged in)
    return (
        <div>
            <h2>🗳️ Voting/Votation UI</h2>
            {message && <Alert variant="info">{message}</Alert>}  {/* Display message if there is any */}

            {!voter ? (
                // Login Form (only visible if no voter is logged in)
                <Card>
                    <Card.Body>
                        <Form onSubmit={handleLogin}>  {/* Handle login form submission */}
                            <Form.Group className="mb-3">
                                <Form.Label>Voter ID Num (Username)</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="voterIDNum"
                                    value={loginData.voterIDNum}  // Bind value to loginData state
                                    onChange={(e) => setLoginData({ ...loginData, voterIDNum: e.target.value })}  // Update state on input change
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Voter Pass (Password)</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="voterPass"
                                    value={loginData.voterPass}  // Bind value to loginData state
                                    onChange={(e) => setLoginData({ ...loginData, voterPass: e.target.value })}  // Update state on input change
                                    required
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit">Login to Vote</Button>  {/* Login button */}
                        </Form>
                    </Card.Body>
                </Card>
            ) : (
                // Voting Interface (only visible if a voter is logged in)
                <div>
                    <h4>Welcome, {voter.voterFName} {voter.voterLName}. Cast your votes below.</h4>
                    {/* Map through candidates and create checkboxes for each one */}
                    {Object.entries(candidates).map(([positionID, { positionName, numOfPositions, candidateList }]) => (
                        <Card key={positionID} className="mb-3">
                            <Card.Header>
                                **{positionName}** (Select max {numOfPositions})
                            </Card.Header>
                            <Card.Body>
                                {/* Render checkboxes for each candidate in the position */}
                                {candidateList.map(cand => (
                                    <Form.Check
                                        key={cand.candidID}
                                        type="checkbox"
                                        label={`${cand.candidFName} ${cand.candidLName}`}
                                        checked={selectedVotes[positionID] && selectedVotes[positionID].includes(cand.candidID)}  // Check if candidate is selected
                                        onChange={() => handleVoteSelection(positionID, cand.candidID, numOfPositions)}  // Handle selection/deselection
                                    />
                                ))}
                            </Card.Body>
                        </Card>
                    ))}
                    <Button variant="success" onClick={handleSubmitVotes} className="mt-3">
                        Submit Final Votes  {/* Button to submit the votes */}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default VotingUI;  // Export the VotingUI component for use in other parts of the application