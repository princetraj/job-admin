import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, MenuItem, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { adminService } from '../../services/adminService';
import dayjs from 'dayjs';

const CVRequestList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

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

  const columns = [
    {
      field: 'employee',
      headerName: 'Employee',
      flex: 1,
      valueGetter: (params) => params?.name || 'N/A'
    },
    { field: 'notes', headerName: 'Notes', flex: 1 },
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
    </Box>
  );
};

export default CVRequestList;
