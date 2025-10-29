import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Chip,
  Tooltip
} from '@mui/material';
import { Add, Edit, Delete, CheckCircle, Cancel } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { adminService } from '../../services/adminService';

const CatalogList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', state: '', country: '' });
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const catalogTypes = ['industries', 'locations', 'categories', 'skills'];
  const currentType = catalogTypes[tab];

  useEffect(() => {
    fetchItems();
  }, [tab]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      let response;
      if (currentType === 'industries') response = await adminService.getIndustries();
      else if (currentType === 'locations') response = await adminService.getLocations();
      else if (currentType === 'categories') response = await adminService.getCategories();
      else response = await adminService.getSkills();

      const itemsData = response.data[currentType] || [];
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (error) {
      enqueueSnackbar(`Failed to load ${currentType}`, { variant: 'error' });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentType === 'industries') await adminService.createIndustry(formData);
      else if (currentType === 'locations') await adminService.createLocation(formData);
      else if (currentType === 'categories') await adminService.createCategory(formData);
      else await adminService.createSkill(formData);
      enqueueSnackbar('Item created successfully', { variant: 'success' });
      setOpenDialog(false);
      fetchItems();
      setFormData({ name: '', state: '', country: '' });
    } catch (error) {
      enqueueSnackbar('Failed to create item', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      if (currentType === 'industries') await adminService.deleteIndustry(id);
      else if (currentType === 'locations') await adminService.deleteLocation(id);
      else if (currentType === 'categories') await adminService.deleteCategory(id);
      else await adminService.deleteSkill(id);
      enqueueSnackbar('Item deleted successfully', { variant: 'success' });
      fetchItems();
    } catch (error) {
      enqueueSnackbar('Failed to delete item', { variant: 'error' });
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminService.approveSkill(id);
      enqueueSnackbar('Skill approved successfully', { variant: 'success' });
      fetchItems();
    } catch (error) {
      enqueueSnackbar('Failed to approve skill', { variant: 'error' });
    }
  };

  const handleReject = async () => {
    try {
      await adminService.rejectSkill(selectedSkill.id, { rejection_reason: rejectionReason });
      enqueueSnackbar('Skill rejected', { variant: 'success' });
      setOpenRejectDialog(false);
      setRejectionReason('');
      setSelectedSkill(null);
      fetchItems();
    } catch (error) {
      enqueueSnackbar('Failed to reject skill', { variant: 'error' });
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      approved: { color: 'success', label: 'Approved' },
      pending: { color: 'warning', label: 'Pending' },
      rejected: { color: 'error', label: 'Rejected' },
    };
    const config = statusConfig[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Catalog Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
          Add {currentType.slice(0, -1)}
        </Button>
      </Box>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Industries" />
        <Tab label="Locations" />
        <Tab label="Categories" />
        <Tab label="Skills" />
      </Tabs>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                {currentType === 'locations' && (
                  <>
                    <TableCell>State</TableCell>
                    <TableCell>Country</TableCell>
                  </>
                )}
                {currentType === 'skills' && (
                  <>
                    <TableCell>Status</TableCell>
                    <TableCell>Created By</TableCell>
                  </>
                )}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  {currentType === 'locations' && (
                    <>
                      <TableCell>{item.state}</TableCell>
                      <TableCell>{item.country}</TableCell>
                    </>
                  )}
                  {currentType === 'skills' && (
                    <>
                      <TableCell>{getStatusChip(item.approval_status)}</TableCell>
                      <TableCell>
                        {item.created_by_type === 'employee' ? (
                          <Chip label="Employee" size="small" color="info" />
                        ) : (
                          <Chip label="Admin" size="small" color="default" />
                        )}
                      </TableCell>
                    </>
                  )}
                  <TableCell align="right">
                    {currentType === 'skills' && item.approval_status === 'pending' && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton size="small" color="success" onClick={() => handleApprove(item.id)}>
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => {
                              setSelectedSkill(item);
                              setOpenRejectDialog(true);
                            }}
                          >
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add {currentType.slice(0, -1)}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            {currentType === 'locations' && (
              <>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  margin="normal"
                  required
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Reject Skill Dialog */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Skill: {selectedSkill?.name}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Rejection Reason (Optional)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            margin="normal"
            multiline
            rows={3}
            placeholder="Provide a reason for rejection..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button onClick={handleReject} variant="contained" color="error">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CatalogList;
