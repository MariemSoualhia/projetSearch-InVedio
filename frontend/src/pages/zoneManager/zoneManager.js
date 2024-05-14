import React, { useState, useEffect } from 'react';
import {
  Container, Typography, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import api from './api';

const ZoneManager = () => {
  const [zones, setZones] = useState([]);
  const [newZone, setNewZone] = useState({ zone_name: '', type: '', areaName: '' });
  const [editZone, setEditZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const response = await api.get('/zones');
      setZones(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching zones:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewZone({ ...newZone, [name]: value });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditZone({ ...editZone, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/zones', newZone);
      fetchZones();
      setNewZone({ zone_name: '', type: '', areaName: '' });
    } catch (error) {
      console.error('Error creating zone:', error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/zones/${editZone._id}`, editZone);
      fetchZones();
      setEditZone(null);
      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating zone:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/zones/${id}`);
      fetchZones();
    } catch (error) {
      console.error('Error deleting zone:', error);
    }
  };

  const openEditDialog = (zone) => {
    setEditZone(zone);
    setOpenDialog(true);
  };

  const closeEditDialog = () => {
    setEditZone(null);
    setOpenDialog(false);
  };

  if (loading) {
    return <Typography>Loading zones...</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Zone Management
      </Typography>

      <form onSubmit={handleSubmit} noValidate autoComplete="off">
        <TextField
          label="Zone Name"
          name="zone_name"
          value={newZone.zone_name}
          onChange={handleInputChange}
          required
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Type</InputLabel>
          <Select
            name="type"
            value={newZone.type}
            onChange={handleInputChange}
            label="Type"
          >
            <MenuItem value="gate zone">Gate</MenuItem>
            <MenuItem value="internal zone">Internal Zone</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Area Name"
          name="areaName"
          value={newZone.areaName}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" style={{ marginTop: 16 }}>
          Add Zone
        </Button>
      </form>

      {editZone && (
        <Dialog open={openDialog} onClose={closeEditDialog}>
          <DialogTitle>Edit Zone</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please update the fields below.
            </DialogContentText>
            <TextField
              label="Zone Name"
              name="zone_name"
              value={editZone.zone_name}
              onChange={handleEditChange}
              required
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={editZone.type}
                onChange={handleEditChange}
                label="Type"
              >
                <MenuItem value="gate">Gate</MenuItem>
                <MenuItem value="internal_zone">Internal Zone</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Area Name"
              name="areaName"
              value={editZone.areaName}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEditDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} color="primary">
              Update
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Typography variant="h5" component="h2" gutterBottom style={{ marginTop: 24 }}>
        Zones List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Zone Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Area Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {zones.map((zone) => (
              <TableRow key={zone._id}>
                <TableCell>{zone.zone_name}</TableCell>
                <TableCell>{zone.type}</TableCell>
                <TableCell>{zone.areaName}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => openEditDialog(zone)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => handleDelete(zone._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ZoneManager;
