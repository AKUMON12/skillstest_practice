// src/App.js

// ----------------------------------------------------------------------
// CORE IMPORTS & DEPENDENCIES
// ----------------------------------------------------------------------
import React from 'react'; // Core React library (ALWAYS INCLUDE THIS)
import 'bootstrap/dist/css/bootstrap.min.css'; // Imports the CSS framework for styling
import { Container, Nav, Navbar } from 'react-bootstrap'; // Imports specific React-Bootstrap components

// ----------------------------------------------------------------------
// COMPONENT IMPORTS (The "Pages" of the Application)
// ----------------------------------------------------------------------
// These imports link the main App.js file to the individual component files 
// located in the './components/' directory.
import PositionsManagement from './components/PositionsManagement'; // Module 1: CRUD for election positions (President, Senator, etc.)
import VoterManagement from './components/VoterManagement'; // Module 2: CRUD for voter records.
import CandidateManagement from './components/CandidateManagement'; // Module 3: CRUD for candidates and assigning them to positions.
import VotingUI from './components/VotingUI'; // Module 4: The interface where voters log in and cast their ballots.
import ResultsUI from './components/ResultsUI'; // Module 5: Displays raw vote counts and percentages.
import WinnersUI from './components/WinnersUI'; // Module 6: Calculates and displays the final winners based on numOfPositions.
import Home from './components/Home'; // The default landing component.

// ----------------------------------------------------------------------
// MAIN APPLICATION COMPONENT (App.js)
// ----------------------------------------------------------------------

// Definition: App is a functional component that serves as the root and router.
function App() {
  // State Hook: This is the core of your routing. 
  // 'currentPage' stores a string identifier (e.g., 'voters').
  // 'setCurrentPage' is the function used by the Navbar links to change the view.
  const [currentPage, setCurrentPage] = React.useState('home');

  // Function: Determines which component/page to display based on the 'currentPage' state.
  const renderPage = () => {
    // The switch statement evaluates the current state value.
    switch (currentPage) {
      case 'positions': 
        return <PositionsManagement />; // If state is 'positions', render the <PositionsManagement /> component.
      case 'voters': 
        return <VoterManagement />; // If state is 'voters', render the <VoterManagement /> component.
      case 'candidates': 
        return <CandidateManagement />; // If state is 'candidates', render the <CandidateManagement /> component.
      case 'voting': 
        return <VotingUI />; // The core voting page.
      case 'results': 
        return <ResultsUI />; // Displays tallies.
      case 'winners': 
        return <WinnersUI />; // Displays final winners.
      default: 
        return <Home />; // If state is unknown (or 'home'), render the <Home /> component.
    }
  };

  return (
    // JSX structure begins here. The <>...</> fragment allows returning multiple elements.
    <>
      {/* The main Navigation Bar (Navbar) is positioned at the top of every view. */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          {/* Brand Link: Resets the page view to 'home' when clicked. */}
          <Navbar.Brand href="#" onClick={() => setCurrentPage('home')}>
            🇵🇭 Election System
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {/* Navigation Links: Each Nav.Link calls setCurrentPage() with the target identifier. */}
              <Nav.Link onClick={() => setCurrentPage('positions')}>Positions</Nav.Link>
              <Nav.Link onClick={() => setCurrentPage('candidates')}>Candidates</Nav.Link>
              <Nav.Link onClick={() => setCurrentPage('voters')}>Voters</Nav.Link>
              <Nav.Link onClick={() => setCurrentPage('voting')}>Voting</Nav.Link>
              <Nav.Link onClick={() => setCurrentPage('results')}>Results</Nav.Link>
              <Nav.Link onClick={() => setCurrentPage('winners')}>Winners</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content Container */}
      {/* The 'mt-4' class adds margin-top for spacing below the fixed Navbar. */}
      <Container className="mt-4">
        {/* This line executes the renderPage() function, dynamically displaying the selected component. */}
        {renderPage()}
      </Container>
    </>
  );
}

export default App; // Export the main App component as the default export (required by index.js)