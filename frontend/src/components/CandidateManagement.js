// src/components/CandidateManagement.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, Alert } from 'react-bootstrap';
import axios from 'axios';

const CANDIDATE_API = 'http://localhost:3001/api/candidates';
const POSITIONS_API = 'http://localhost:3001/api/positions';

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [positions, setPositions] = useState([]); // To populate the dropdown
  const [newCandidate, setNewCandidate] = useState({ candidIDNum: '', candidFName: '', candidLName: '', positionID: '' });
  const [message, setMessage] = useState('');

  // Fetch data
  const fetchData = async () => {
    try {
      const [candResponse, posResponse] = await Promise.all([
        axios.get(CANDIDATE_API),
        axios.get(POSITIONS_API)
      ]);
      setCandidates(candResponse.data);
      setPositions(posResponse.data);
      // Set default positionID for the form if positions exist
      if (posResponse.data.length > 0 && !newCandidate.positionID) {
        setNewCandidate(prev => ({ ...prev, positionID: posResponse.data[0].positionID }));
      }
    } catch (error) {
      setMessage('Error fetching candidate or position records.');
    }
  };

useEffect(() => {
  (async () => {
    try {
      // ...inline fetch code from fetchData...
    } catch (error) {
      setMessage('Error fetching candidate or position records.');
    }
  })();
}, []);

  const handleNewInputChange = (e) => {
    const { name, value } = e.target;
    // Ensure positionID is stored as an integer
    setNewCandidate({ ...newCandidate, [name]: name === 'positionID' ? parseInt(value) : value });
  };

  // 1. Adding a candidate record [1]
  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(CANDIDATE_API, newCandidate);
      setMessage('Candidate added successfully!');
      setNewCandidate({ candidIDNum: '', candidFName: '', candidLName: '', positionID: newCandidate.positionID }); // Keep position selection
      fetchData();
    } catch (error) {
      setMessage('Error adding candidate. ID Number might be a duplicate.');
    }
  };
  
  // 2. Updating a candidate record [1] (Similar modal/form logic as VoterManagement)
  const handleUpdateCandidate = (/* logic */) => {
    setMessage('Update logic placeholder: Similar PUT request to /api/candidates/:id');
    // Implement modal/form for editing details and positionID
    fetchData();
  };

  // 3. Deactivating a candidate record [1] (or setting candStat to 'Active'/'Inactive')
  const handleToggleStatus = async (candidID, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      // PUT request to update candStat
      await axios.put(`${CANDIDATE_API}/status/${candidID}`, { candStat: newStatus });
      setMessage(`Candidate ID ${candidID} status changed to ${newStatus}.`);
      fetchData();
    } catch (error) {
      setMessage(`Error changing status for candidate ID ${candidID}.`);
    }
  };

  // Helper to find position name by ID
  const getPositionName = (id) => {
    const pos = positions.find(p => p.positionID === id);
    return pos ? pos.positionName : 'N/A';
  };

  return (
    <Container>
      <h2>🗳️ Candidate Management UI</h2>
      {message && <Alert variant="info">{message}</Alert>}

      {/* Add Candidate Form */}
      <Card className="mb-4">
        <Card.Header>Add New Candidate Record</Card.Header>
        <Card.Body>
          <Form onSubmit={handleAddCandidate}>
            <div className="row">
              <Form.Group className="mb-3 col-md-4"><Form.Label>Candidate ID Num</Form.Label><Form.Control type="text" name="candidIDNum" value={newCandidate.candidIDNum} onChange={handleNewInputChange} required/></Form.Group>
              <Form.Group className="mb-3 col-md-4"><Form.Label>First Name</Form.Label><Form.Control type="text" name="candidFName" value={newCandidate.candidFName} onChange={handleNewInputChange} required/></Form.Group>
              <Form.Group className="mb-3 col-md-4"><Form.Label>Last Name</Form.Label><Form.Control type="text" name="candidLName" value={newCandidate.candidLName} onChange={handleNewInputChange} required/></Form.Group>
              
              <Form.Group className="mb-3 col-md-12">
                <Form.Label>Position</Form.Label>
                <Form.Control as="select" name="positionID" value={newCandidate.positionID} onChange={handleNewInputChange} required>
                  <option value="" disabled>Select Position</option>
                  {positions.map(pos => (
                    <option key={pos.positionID} value={pos.positionID}>
                      {pos.positionName}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </div>
            <Button variant="primary" type="submit">Add Candidate</Button>
          </Form>
        </Card.Body>
      </Card>
      
      {/* Candidates List Table */}
      <h3>List of Candidates</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr><th>ID Num</th><th>Name</th><th>Position</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {candidates.map((cand) => (
            <tr key={cand.candidID}>
              <td>{cand.candidIDNum}</td>
              <td>{cand.candidLName}, {cand.candidFName}</td>
              <td>{getPositionName(cand.positionID)}</td>
              <td><span className={`badge ${cand.candStat === 'Active' ? 'bg-success' : 'bg-warning'}`}>{cand.candStat}</span></td>
              <td>
                <Button variant="outline-primary" size="sm" className="me-2" onClick={handleUpdateCandidate}>Update</Button>
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

export default CandidateManagement;