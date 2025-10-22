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
import { Visibility, Delete, Upgrade } from '@mui/icons-material';
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
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openUpgradeDialog, setOpenUpgradeDialog] = useState(false);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [upgrading, setUpgrading] = useState(false);

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

  const handleViewDetails = async (id) => {
    try {
      const response = await adminService.getEmployer(id);
      setSelectedEmployer(response.data.employer);
      setOpenDialog(true);
    } catch (error) {
      enqueueSnackbar('Failed to load employer details', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employer?')) {
      return;
    }

    try {
      await adminService.deleteEmployer(id);
      enqueueSnackbar('Employer deleted successfully', { variant: 'success' });
      fetchEmployers();
    } catch (error) {
      enqueueSnackbar('Failed to delete employer', { variant: 'error' });
    }
  };

  const handleOpenUpgradeDialog = async (employer) => {
    setSelectedEmployer(employer);
    setOpenUpgradeDialog(true);
    try {
      const plansResponse = await adminService.getPlans();
      const employerPlans = plansResponse.data.plans.filter(plan => plan.type === 'employer' && !plan.is_default);
      setAvailablePlans(employerPlans);
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
      await adminService.upgradeEmployerPlan(selectedEmployer.id, { plan_id: selectedPlan });
      enqueueSnackbar('Plan upgraded successfully', { variant: 'success' });
      setOpenUpgradeDialog(false);
      setSelectedPlan('');
      fetchEmployers();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to upgrade plan', { variant: 'error' });
    } finally {
      setUpgrading(false);
    }
  };

  const getPlanStatusColor = (employer) => {
    if (!employer.plan) return 'default';
    if (!employer.plan_is_active) return 'error';
    if (employer.plan_expires_at && dayjs(employer.plan_expires_at).isBefore(dayjs())) return 'error';
    if (employer.plan_expires_at && dayjs(employer.plan_expires_at).diff(dayjs(), 'days') < 7) return 'warning';
    return 'success';
  };

  const getPlanStatusLabel = (employer) => {
    if (!employer.plan) return 'No Plan';
    if (!employer.plan_is_active) return 'Inactive';
    if (employer.plan_expires_at && dayjs(employer.plan_expires_at).isBefore(dayjs())) return 'Expired';
    return 'Active';
  };

  const columns = [
    { field: 'company_name', headerName: 'Company Name', flex: 1, minWidth: 200 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'contact', headerName: 'Contact', width: 130 },
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
      <Typography variant="h4" gutterBottom>Employer Management</Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Search employers"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>
      <Box sx={{ height: 700, width: '100%' }}>
        <DataGrid
          rows={employers}
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
        <DialogTitle>Upgrade Plan for {selectedEmployer?.company_name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Current Plan: <strong>{selectedEmployer?.plan?.name || 'No Plan'}</strong>
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
        <DialogTitle>Employer Details</DialogTitle>
        <DialogContent>
          {selectedEmployer ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Company Information</Typography>
              <Typography><strong>Company Name:</strong> {selectedEmployer.company_name}</Typography>
              <Typography><strong>Email:</strong> {selectedEmployer.email}</Typography>
              <Typography><strong>Contact:</strong> {selectedEmployer.contact}</Typography>
              {selectedEmployer.website && (
                <Typography><strong>Website:</strong> {selectedEmployer.website}</Typography>
              )}
              {selectedEmployer.address && (
                <Typography><strong>Address:</strong> {selectedEmployer.address}</Typography>
              )}
              {selectedEmployer.industry && (
                <Typography><strong>Industry:</strong> {selectedEmployer.industry.name}</Typography>
              )}

              {/* Plan Information */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>Plan Information</Typography>
                {selectedEmployer.plan ? (
                  <>
                    <Typography>
                      <strong>Plan Name:</strong> {selectedEmployer.plan.name}{' '}
                      {selectedEmployer.plan.is_default && (
                        <Chip label="DEFAULT" size="small" color="warning" sx={{ ml: 1 }} />
                      )}
                    </Typography>
                    <Typography><strong>Price:</strong> ${selectedEmployer.plan.price}</Typography>
                    <Typography><strong>Validity:</strong> {selectedEmployer.plan.validity_days} days</Typography>
                    <Typography>
                      <strong>Status:</strong>{' '}
                      <Chip
                        label={getPlanStatusLabel(selectedEmployer)}
                        size="small"
                        color={getPlanStatusColor(selectedEmployer)}
                      />
                    </Typography>
                    <Typography>
                      <strong>Started:</strong> {selectedEmployer.plan_started_at ? dayjs(selectedEmployer.plan_started_at).format('MMM D, YYYY') : 'N/A'}
                    </Typography>
                    <Typography>
                      <strong>Expires:</strong> {selectedEmployer.plan_expires_at ? dayjs(selectedEmployer.plan_expires_at).format('MMM D, YYYY') : 'Never'}
                    </Typography>

                    {/* Plan Features */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Plan Limits:</Typography>
                      <Typography variant="body2">
                        📝 Job Posts: <strong>{selectedEmployer.plan.jobs_can_post === -1 ? 'Unlimited' : selectedEmployer.plan.jobs_can_post}</strong>
                      </Typography>
                      <Typography variant="body2">
                        👥 Employee Contact Views: <strong>{selectedEmployer.plan.employee_contact_details_can_view === -1 ? 'Unlimited' : selectedEmployer.plan.employee_contact_details_can_view}</strong>
                      </Typography>
                    </Box>

                    {/* Additional Plan Features */}
                    {selectedEmployer.plan.features && selectedEmployer.plan.features.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Additional Features:</Typography>
                        {selectedEmployer.plan.features.map((feature, idx) => (
                          <Typography key={idx} variant="body2">
                            • <strong>{feature.feature_name}:</strong> {feature.feature_value}
                          </Typography>
                        ))}
                      </Box>
                    )}
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

export default EmployerList;
