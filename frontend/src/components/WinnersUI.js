// Import necessary libraries and components
import React, { useState, useEffect } from 'react';  // Import React and hooks (useState, useEffect) for managing state and side effects
import { Container, Card, Alert, Spinner } from 'react-bootstrap';  // Import Bootstrap components for layout and styling
import axios from 'axios';  // Import axios to make HTTP requests to the backend API

import '../styles/WinnersUI.css';  // Import custom CSS for styling

// Define the API URL to fetch election winners data
const API_URL = 'http://localhost:3001/api/winners';  // Backend API for fetching election winners

// Functional component for displaying election winners
const WinnersUI = () => {
    // State variables to manage the election data, loading state, and messages
    const [winners, setWinners] = useState(null);  // Stores the grouped winner data
    const [loading, setLoading] = useState(true);  // Manages loading state (initially true to indicate data is being fetched)
    const [message, setMessage] = useState('');  // Stores any messages to show the user (e.g., success or error messages)

    // Fetch winners data from the backend
    const fetchWinners = async () => {
        setLoading(true);  // Set loading to true when fetching starts
        try {
            // Make a GET request to the backend API to fetch the winners data
            const response = await axios.get(API_URL);
            
            // Group and filter the data based on positionID and positionName
            // We want to select the top 'numOfPositions' winners for each position
            const groupedResults = response.data.reduce((acc, curr) => {
                const posKey = `${curr.positionID}_${curr.positionName}`;  // Create a unique key for each position

                // If the position doesn't exist in the accumulator, create it
                if (!acc[posKey]) {
                    acc[posKey] = { 
                        positionName: curr.positionName,  // Store position name
                        numOfPositions: curr.numOfPositions,  // Store number of winners allowed for the position
                        winnersList: []  // Initialize an empty array to hold the winners for this position
                    };
                }

                // Only add winners up to the specified limit (numOfPositions)
                if (acc[posKey].winnersList.length < curr.numOfPositions) {
                    acc[posKey].winnersList.push({
                        candidID: curr.candidID,  // Candidate ID
                        candidateName: `${curr.candidFName} ${curr.candidLName}`,  // Candidate full name
                        voteCount: curr.voteCount  // Number of votes the candidate received
                    });
                }

                return acc;  // Return the accumulator for the next iteration
            }, {});  // Initial value for the accumulator is an empty object

            setWinners(groupedResults);  // Update the state with the grouped winners data

        } catch (error) {
            // If there’s an error, set the error message
            setMessage('Error fetching election winners. Ensure the backend is running and data is sorted.');
            setWinners({});  // Set winners to an empty object in case of error
        } finally {
            setLoading(false);  // Set loading to false when the data fetching is completed (whether successful or failed)
        }
    };

    // Run the fetchWinners function when the component is mounted
    useEffect(() => {
        fetchWinners();  // Fetch the winners data
    }, []);  // Empty dependency array ensures this only runs once, after the component mounts

    // If data is still loading, show a spinner (loading indicator)
    if (loading) {
        return <Spinner animation="border" />;  // Show a Bootstrap spinner while loading
    }

    // If no winners data is available, show a warning message
    if (Object.keys(winners).length === 0) {
        return <Alert variant="warning">No winners declared yet.</Alert>;  // Show a warning alert if no winners data is available
    }
    
    // Render the component UI after data has been fetched and is available
    return (
        // Use a Bootstrap container for the layout
        <Container>
            <h2>🏅 Election Winners UI</h2>  {/* Title for the page */}

            {/* Display a general message if there's any */}
            {message && <Alert variant="info">{message}</Alert>}  {/* Show informational message if available */}

            {/* Loop through the winners data and display each position's winners */}
            {Object.entries(winners).map(([posKey, data]) => (
                <Card key={posKey} className="mb-4 bg-info bg-opacity-10 border-info">  {/* Display each position's winners */}
                    <Card.Header className="bg-info text-white">
                        <h4 className="my-1">
                            Elective Position: {data.positionName} ({data.numOfPositions} Winner(s))
                        </h4>  {/* Display the position name and the number of winners for that position */}
                    </Card.Header>
                    <Card.Body>
                        <ol className="list-unstyled">
                            {/* Loop through each winner in the winners list for the current position */}
                            {data.winnersList.map((winner, index) => (
                                <li key={winner.candidID} className="mb-2 p-2 border-bottom">
                                    {/* Display the rank of the winner only if there is more than one winner for this position */}
                                    {data.numOfPositions > 1 && <span className="fw-bold me-2">Rank {index + 1}: </span>}
                                    {/* Display the winner's name and their vote count */}
                                    Winner: {winner.candidateName}, Total Votes: {winner.voteCount}
                                </li>
                            ))}
                        </ol>
                    </Card.Body>
                </Card>
            ))}
        </Container>
    );
};

export default WinnersUI;  // Export the WinnersUI component for use in other parts of the application
