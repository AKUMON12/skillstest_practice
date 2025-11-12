// src/components/ResultsUI.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/results'; // Backend API for election results

const ResultsUI = () => {
    const [results, setResults] = useState(null); // Stores grouped results
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const fetchResults = async () => {
        setLoading(true);
        try {
            // Backend must return pre-calculated vote counts and total votes per position
            const response = await axios.get(API_URL); 
            
            // Group and format the data for display
            const groupedResults = response.data.reduce((acc, curr) => {
                const posKey = `${curr.positionID}_${curr.positionName}`;
                if (!acc[posKey]) acc[posKey] = { positionName: curr.positionName, candidates: [] };
                
                // Calculate percentage
                const percentage = (curr.voteCount / curr.totalVotesForPosition) * 100;
                
                acc[posKey].candidates.push({
                    candidID: curr.candidID,
                    candidateName: `${curr.candidFName} ${curr.candidLName}`,
                    voteCount: curr.voteCount,
                    percentage: percentage.toFixed(2)
                });
                return acc;
            }, {});
            setResults(groupedResults);
        } catch (error) {
            setMessage('Error fetching election results. Ensure the backend is running.');
            setResults({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    if (loading) {
        return <Spinner animation="border" />;
    }

    if (Object.keys(results).length === 0) {
        return <Alert variant="warning">No results available or election is not yet finished.</Alert>;
    }
    
    return (
        <Container>
            <h2>📊 Election Results UI</h2>
            {message && <Alert variant="info">{message}</Alert>}

            {Object.entries(results).map(([posKey, data]) => (
                <Card key={posKey} className="mb-4">
                    <Card.Header className="bg-light">
                        <h4>{data.positionName}</h4>
                    </Card.Header>
                    <Card.Body>
                        <ul className="list-unstyled">
                            {/* Sort candidates by vote count descending for clearer display */}
                            {data.candidates.sort((a, b) => b.voteCount - a.voteCount).map(cand => (
                                <li key={cand.candidID} className="mb-2">
                                    **{cand.candidateName}** (
                                        **{cand.voteCount}** Total Votes, 
                                        **{cand.percentage}%** Voting %
                                    )
                                </li>
                            ))}
                        </ul>
                    </Card.Body>
                </Card>
            ))}
        </Container>
    );
};

export default ResultsUI;