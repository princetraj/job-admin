import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, MenuItem, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { adminService } from '../../services/adminService';
import dayjs from 'dayjs';

const JobList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [rowCount, setRowCount] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [paginationModel.page, search, status]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await adminService.getJobs({
        page: paginationModel.page + 1,
        search,
        status
      });
      const jobsData = response.data.jobs.data || response.data.jobs || [];
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setRowCount(response.data.jobs.total || 0);
    } catch (error) {
      enqueueSnackbar('Failed to load jobs', { variant: 'error' });
      setJobs([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'title', headerName: 'Job Title', flex: 1, minWidth: 200 },
    {
      field: 'employer',
      headerName: 'Company',
      flex: 1,
      minWidth: 150,
      valueGetter: (value, row) => row?.employer?.company_name || 'N/A'
    },
    {
      field: 'employer_email',
      headerName: 'Employer Email',
      flex: 1,
      minWidth: 180,
      valueGetter: (value, row) => row?.employer?.email || 'N/A'
    },
    {
      field: 'employer_contact',
      headerName: 'Employer Contact',
      width: 150,
      valueGetter: (value, row) => row?.employer?.contact || 'N/A'
    },
    { field: 'salary', headerName: 'Salary', width: 150 },
    {
      field: 'location',
      headerName: 'Location',
      width: 150,
      valueGetter: (value, row) => row?.location?.name || 'N/A'
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
      valueGetter: (value, row) => row?.category?.name || 'N/A'
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'active' ? 'success' : 'default'}
          size="small"
        />
      )
    },
    { field: 'applications_count', headerName: 'Applications', width: 120 },
    {
      field: 'created_at',
      headerName: 'Posted',
      width: 120,
      valueFormatter: (params) => dayjs(params).format('MMM D, YYYY')
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Job Management</Typography>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          label="Search jobs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ width: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
          <MenuItem value="expired">Expired</MenuItem>
        </TextField>
      </Box>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={jobs}
          columns={columns}
          rowCount={rowCount}
          loading={loading}
          pageSizeOptions={[20]}
          paginationModel={paginationModel}
          paginationMode="server"
          onPaginationModelChange={setPaginationModel}
        />
      </Box>
    </Box>
  );
};

export default JobList;
