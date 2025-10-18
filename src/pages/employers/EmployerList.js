import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { adminService } from '../../services/adminService';
import dayjs from 'dayjs';

const EmployerList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [rowCount, setRowCount] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEmployers();
  }, [paginationModel.page, search]);

  const fetchEmployers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getEmployers({
        page: paginationModel.page + 1,
        search
      });
      const employersData = response.data.employers.data || response.data.employers || [];
      setEmployers(Array.isArray(employersData) ? employersData : []);
      setRowCount(response.data.employers.total || 0);
    } catch (error) {
      enqueueSnackbar('Failed to load employers', { variant: 'error' });
      setEmployers([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'company_name', headerName: 'Company Name', flex: 1, minWidth: 200 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'contact', headerName: 'Contact', width: 150 },
    {
      field: 'created_at',
      headerName: 'Joined',
      width: 120,
      valueFormatter: (params) => dayjs(params).format('MMM D, YYYY')
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Employer Management</Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Search employers"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={employers}
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

export default EmployerList;
