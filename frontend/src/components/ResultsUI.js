// Import necessary React and Bootstrap components
import React, { useState, useEffect } from 'react'; // Import React and hooks (useState, useEffect)
import { Container, Card, Alert, Spinner } from 'react-bootstrap'; // Import Bootstrap components for layout
import axios from 'axios'; // Import axios for making HTTP requests

// Import custom CSS for styling the component
import '../styles/ResultsUI.css'; 

// Define the base URL for the backend API where the election results are fetched from
const API_URL = 'http://localhost:3001/api/results'; // Backend API for election results

const ResultsUI = () => {
    // State to store the election results data (grouped by position)
    const [results, setResults] = useState(null); // Initially set as null until results are fetched

    // State to track loading state (show spinner while data is being fetched)
    const [loading, setLoading] = useState(true);

    // State to store any messages (success or error messages for user feedback)
    const [message, setMessage] = useState('');

    // Function to fetch the election results from the backend API
    const fetchResults = async () => {
        setLoading(true); // Set loading to true while fetching data
        try {
            // Make GET request to fetch the results from the API
            const response = await axios.get(API_URL); 
            
            // Group and format the results data by position
            const groupedResults = response.data.reduce((acc, curr) => {
                // Create a unique key for each position using position ID and name
                const posKey = `${curr.positionID}_${curr.positionName}`;
                if (!acc[posKey]) acc[posKey] = { positionName: curr.positionName, candidates: [] };
                
                // Calculate the percentage of votes for each candidate
                const percentage = (curr.voteCount / curr.totalVotesForPosition) * 100;
                
                // Add the candidate's data to the corresponding position's candidates list
                acc[posKey].candidates.push({
                    candidID: curr.candidID, // Candidate ID
                    candidateName: `${curr.candidFName} ${curr.candidLName}`, // Candidate full name
                    voteCount: curr.voteCount, // Vote count for the candidate
                    percentage: percentage.toFixed(2) // Voting percentage formatted to two decimal places
                });
                return acc; // Return the accumulated data object
            }, {}); // Initial accumulator is an empty object
            
            // Set the grouped results to state
            setResults(groupedResults);
        } catch (error) {
            // Set error message if fetching fails
            setMessage('Error fetching election results. Ensure the backend is running.');
            setResults({}); // Set results to an empty object in case of error
        } finally {
            setLoading(false); // Set loading to false once data fetching is complete
        }
    };

    // useEffect hook to call fetchResults when the component mounts
    useEffect(() => {
        fetchResults(); // Fetch results when the component is mounted
    }, []); // Empty dependency array ensures this runs only once after initial render

    // If data is still loading, display a loading spinner
    if (loading) {
        return <Spinner animation="border" />; // Show loading spinner while data is being fetched
    }

    // If no results are available, show a warning alert
    if (Object.keys(results).length === 0) {
        return <Alert variant="warning">No results available or election is not yet finished.</Alert>; // Inform the user if no results exist
    }
    
    // Main render UI section
    return (
        <Container>
            <h2>📊 Election Results UI</h2>
            {/* Display any informational messages (e.g., errors, success) */}
            {message && <Alert variant="info">{message}</Alert>}

            {/* Loop over the grouped results and display them */}
            {Object.entries(results).map(([posKey, data]) => (
                <Card key={posKey} className="mb-4">
                    <Card.Header className="bg-light">
                        {/* Display the position name */}
                        <h4>{data.positionName}</h4>
                    </Card.Header>
                    <Card.Body>
                        <ul className="list-unstyled">
                            {/* Sort candidates by vote count in descending order for a clearer display */}
                            {data.candidates.sort((a, b) => b.voteCount - a.voteCount).map(cand => (
                                <li key={cand.candidID} className="mb-2">
                                    {/* Display each candidate's name, total votes, and vote percentage */}
                                    {cand.candidateName} (
                                        {cand.voteCount} Total Votes, 
                                        {cand.percentage}% Voting %
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

// Export the ResultsUI component as the default export
export default ResultsUI;