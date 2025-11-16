// src/components/VoterManagement.js
import React, { useState, useEffect } from 'react';  // Import React and hooks (useState, useEffect)
import { Container, Card, Form, Button, Table, Alert, Modal } from 'react-bootstrap';  // Import Bootstrap components for UI
import axios from 'axios';  // Import axios to make HTTP requests to backend API

import '../styles/VoterManagement.css';  // Import custom CSS for styling

// Define the backend API URL for voters' data
const API_URL = 'http://localhost:3001/api/voters'; // URL to fetch voter data

const VoterManagement = () => {
  // State variables
  const [voters, setVoters] = useState([]);  // Stores the list of voters
  const [newVoter, setNewVoter] = useState({  // Stores the form data for adding a new voter
    voterIDNum: '', voterPass: '', voterFName: '', voterLName: ''
  });
  const [editVoter, setEditVoter] = useState(null);  // Used to store the data of the voter being edited
  const [message, setMessage] = useState('');  // Stores messages (success/error) for user feedback
  const [showEditModal, setShowEditModal] = useState(false);  // Controls the visibility of the "Edit" modal

  // Function to fetch the list of voters from the backend API
  const fetchVoters = async () => {
    try {
      // Send GET request to fetch voter data from the API
      const response = await axios.get(API_URL);
      setVoters(response.data);  // Update state with the fetched voter data
    } catch (error) {
      setMessage('Error fetching voter records.');  // Set an error message if fetching fails
    }
  };

  // useEffect hook runs when the component is mounted to fetch voters data
  useEffect(() => {
    fetchVoters();  // Fetch voters when the component mounts
  }, []);  // Empty dependency array ensures this runs only once on mount

  // Handle changes in the input fields for adding a new voter
  const handleNewInputChange = (e) => {
    const { name, value } = e.target;  // Destructure name and value from the input event
    setNewVoter({ ...newVoter, [name]: value });  // Update the newVoter state with the input value
  };

  // Handle changes in the input fields for editing an existing voter
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;  // Destructure name and value from the input event
    setEditVoter({ ...editVoter, [name]: value });  // Update the editVoter state with the input value
  };

  // 1. Handle adding a new voter
  const handleAddVoter = async (e) => {
    e.preventDefault();  // Prevent default form submission
    try {
      // Post the new voter data to the API to add the voter
      await axios.post(API_URL, newVoter);
      setMessage('Voter added successfully! Status is currently Inactive.');  // Success message
      setNewVoter({ voterIDNum: '', voterPass: '', voterFName: '', voterLName: '' });  // Reset the form fields
      fetchVoters();  // Fetch updated list of voters
    } catch (error) {
      setMessage('Error adding voter. ID Number might be a duplicate.');  // Error message if adding fails
    }
  };

  // 2. Handle updating an existing voter
  const handleUpdateVoter = async (e) => {
    e.preventDefault();  // Prevent default form submission
    if (!editVoter) return;  // If no voter is selected for editing, do nothing
    try {
      // PUT request to update the voter details using the voter ID
      await axios.put(`${API_URL}/${editVoter.voterID}`, editVoter);
      setMessage(`Voter ID ${editVoter.voterID} updated successfully!`);  // Success message
      setShowEditModal(false);  // Close the edit modal
      setEditVoter(null);  // Clear the editVoter state
      fetchVoters();  // Fetch updated list of voters
    } catch (error) {
      setMessage('Error updating voter.');  // Error message if updating fails
    }
  };

  // 3. Handle toggling the activation status of a voter
  const handleToggleStatus = async (voterID, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';  // Toggle the status
    try {
      // PUT request to update the voter's status
      await axios.put(`${API_URL}/status/${voterID}`, { voterStat: newStatus });
      setMessage(`Voter ID ${voterID} status changed to ${newStatus}.`);  // Success message
      fetchVoters();  // Fetch updated list of voters
    } catch (error) {
      setMessage(`Error changing status for voter ID ${voterID}.`);  // Error message if toggling fails
    }
  };

  // Component render
  return (
    <Container>
      <h2>👤 Voter Management UI</h2>
      {/* Display message alerts (success or error) */}
      {message && <Alert variant="info">{message}</Alert>}

      {/* Add Voter Form */}
      <Card className="mb-4">
        <Card.Header>Add New Voter Record</Card.Header>
        <Card.Body>
          <Form onSubmit={handleAddVoter}>
            {/* Form fields for new voter details */}
            <Form.Group className="mb-3">
              <Form.Label>Voter ID Num</Form.Label>
              <Form.Control type="text" name="voterIDNum" value={newVoter.voterIDNum} onChange={handleNewInputChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="voterPass" value={newVoter.voterPass} onChange={handleNewInputChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control type="text" name="voterFName" value={newVoter.voterFName} onChange={handleNewInputChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" name="voterLName" value={newVoter.voterLName} onChange={handleNewInputChange} required />
            </Form.Group>
            <Button variant="primary" type="submit">Add Voter</Button>  {/* Submit button to add voter */}
          </Form>
        </Card.Body>
      </Card>

      {/* Voters List Table */}
      <h3>List of Voters</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr><th>ID Num</th><th>Name</th><th>Status</th><th>Voted</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {/* Render a table row for each voter */}
          {voters.map((voter) => (
            <tr key={voter.voterID}>
              <td>{voter.voterIDNum}</td>
              <td>{voter.voterLName}, {voter.voterFName}</td>
              {/* Display the voter's status with different colors */}
              <td><span className={`badge ${voter.voterStat === 'Active' ? 'bg-success' : 'bg-warning'}`}>{voter.voterStat}</span></td>
              <td>{voter.voted}</td>
              <td>
                {/* Button to open the edit modal for the selected voter */}
                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => { setEditVoter(voter); setShowEditModal(true); }}>
                  Update
                </Button>
                {/* Button to toggle the voter's status */}
                <Button 
                  variant={voter.voterStat === 'Active' ? 'outline-danger' : 'outline-success'} 
                  size="sm" 
                  onClick={() => handleToggleStatus(voter.voterID, voter.voterStat)}
                >
                  {voter.voterStat === 'Active' ? 'Deactivate' : 'Activate'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Edit Voter Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Voter: {editVoter?.voterIDNum}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Display the form with current voter details for editing */}
          {editVoter && (
            <Form onSubmit={handleUpdateVoter}>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control type="text" name="voterFName" value={editVoter.voterFName} onChange={handleEditInputChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control type="text" name="voterLName" value={editVoter.voterLName} onChange={handleEditInputChange} required />
              </Form.Group>
              {/* Save Changes button */}
              <Button variant="success" type="submit">Save Changes</Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default VoterManagement;  // Export the component for use in other parts of the application
