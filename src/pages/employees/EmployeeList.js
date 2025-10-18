import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { adminService } from '../../services/adminService';
import dayjs from 'dayjs';

const EmployeeList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20
  });
  const [rowCount, setRowCount] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, [paginationModel.page, search]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await adminService.getEmployees({
        page: paginationModel.page + 1,
        search
      });
      const employeesData = response.data.employees.data || response.data.employees || [];
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      setRowCount(response.data.employees.total || 0);
    } catch (error) {
      enqueueSnackbar('Failed to load employees', { variant: 'error' });
      setEmployees([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await adminService.getEmployee(id);
      setSelectedEmployee(response.data.employee);
      setOpenDialog(true);
    } catch (error) {
      enqueueSnackbar('Failed to load employee details', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      await adminService.deleteEmployee(id);
      enqueueSnackbar('Employee deleted successfully', { variant: 'success' });
      fetchEmployees();
    } catch (error) {
      enqueueSnackbar('Failed to delete employee', { variant: 'error' });
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'mobile', headerName: 'Mobile', width: 150 },
    { field: 'gender', headerName: 'Gender', width: 80 },
    {
      field: 'created_at',
      headerName: 'Joined',
      width: 120,
      valueFormatter: (params) => dayjs(params).format('MMM D, YYYY')
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton size="small" onClick={() => handleViewDetails(params.row.id)}>
            <Visibility />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
            <Delete />
          </IconButton>
        </>
      )
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Employee Management
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TextField
          label="Search employees"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={employees}
          columns={columns}
          rowCount={rowCount}
          loading={loading}
          pageSizeOptions={[20]}
          paginationModel={paginationModel}
          paginationMode="server"
          onPaginationModelChange={setPaginationModel}
          disableRowSelectionOnClick
        />
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Employee Details</DialogTitle>
        <DialogContent>
          {selectedEmployee ? (
            <Box sx={{ mt: 2 }}>
              <Typography><strong>Name:</strong> {selectedEmployee.name}</Typography>
              <Typography><strong>Email:</strong> {selectedEmployee.email}</Typography>
              <Typography><strong>Mobile:</strong> {selectedEmployee.mobile}</Typography>
              <Typography><strong>Gender:</strong> {selectedEmployee.gender}</Typography>
              <Typography><strong>DOB:</strong> {selectedEmployee.dob}</Typography>
              {selectedEmployee.cv_url && (
                <Typography>
                  <strong>CV:</strong>{' '}
                  <a href={`http://localhost:8000${selectedEmployee.cv_url}`} target="_blank" rel="noopener noreferrer">
                    View CV
                  </a>
                </Typography>
              )}
              {selectedEmployee.plan && (
                <Typography><strong>Plan:</strong> {selectedEmployee.plan.name}</Typography>
              )}
            </Box>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeList;
