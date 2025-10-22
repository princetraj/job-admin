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
  CircularProgress,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Delete, Visibility, Upgrade } from '@mui/icons-material';
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
  const [openUpgradeDialog, setOpenUpgradeDialog] = useState(false);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [upgrading, setUpgrading] = useState(false);

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

  const handleOpenUpgradeDialog = async (employee) => {
    setSelectedEmployee(employee);
    setOpenUpgradeDialog(true);
    try {
      const plansResponse = await adminService.getPlans();
      const employeePlans = plansResponse.data.plans.filter(plan => plan.type === 'employee' && !plan.is_default);
      setAvailablePlans(employeePlans);
    } catch (error) {
      enqueueSnackbar('Failed to load plans', { variant: 'error' });
    }
  };

  const handleUpgradePlan = async () => {
    if (!selectedPlan) {
      enqueueSnackbar('Please select a plan', { variant: 'warning' });
      return;
    }

    setUpgrading(true);
    try {
      await adminService.upgradeEmployeePlan(selectedEmployee.id, { plan_id: selectedPlan });
      enqueueSnackbar('Plan upgraded successfully', { variant: 'success' });
      setOpenUpgradeDialog(false);
      setSelectedPlan('');
      fetchEmployees();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to upgrade plan', { variant: 'error' });
    } finally {
      setUpgrading(false);
    }
  };

  const getPlanStatusColor = (employee) => {
    if (!employee.plan) return 'default';
    if (!employee.plan_is_active) return 'error';
    if (employee.plan_expires_at && dayjs(employee.plan_expires_at).isBefore(dayjs())) return 'error';
    if (employee.plan_expires_at && dayjs(employee.plan_expires_at).diff(dayjs(), 'days') < 7) return 'warning';
    return 'success';
  };

  const getPlanStatusLabel = (employee) => {
    if (!employee.plan) return 'No Plan';
    if (!employee.plan_is_active) return 'Inactive';
    if (employee.plan_expires_at && dayjs(employee.plan_expires_at).isBefore(dayjs())) return 'Expired';
    return 'Active';
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'mobile', headerName: 'Mobile', width: 130 },
    {
      field: 'plan',
      headerName: 'Plan',
      width: 180,
      renderCell: (params) => {
        const plan = params.row.plan;
        if (!plan) {
          return <Chip label="No Plan" size="small" color="default" />;
        }
        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {plan.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ${plan.price}/{plan.validity_days}d
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'plan_status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={getPlanStatusLabel(params.row)}
          size="small"
          color={getPlanStatusColor(params.row)}
        />
      )
    },
    {
      field: 'plan_expires_at',
      headerName: 'Plan Expires',
      width: 130,
      renderCell: (params) => {
        if (!params.row.plan_expires_at) return <Typography variant="body2">Never</Typography>;
        const expiryDate = dayjs(params.row.plan_expires_at);
        const daysLeft = expiryDate.diff(dayjs(), 'days');
        return (
          <Box>
            <Typography variant="body2">{expiryDate.format('MMM D, YYYY')}</Typography>
            {daysLeft >= 0 && (
              <Typography variant="caption" color={daysLeft < 7 ? 'error' : 'text.secondary'}>
                {daysLeft} days left
              </Typography>
            )}
          </Box>
        );
      }
    },
    {
      field: 'created_at',
      headerName: 'Joined',
      width: 120,
      valueFormatter: (params) => dayjs(params).format('MMM D, YYYY')
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton size="small" onClick={() => handleViewDetails(params.row.id)} title="View Details">
            <Visibility />
          </IconButton>
          <IconButton size="small" color="primary" onClick={() => handleOpenUpgradeDialog(params.row)} title="Upgrade Plan">
            <Upgrade />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)} title="Delete">
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

      <Box sx={{ height: 700, width: '100%' }}>
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
          getRowHeight={() => 'auto'}
          sx={{
            '& .MuiDataGrid-cell': {
              py: 1,
            },
          }}
        />
      </Box>

      <Dialog open={openUpgradeDialog} onClose={() => setOpenUpgradeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upgrade Plan for {selectedEmployee?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Current Plan: <strong>{selectedEmployee?.plan?.name || 'No Plan'}</strong>
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select New Plan</InputLabel>
              <Select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                label="Select New Plan"
              >
                {availablePlans.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.name} - ${plan.price} ({plan.validity_days} days)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpgradeDialog(false)} disabled={upgrading}>Cancel</Button>
          <Button onClick={handleUpgradePlan} variant="contained" disabled={upgrading || !selectedPlan}>
            {upgrading ? <CircularProgress size={24} /> : 'Upgrade Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Employee Details</DialogTitle>
        <DialogContent>
          {selectedEmployee ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Personal Information</Typography>
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

              {/* Plan Information */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>Plan Information</Typography>
                {selectedEmployee.plan ? (
                  <>
                    <Typography>
                      <strong>Plan Name:</strong> {selectedEmployee.plan.name}{' '}
                      {selectedEmployee.plan.is_default && (
                        <Chip label="DEFAULT" size="small" color="warning" sx={{ ml: 1 }} />
                      )}
                    </Typography>
                    <Typography><strong>Price:</strong> ${selectedEmployee.plan.price}</Typography>
                    <Typography><strong>Validity:</strong> {selectedEmployee.plan.validity_days} days</Typography>
                    <Typography>
                      <strong>Status:</strong>{' '}
                      <Chip
                        label={getPlanStatusLabel(selectedEmployee)}
                        size="small"
                        color={getPlanStatusColor(selectedEmployee)}
                      />
                    </Typography>
                    <Typography>
                      <strong>Started:</strong> {selectedEmployee.plan_started_at ? dayjs(selectedEmployee.plan_started_at).format('MMM D, YYYY') : 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Expires:</strong> {selectedEmployee.plan_expires_at ? dayjs(selectedEmployee.plan_expires_at).format('MMM D, YYYY') : 'Never'}
                    </Typography>

                    {/* Plan Features */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Plan Limits:</Typography>
                      <Typography variant="body2">
                        📋 Job Applications: <strong>{selectedEmployee.plan.jobs_can_apply === -1 ? 'Unlimited' : selectedEmployee.plan.jobs_can_apply}</strong>
                      </Typography>
                      <Typography variant="body2">
                        👁️ Contact Views: <strong>{selectedEmployee.plan.contact_details_can_view === -1 ? 'Unlimited' : selectedEmployee.plan.contact_details_can_view}</strong>
                      </Typography>
                      <Typography variant="body2">
                        💬 WhatsApp Alerts: <strong>{selectedEmployee.plan.whatsapp_alerts ? '✓ Enabled' : '✗ Disabled'}</strong>
                      </Typography>
                      <Typography variant="body2">
                        📱 SMS Alerts: <strong>{selectedEmployee.plan.sms_alerts ? '✓ Enabled' : '✗ Disabled'}</strong>
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Typography color="error">No plan assigned</Typography>
                )}
              </Box>
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
