// src/components/Home.js
import React from 'react';
import { Container, Card } from 'react-bootstrap'; // Use Card as Jumbotron is deprecated

const Home = () => {
return (
    <Container>
        {/*
            Simple header Card styled like a jumbotron alternative.
            - Provides a short description for the user
            - Shows a last-synced timestamp for quick feedback
        */}
        <Card className="mb-4 bg-light text-dark">
            <Card.Body>
                <h2 className="mb-1">Welcome — Election Dashboard</h2>
                <p className="mb-0">
                    Use the management panels below to set up Positions, Voters, and Candidates.
                    When everything is active/open, proceed to the Voting UI.
                </p>
                <small className="text-muted">Last synced: {new Date().toLocaleString()}</small>
            </Card.Body>
        </Card>
        <Card bg="primary" text="white" className="p-4 mb-4 text-center">
            <h1>🇵🇭 Philippine National Election System Imitation</h1>
            <p className="lead">
                Welcome to the MyERN-Stack implementation for your Capstone Project 2 skills test.
            </p>
        </Card>

        <div className="row">
            <div className="col-md-6 mb-3">
                <Card>
                    <Card.Header>Admin & Setup Modules</Card.Header>
                    <Card.Body>
                        <p>Use the management UIs (Positions, Voters, Candidates) to set up the election.</p>
                        <p className="text-muted">Ensure all records are 'Active'/'Open' before proceeding to voting.</p>
                    </Card.Body>
                </Card>
            </div>
            <div className="col-md-6 mb-3">
                <Card>
                    <Card.Header>Election Modules</Card.Header>
                    <Card.Body>
                        <p>The Voting UI enforces all constraints (Active Voter, Not Voted, Max Votes ≤ numOfPositions).</p>
                        <p>Results and Winners UIs display the final tallies.</p>
                    </Card.Body>
                </Card>
            </div>
        </div>
    </Container>
);
};

export default Home;