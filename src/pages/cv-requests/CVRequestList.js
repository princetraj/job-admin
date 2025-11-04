import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { adminService } from '../../services/adminService';
import dayjs from 'dayjs';

const CVRequestList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [status]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await adminService.getCVRequests({ status });
      const requestsData = response.data.cv_requests.data || response.data.cv_requests || [];
      setRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (error) {
      enqueueSnackbar('Failed to load CV requests', { variant: 'error' });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRequest(null);
    setNewStatus('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !newStatus) return;

    setUpdating(true);
    try {
      await adminService.updateCVRequestStatus(selectedRequest.id, { status: newStatus });
      enqueueSnackbar('Status updated successfully', { variant: 'success' });
      handleCloseDialog();
      fetchRequests();
    } catch (error) {
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      field: 'employee',
      headerName: 'Employee',
      flex: 1,
      valueGetter: (params) => params?.name || 'N/A'
    },
    { field: 'notes', headerName: 'Notes', flex: 1.5 },
    {
      field: 'price',
      headerName: 'Price',
      width: 100,
      valueFormatter: (params) => params ? `$${params}` : '$0.00'
    },
    {
      field: 'payment_status',
      headerName: 'Payment',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || 'pending'}
          size="small"
          color={
            params.value === 'paid' ? 'success' :
            params.value === 'refunded' ? 'warning' : 'default'
          }
        />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color={
          params.value === 'completed' ? 'success' :
          params.value === 'in_progress' ? 'primary' :
          params.value === 'rejected' ? 'error' : 'default'
        } />
      )
    },
    {
      field: 'created_at',
      headerName: 'Requested',
      width: 150,
      valueFormatter: (params) => dayjs(params).format('MMM D, YYYY')
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleOpenDialog(params.row)}
          sx={{ textTransform: 'none' }}
        >
          Change Status
        </Button>
      )
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>CV Request Management</Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ width: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </TextField>
      </Box>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid rows={requests} columns={columns} loading={loading} />
      </Box>

      {/* Status Update Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Update CV Request Status</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Employee: {selectedRequest.employee?.name || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                Notes: {selectedRequest.notes || 'No notes provided'}
              </Typography>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={updating}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            disabled={updating || !newStatus || newStatus === selectedRequest?.status}
          >
            {updating ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CVRequestList;
