// src/components/WinnersUI.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/winners'; // Backend API for election winners

const WinnersUI = () => {
    const [winners, setWinners] = useState(null); // Stores grouped winner data
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const fetchWinners = async () => {
        setLoading(true);
        try {
            // Backend must return vote counts, sorted descending by votes, and includes numOfPositions
            const response = await axios.get(API_URL); 
            
            // Group and filter the data to select the top N (numOfPositions)
            const groupedResults = response.data.reduce((acc, curr) => {
                const posKey = `${curr.positionID}_${curr.positionName}`;
                
                if (!acc[posKey]) {
                    acc[posKey] = { 
                        positionName: curr.positionName, 
                        numOfPositions: curr.numOfPositions, 
                        winnersList: [] 
                    };
                }
                
                // Only add winners up to the specified limit (numOfPositions)
                if (acc[posKey].winnersList.length < curr.numOfPositions) {
                    acc[posKey].winnersList.push({
                        candidID: curr.candidID,
                        candidateName: `${curr.candidFName} ${curr.candidLName}`,
                        voteCount: curr.voteCount
                    });
                }
                return acc;
            }, {});
            setWinners(groupedResults);

        } catch (error) {
            setMessage('Error fetching election winners. Ensure the backend is running and data is sorted.');
            setWinners({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWinners();
    }, []);
    
    if (loading) {
        return <Spinner animation="border" />;
    }

    if (Object.keys(winners).length === 0) {
        return <Alert variant="warning">No winners declared yet.</Alert>;
    }
    
    return (
        <Container>
            <h2>🏅 Election Winners UI</h2>
            {message && <Alert variant="info">{message}</Alert>}

            {Object.entries(winners).map(([posKey, data]) => (
                <Card key={posKey} className="mb-4 bg-info bg-opacity-10 border-info">
                    <Card.Header className="bg-info text-white">
                        <h4 className="my-1">Elective Position: {data.positionName} ({data.numOfPositions} Winner(s))</h4>
                    </Card.Header>
                    <Card.Body>
                        <ol className="list-unstyled">
                            {data.winnersList.map((winner, index) => (
                                <li key={winner.candidID} className="mb-2 p-2 border-bottom">
                                    {/* Display rank only if there is more than one winner */}
                                    {data.numOfPositions > 1 && <span className="fw-bold me-2">Rank {index + 1}: </span>}
                                    Winner: **{winner.candidateName}**, Total Votes: **{winner.voteCount}**
                                </li>
                            ))}
                        </ol>
                    </Card.Body>
                </Card>
            ))}
        </Container>
    );
};

export default WinnersUI;