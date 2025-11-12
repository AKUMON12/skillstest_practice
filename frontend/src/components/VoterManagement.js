// src/components/VoterManagement.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, Alert, Modal } from 'react-bootstrap';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/voters';

const VoterManagement = () => {
  const [voters, setVoters] = useState([]);
  const [newVoter, setNewVoter] = useState({ voterIDNum: '', voterPass: '', voterFName: '', voterLName: '' });
  const [editVoter, setEditVoter] = useState(null); // Used for editing voter details
  const [message, setMessage] = useState('');
  const [showEditModal, setShowEditModal] = useState(false); // Modal control

  // Fetch all voters
  const fetchVoters = async () => {
    try {
      const response = await axios.get(API_URL);
      setVoters(response.data);
    } catch (error) {
      setMessage('Error fetching voter records.');
    }
  };

  useEffect(() => {
    fetchVoters();
  }, []);

  // Handle form input change for new voter
  const handleNewInputChange = (e) => {
    const { name, value } = e.target;
    setNewVoter({ ...newVoter, [name]: value });
  };
  
  // Handle form input change for editing voter
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditVoter({ ...editVoter, [name]: value });
  };

  // 1. Adding a voter record [1]
  const handleAddVoter = async (e) => {
    e.preventDefault();
    try {
      // NOTE: We assume 'voterStat' defaults to 'Inactive' and 'voted' defaults to 'N' in the backend SQL.
      await axios.post(API_URL, newVoter);
      setMessage('Voter added successfully! Status is currently Inactive.');
      setNewVoter({ voterIDNum: '', voterPass: '', voterFName: '', voterLName: '' });
      fetchVoters();
    } catch (error) {
      setMessage('Error adding voter. ID Number might be a duplicate.');
    }
  };
  
  // 2. Updating a voter record [1]
  const handleUpdateVoter = async (e) => {
    e.preventDefault();
    if (!editVoter) return;
    try {
      // PUT request to update voter details
      await axios.put(`${API_URL}/${editVoter.voterID}`, editVoter);
      setMessage(`Voter ID ${editVoter.voterID} updated successfully!`);
      setShowEditModal(false);
      setEditVoter(null);
      fetchVoters();
    } catch (error) {
      setMessage('Error updating voter.');
    }
  };

  // 3. Deactivating a voter record [1] (or setting to 'Active'/'Inactive')
  const handleToggleStatus = async (voterID, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      // PUT request to update voterStat
      await axios.put(`${API_URL}/status/${voterID}`, { voterStat: newStatus });
      setMessage(`Voter ID ${voterID} status changed to ${newStatus}.`);
      fetchVoters();
    } catch (error) {
      setMessage(`Error changing status for voter ID ${voterID}.`);
    }
  };

  return (
    <Container>
      <h2>👤 Voter Management UI</h2>
      {message && <Alert variant="info">{message}</Alert>}

      {/* Add Voter Form */}
      <Card className="mb-4">
        <Card.Header>Add New Voter Record</Card.Header>
        <Card.Body>
          <Form onSubmit={handleAddVoter}>
            {/* Input fields for voterIDNum, voterPass, voterFName, voterLName */}
            <Form.Group className="mb-3"><Form.Label>Voter ID Num</Form.Label><Form.Control type="text" name="voterIDNum" value={newVoter.voterIDNum} onChange={handleNewInputChange} required/></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Password</Form.Label><Form.Control type="password" name="voterPass" value={newVoter.voterPass} onChange={handleNewInputChange} required/></Form.Group>
            <Form.Group className="mb-3"><Form.Label>First Name</Form.Label><Form.Control type="text" name="voterFName" value={newVoter.voterFName} onChange={handleNewInputChange} required/></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Last Name</Form.Label><Form.Control type="text" name="voterLName" value={newVoter.voterLName} onChange={handleNewInputChange} required/></Form.Group>
            <Button variant="primary" type="submit">Add Voter</Button>
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
          {voters.map((voter) => (
            <tr key={voter.voterID}>
              <td>{voter.voterIDNum}</td>
              <td>{voter.voterLName}, {voter.voterFName}</td>
              <td><span className={`badge ${voter.voterStat === 'Active' ? 'bg-success' : 'bg-warning'}`}>{voter.voterStat}</span></td>
              <td>{voter.voted}</td>
              <td>
                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => { setEditVoter(voter); setShowEditModal(true); }}>Update</Button>
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
      
      {/* Update Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton><Modal.Title>Update Voter: {editVoter?.voterIDNum}</Modal.Title></Modal.Header>
        <Modal.Body>
          {editVoter && (
            <Form onSubmit={handleUpdateVoter}>
              <Form.Group className="mb-3"><Form.Label>First Name</Form.Label><Form.Control type="text" name="voterFName" value={editVoter.voterFName} onChange={handleEditInputChange} required/></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Last Name</Form.Label><Form.Control type="text" name="voterLName" value={editVoter.voterLName} onChange={handleEditInputChange} required/></Form.Group>
              {/* Note: In a real system, changing voterIDNum/voterPass should be handled securely */}
              <Button variant="success" type="submit">Save Changes</Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default VoterManagement;