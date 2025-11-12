// src/App.js
import React from 'react';                                            // Core React library (ALWAYS INCLUDE THIS)
import 'bootstrap/dist/css/bootstrap.min.css';                        // CSS framework for styling
import { Container, Nav, Navbar } from 'react-bootstrap';             // React components styled with Bootstrap
// Import the components you will create
import PositionsManagement from './components/PositionsManagement';   // CRUD
import VoterManagement from './components/VoterManagement';           // CRUD
import CandidateManagement from './components/CandidateManagement';   // CRUD
import VotingUI from './components/VotingUI';                         // Voting Interface
import ResultsUI from './components/ResultsUI';                       // Results Display
import WinnersUI from './components/WinnersUI';                       // Winners Display
import Home from './components/Home';                                 // Home Component

// Simple state-based routing for exam simplicity
function App() {
  const [currentPage, setCurrentPage] = React.useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'positions': return <PositionsManagement />;
      case 'voters': return <VoterManagement />;
      case 'candidates': return <CandidateManagement />;
      case 'voting': return <VotingUI />;
      case 'results': return <ResultsUI />;
      case 'winners': return <WinnersUI />;
      default: return <Home />;
    }
  };

  return (
    <>
      {/* Bootstrap Navbar for Navigation */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#" onClick={() => setCurrentPage('home')}>
            🇵🇭 Election System
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={() => setCurrentPage('positions')}>Positions Mgt</Nav.Link>
              <Nav.Link onClick={() => setCurrentPage('voters')}>Voters Mgt</Nav.Link>
              <Nav.Link onClick={() => setCurrentPage('candidates')}>Candidates Mgt</Nav.Link>
              <Nav.Link onClick={() => setCurrentPage('voting')}>Voting</Nav.Link>
              <Nav.Link onClick={() => setCurrentPage('results')}>Results</Nav.Link>
              <Nav.Link onClick={() => setCurrentPage('winners')}>Winners</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        {renderPage()}
      </Container>
    </>
  );
}

export default App;   // Export the main App component as the default export