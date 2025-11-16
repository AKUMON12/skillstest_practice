// Import React and hooks (useState, useEffect) for managing component state and lifecycle
import React, { useState, useEffect } from 'react';

// Import UI components from react-bootstrap library
import { Container, Card, Form, Button, Table, Alert } from 'react-bootstrap';

// Import axios for making HTTP requests to the backend API
import axios from 'axios';

// Import custom CSS styling for this component
import '../styles/CandidateManagement.css';

// Define API endpoint URLs for candidates and positions
const CANDIDATE_API = 'http://localhost:3001/api/candidates';
const POSITIONS_API = 'http://localhost:3001/api/positions';

// Main functional component
const CandidateManagement = () => {

  // State to store list of candidate records fetched from the API
  const [candidates, setCandidates] = useState([]);

  // State to store list of available positions (to populate dropdown)
  const [positions, setPositions] = useState([]);

  // State that holds the form values for adding a new candidate
  const [newCandidate, setNewCandidate] = useState({
    candidIDNum: '',
    candidFName: '',
    candidLName: '',
    positionID: ''
  });

  // State to store feedback messages (success/error)
  const [message, setMessage] = useState('');

  // ---------------------- FETCH DATA FUNCTION ----------------------
  // Fetches candidates and positions from the backend when the component loads
  const fetchData = async () => {
    try {
      // Perform both API requests at once using Promise.all
      const [candResponse, posResponse] = await Promise.all([
        axios.get(CANDIDATE_API),
        axios.get(POSITIONS_API)
      ]);

      // Store API results in state
      setCandidates(candResponse.data);
      setPositions(posResponse.data);

      // Automatically select the first position in the list if none is selected
      if (posResponse.data.length > 0 && !newCandidate.positionID) {
        setNewCandidate(prev => ({ ...prev, positionID: posResponse.data[0].positionID }));
      }
    } catch (error) {
      // Show error message if API request fails
      setMessage('Error fetching candidate or position records.');
    }
  };

  // ---------------------- INITIAL DATA LOAD ----------------------
  useEffect(() => {
    // Runs fetchData() only once when the component is first rendered
    fetchData();
  },);  // Empty dependency array = runs only once

  // ---------------------- INPUT HANDLING FOR ADD FORM ----------------------
  const handleNewInputChange = (e) => {
    const { name, value } = e.target;

    // Convert positionID to an integer before storing it
    setNewCandidate({
      ...newCandidate,
      [name]: name === 'positionID' ? parseInt(value) : value
    });
  };

  // ---------------------- ADD NEW CANDIDATE ----------------------
  const handleAddCandidate = async (e) => {
    e.preventDefault(); // Prevents form reload

    try {
      // Send POST request to create new candidate
      await axios.post(CANDIDATE_API, newCandidate);

      // Show success message
      setMessage('Candidate added successfully!');

      // Clear input fields except keep selected position
      setNewCandidate({
        candidIDNum: '',
        candidFName: '',
        candidLName: '',
        positionID: newCandidate.positionID
      });

      // Reload updated data
      fetchData();

    } catch (error) {
      // Show an error message if POST request fails
      setMessage('Error adding candidate. ID Number might be a duplicate.');
    }
  };

  // ---------------------- UPDATE CANDIDATE (PLACEHOLDER) ----------------------
  const handleUpdateCandidate = (/* logic */) => {
    // Placeholder message; actual update logic will require a modal
    setMessage('Update logic placeholder: Similar PUT request to /api/candidates/:id');

    // Refresh data after update logic is implemented
    fetchData();
  };

  // ---------------------- TOGGLE ACTIVE / INACTIVE STATUS ----------------------
  const handleToggleStatus = async (candidID, currentStatus) => {
    // Determine the new status based on the old one
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

    try {
      // Sends PUT request to modify a candidate's status
      await axios.put(`${CANDIDATE_API}/status/${candidID}`, {
        candStat: newStatus
      });

      // Inform the user of the update
      setMessage(`Candidate ID ${candidID} status changed to ${newStatus}.`);

      // Reload updated table data
      fetchData();

    } catch (error) {
      setMessage(`Error changing status for candidate ID ${candidID}.`);
    }
  };

  // ---------------------- HELPER: GET POSITION NAME BY ID ----------------------
  const getPositionName = (id) => {
    const pos = positions.find(p => p.positionID === id);
    return pos ? pos.positionName : 'N/A';
  };

  // ---------------------- JSX UI RENDERING ----------------------
  return (
    <Container>
      <h2>🗳️ Candidate Management UI</h2>

      {/* Feedback message (success or error) */}
      {message && <Alert variant="info">{message}</Alert>}

      {/* ---------- ADD CANDIDATE FORM ---------- */}
      <Card className="mb-4">
        <Card.Header>Add New Candidate Record</Card.Header>
        <Card.Body>
          <Form onSubmit={handleAddCandidate}>
            <div className="row">

              {/* Candidate ID */}
              <Form.Group className="mb-3 col-md-4">
                <Form.Label>Candidate ID Num</Form.Label>
                <Form.Control
                  type="text"
                  name="candidIDNum"
                  value={newCandidate.candidIDNum}
                  onChange={handleNewInputChange}
                  required
                />
              </Form.Group>

              {/* First Name */}
              <Form.Group className="mb-3 col-md-4">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="candidFName"
                  value={newCandidate.candidFName}
                  onChange={handleNewInputChange}
                  required
                />
              </Form.Group>

              {/* Last Name */}
              <Form.Group className="mb-3 col-md-4">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="candidLName"
                  value={newCandidate.candidLName}
                  onChange={handleNewInputChange}
                  required
                />
              </Form.Group>

              {/* Position Dropdown */}
              <Form.Group className="mb-3 col-md-12">
                <Form.Label>Position</Form.Label>
                <Form.Control
                  as="select"
                  name="positionID"
                  value={newCandidate.positionID}
                  onChange={handleNewInputChange}
                  required
                >
                  <option value="" disabled>Select Position</option>
                  {positions.map(pos => (
                    <option key={pos.positionID} value={pos.positionID}>
                      {pos.positionName}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </div>

            {/* Submit Button */}
            <Button variant="primary" type="submit">
              Add Candidate
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* ---------- TABLE OF ALL CANDIDATES ---------- */}
      <h3>List of Candidates</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID Num</th>
            <th>Name</th>
            <th>Position</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {candidates.map((cand) => (
            <tr key={cand.candidID}>
              <td>{cand.candidIDNum}</td>

              <td>{cand.candidLName}, {cand.candidFName}</td>

              <td>{getPositionName(cand.positionID)}</td>

              {/* Status Badge */}
              <td>
                <span className={`badge ${cand.candStat === 'Active' ? 'bg-success' : 'bg-warning'}`}>
                  {cand.candStat}
                </span>
              </td>

              {/* Update / Activate / Deactivate Buttons */}
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={handleUpdateCandidate}
                >
                  Update
                </Button>

                <Button
                  variant={cand.candStat === 'Active' ? 'outline-danger' : 'outline-success'}
                  size="sm"
                  onClick={() => handleToggleStatus(cand.candidID, cand.candStat)}
                >
                  {cand.candStat === 'Active' ? 'Deactivate' : 'Activate'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>

      </Table>
    </Container>
  );
};

// Export component so it can be used elsewhere
export default CandidateManagement;