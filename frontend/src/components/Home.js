// Import React to create the functional component
import React from 'react';

// Import UI components from react-bootstrap to use Container and Card
import { Container, Card } from 'react-bootstrap'; // Use Card component as a jumbotron replacement since Jumbotron is deprecated

// Import custom CSS for styling the page
import '../styles/Home.css'; 

// Define the Home component as a functional component
const Home = () => {
  return (
    // Container component from react-bootstrap to center and pad the content
    <Container>
        
        {/* 
          First Card: Styled like a jumbotron
          - Used to show a welcome message and brief instructions
          - Includes a last synced timestamp for quick feedback to the user
        */}
        <Card className="mb-4 bg-light text-dark">
            <Card.Body>
                {/* Heading inside the Card */}
                <h2 className="mb-1">Welcome — Election Dashboard</h2>
                
                {/* Brief instructions about what the user can do */}
                <p className="mb-0">
                    Use the management panels below to set up Positions, Voters, and Candidates.
                    When everything is active/open, proceed to the Voting UI.
                </p>

                {/* Display current timestamp showing last synced */}
                <small className="text-muted">Last synced: {new Date().toLocaleString()}</small>
            </Card.Body>
        </Card>

        {/* Second Card: Main heading for the election system */}
        <Card bg="primary" text="white" className="p-4 mb-4 text-center">
            {/* Large title for the election system */}
            <h1>🇵🇭 Philippine National Election System Imitation</h1>

            {/* Short description about the project */}
            <p className="lead">
                Welcome to the MyERN-Stack implementation for your Capstone Project 2 skills test.
            </p>
        </Card>

        {/* Layout with two columns for additional cards */}
        <div className="row">
            
            {/* Column for Admin & Setup Modules */}
            <div className="col-md-6 mb-3">
                <Card>
                    <Card.Header>Admin & Setup Modules</Card.Header>
                    <Card.Body>
                        {/* Description about the admin setup */}
                        <p>Use the management UIs (Positions, Voters, Candidates) to set up the election.</p>
                        {/* Instruction for the user to ensure records are active/open */}
                        <p className="text-muted">Ensure all records are 'Active'/'Open' before proceeding to voting.</p>
                    </Card.Body>
                </Card>
            </div>
            
            {/* Column for Election Modules */}
            <div className="col-md-6 mb-3">
                <Card>
                    <Card.Header>Election Modules</Card.Header>
                    <Card.Body>
                        {/* Description of election-specific features */}
                        <p>The Voting UI enforces all constraints (Active Voter, Not Voted, Max Votes ≤ numOfPositions).</p>
                        {/* Instruction about results and winners sections */}
                        <p>Results and Winners UIs display the final tallies.</p>
                    </Card.Body>
                </Card>
            </div>
        </div>
    </Container>
  );
};

// Export the Home component so it can be used in other parts of the application
export default Home;
