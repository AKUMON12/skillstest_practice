// src/components/PositionsManagement.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, Alert } from 'react-bootstrap';
import axios from 'axios'; // Used for making HTTP requests

// Define the base URL for the backend API
const API_URL = 'http://localhost:3001/api/positions';

const PositionsManagement = () => {
  const [positions, setPositions] = useState([]); // State to hold the list of positions
  const [newPosition, setNewPosition] = useState({ positionName: '', numOfPositions: 1 }); // State for the new position form
  const [editPosition, setEditPosition] = useState(null); // State to hold the position being edited
  const [message, setMessage] = useState(''); // State for displaying success/error messages

  // Function to fetch all positions from the backend
  const fetchPositions = async () => {
    try {
      const response = await axios.get(API_URL);
      setPositions(response.data);
    } catch (error) {
      setMessage('Error fetching positions.');
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []); // Run only once on component mount

  // Handle input change for the new position form
  const handleNewInputChange = (e) => {
    const { name, value } = e.target;
    setNewPosition({ ...newPosition, [name]: value });
  };

  // Handle input change for the edit form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditPosition({ ...editPosition, [name]: value });
  };

  // Add a position record [1]
  const handleAddPosition = async (e) => {
    e.preventDefault();
    if (!newPosition.positionName || newPosition.numOfPositions < 1) {
      setMessage('Please enter a valid name and number of positions.');
      return;
    }
    try {
      // POST request to the backend
      await axios.post(API_URL, newPosition);
      setMessage('Position added successfully!');
      setNewPosition({ positionName: '', numOfPositions: 1 }); // Clear form
      fetchPositions(); // Refresh the list
    } catch (error) {
      setMessage('Error adding position. It might already exist.');
    }
  };

  // Update a position record [1]
  const handleUpdatePosition = async (e) => {
    e.preventDefault();
    if (!editPosition) return;
    try {
      // PUT request to the backend for updating details
      await axios.put(`${API_URL}/${editPosition.positionID}`, editPosition);
      setMessage('Position updated successfully!');
      setEditPosition(null); // Exit edit mode
      fetchPositions(); // Refresh the list
    } catch (error) {
      setMessage('Error updating position.');
    }
  };
  
  // Deactivating a position record [2] (Setting status to 'Closed')
  const handleDeactivatePosition = async (positionID) => {
    try {
      // PUT request to update the status to 'Closed'
      await axios.put(`${API_URL}/status/${positionID}`, { status: 'Closed' });
      setMessage(`Position ID ${positionID} deactivated (Closed).`);
      fetchPositions(); // Refresh the list
    } catch (error) {
      setMessage('Error deactivating position.');
    }
  };

  return (
    <Container>
      <h2>✅ Positions Management UI</h2>
      {message && <Alert variant="info">{message}</Alert>}

      {/* Add Position Form */}
      <Card className="mb-4">
        <Card.Header>Add New Position</Card.Header>
        <Card.Body>
          <Form onSubmit={handleAddPosition}>
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
            <Button variant="primary" type="submit">
              Add Position
            </Button>
          </Form>
        </Card.Body>
      </Card>
      
      {/* Edit Form (Conditionally rendered) */}
      {editPosition && (
        <Card className="mb-4 bg-light">
          <Card.Header>Edit Position: {editPosition.positionName}</Card.Header>
          <Card.Body>
            <Form onSubmit={handleUpdatePosition}>
              {/* Form Controls for editing */}
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

      {/* Positions List Table */}
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
          {positions.map((pos) => (
            <tr key={pos.positionID}>
              <td>{pos.positionID}</td>
              <td>{pos.positionName}</td>
              <td>{pos.numOfPositions}</td>
              <td>
                <span className={`badge ${pos.status === 'Open' ? 'bg-success' : 'bg-danger'}`}>
                  {pos.status}
                </span>
              </td>
              <td>
                {/* Button to enter edit mode */}
                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => setEditPosition(pos)}>
                  Update
                </Button>
                {/* Deactivate Button */}
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={() => handleDeactivatePosition(pos.positionID)}
                  disabled={pos.status === 'Closed'}
                >
                  Deactivate
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