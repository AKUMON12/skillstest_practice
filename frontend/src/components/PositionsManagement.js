// Import React and hooks (useState, useEffect) to create the component and manage state
import React, { useState, useEffect } from 'react';

// Import React Bootstrap components for UI layout (Container, Card, Form, Button, Table, Alert)
import { Container, Card, Form, Button, Table, Alert } from 'react-bootstrap';

// Import axios for making HTTP requests to interact with the backend
import axios from 'axios'; 

// Import custom CSS file for styling the component
import '../styles/PositionsManagement.css'; 

// Define the base URL for API requests related to positions management
const API_URL = 'http://localhost:3001/api/positions';

const PositionsManagement = () => {
  // State to store the list of positions fetched from the backend
  const [positions, setPositions] = useState([]);

  // State to store data for a new position being added
  const [newPosition, setNewPosition] = useState({ positionName: '', numOfPositions: 1 });

  // State to hold the position currently being edited
  const [editPosition, setEditPosition] = useState(null);

  // State to hold a success/error message for user feedback
  const [message, setMessage] = useState('');

  // Function to fetch all positions from the backend API
  const fetchPositions = async () => {
    try {
      // Make GET request to fetch all positions
      const response = await axios.get(API_URL);
      setPositions(response.data); // Update positions state with fetched data
    } catch (error) {
      // Set error message if fetching fails
      setMessage('Error fetching positions.');
    }
  };

  // useEffect hook to fetch positions when the component mounts (runs once)
  useEffect(() => {
    fetchPositions(); // Call fetchPositions function when component mounts
  }, []); // Empty dependency array ensures it runs only once on mount

  // Function to handle input changes for the new position form
  const handleNewInputChange = (e) => {
    const { name, value } = e.target;
    // Update the newPosition state based on the form input
    setNewPosition({ ...newPosition, [name]: value });
  };

  // Function to handle input changes for the edit form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    // Update the editPosition state based on the form input
    setEditPosition({ ...editPosition, [name]: value });
  };

  // Function to handle adding a new position
  const handleAddPosition = async (e) => {
    e.preventDefault();
    // Validate the input values for position name and number of positions
    if (!newPosition.positionName || newPosition.numOfPositions < 1) {
      setMessage('Please enter a valid name and number of positions.');
      return;
    }
    try {
      // Send POST request to add the new position to the backend
      await axios.post(API_URL, newPosition);
      setMessage('Position added successfully!'); // Show success message
      setNewPosition({ positionName: '', numOfPositions: 1 }); // Clear form
      fetchPositions(); // Refresh the list of positions
    } catch (error) {
      setMessage('Error adding position. It might already exist.'); // Show error message if adding fails
    }
  };

  // Function to handle updating an existing position
  const handleUpdatePosition = async (e) => {
    e.preventDefault();
    // Ensure that there's an editPosition selected
    if (!editPosition) return;
    try {
      // Send PUT request to update the selected position
      await axios.put(`${API_URL}/${editPosition.positionID}`, editPosition);
      setMessage('Position updated successfully!'); // Show success message
      setEditPosition(null); // Clear edit form
      fetchPositions(); // Refresh the list of positions
    } catch (error) {
      setMessage('Error updating position.'); // Show error message if update fails
    }
  };
  
  // Toggle a position's status between 'Open' and 'Closed' (active/inactive)
  const handleTogglePositionStatus = async (positionID, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
      // PUT request to update the status
      await axios.put(`${API_URL}/status/${positionID}`, { status: newStatus });
      setMessage(
        `Position ID ${positionID} ${newStatus === 'Open' ? 'activated (Open)' : 'deactivated (Closed)'}.`
      );
      // Optimistically update local state so UI updates immediately
      setPositions((prev) => prev.map((p) => (p.positionID === positionID ? { ...p, status: newStatus } : p)));
      // Ensure server state eventually reconciled
      // fetchPositions(); // uncomment if you prefer full refresh
    } catch (error) {
      setMessage('Error changing position status.');
    }
  };

  return (
    // Main container for the component UI
    <Container>
      <h2>✅ Positions Management UI</h2>
      {/* Display message if any success or error message exists */}
      {message && <Alert variant="info">{message}</Alert>}

      {/* Card for the Root Candidate Position (Inline Form) */}
      <Card className="mb-4 bg-light border-primary">
        <Card.Header className="bg-primary text-white">Root Candidate Position</Card.Header>
        <Card.Body>
          {/* Inline form with real-time validation */}
          <Form className="d-flex gap-2 align-items-end">
            <Form.Group className="mb-0 flex-grow-1">
              <Form.Label>Position Name</Form.Label>
              {/* Input for position name with validation */}
              <Form.Control
                type="text"
                value={newPosition.positionName}
                onChange={handleNewInputChange}
                name="positionName"
                isInvalid={newPosition.positionName.length > 0 && newPosition.positionName.length < 2}
              />
              <Form.Control.Feedback type="invalid">
                Position name must be at least 2 characters.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-0">
              <Form.Label>Max Votes</Form.Label>
              {/* Input for number of positions (max votes) with validation */}
              <Form.Control
                type="number"
                min="1"
                value={newPosition.numOfPositions}
                onChange={handleNewInputChange}
                name="numOfPositions"
                isInvalid={newPosition.numOfPositions < 1}
              />
              <Form.Control.Feedback type="invalid">
                Must be at least 1.
              </Form.Control.Feedback>
            </Form.Group>
            {/* Submit button for adding the position */}
            <Button 
              variant="primary" 
              onClick={handleAddPosition}
              disabled={!newPosition.positionName || newPosition.numOfPositions < 1}
            >
              Set Position
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Card for adding a new position (standard form) */}
      <Card className="mb-4">
        <Card.Header>Add New Position</Card.Header>
        <Card.Body>
          <Form onSubmit={handleAddPosition}>
            {/* Input field for position name */}
            <Form.Group className="mb-3">
              <Form.Label>Position Name</Form.Label>
              <Form.Control
                type="text"
                name="positionName"
                value={newPosition.positionName}
                onChange={handleNewInputChange}
                required
              />
            </Form.Group>
            {/* Input field for number of positions (max votes) */}
            <Form.Group className="mb-3">
              <Form.Label>Number of Winners/Votes (e.g., 1 or 12)</Form.Label>
              <Form.Control
                type="number"
                name="numOfPositions"
                min="1"
                value={newPosition.numOfPositions}
                onChange={handleNewInputChange}
                required
              />
            </Form.Group>
            {/* Submit button for adding position */}
            <Button variant="primary" type="submit">
              Add Position
            </Button>
          </Form>
        </Card.Body>
      </Card>
      
      {/* Edit form (conditionally rendered if editPosition is not null) */}
      {editPosition && (
        <Card className="mb-4 bg-light">
          <Card.Header>Edit Position: {editPosition.positionName}</Card.Header>
          <Card.Body>
            <Form onSubmit={handleUpdatePosition}>
              {/* Input field for editing position name */}
              <Form.Group className="mb-3">
                <Form.Label>Position Name</Form.Label>
                <Form.Control
                  type="text"
                  name="positionName"
                  value={editPosition.positionName || ''}
                  onChange={handleEditInputChange}
                  required
                />
              </Form.Group>
              {/* Input field for editing number of positions */}
              <Form.Group className="mb-3">
                <Form.Label>Number of Winners/Votes (e.g., 1 or 12)</Form.Label>
                <Form.Control
                  type="number"
                  name="numOfPositions"
                  min="1"
                  value={editPosition.numOfPositions || 1}
                  onChange={handleEditInputChange}
                  required
                />
              </Form.Group>
              {/* Buttons for saving changes or cancelling the edit */}
              <Button variant="success" type="submit" className="me-2">
                Save Changes
              </Button>
              <Button variant="secondary" onClick={() => setEditPosition(null)}>
                Cancel
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Table displaying the list of positions */}
      <h3>List of Positions</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Max Votes</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Loop through positions array and display each position */}
          {positions.map((pos) => (
            <tr key={pos.positionID}>
              <td>{pos.positionID}</td>
              <td>{pos.positionName}</td>
              <td>{pos.numOfPositions}</td>
              <td>
                {/* Display status with a badge */}
                <span className={`badge ${pos.status === 'Open' ? 'bg-success' : 'bg-danger'}`}>
                  {pos.status}
                </span>
              </td>
              <td>
                {/* Button to enter edit mode */}
                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => setEditPosition(pos)}>
                  Update
                </Button>
                {/* Button to deactivate position */}
                <Button
                  variant={pos.status === 'Open' ? 'outline-danger' : 'outline-success'}
                  size="sm"
                  onClick={() => handleTogglePositionStatus(pos.positionID, pos.status)}
                >
                  {pos.status === 'Open' ? 'Deactivate' : 'Activate'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default PositionsManagement;
