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
  InputLabel,
  Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Visibility, Delete, Upgrade, CheckCircle, FilterList, Download, Add, WorkOutline, List } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { adminService } from '../../services/adminService';
import dayjs from 'dayjs';
import AddEmployerDialog from '../../components/AddEmployerDialog';
import AddJobDialog from '../../components/AddJobDialog';

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
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openAddJobDialog, setOpenAddJobDialog] = useState(false);
  const [selectedEmployerForJob, setSelectedEmployerForJob] = useState(null);
  const [openJobsDialog, setOpenJobsDialog] = useState(false);
  const [employerJobs, setEmployerJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    planId: '',
    accountStatus: ''
  });
  const [allPlans, setAllPlans] = useState([]);

  useEffect(() => {
    fetchEmployers();
  }, [paginationModel.page, search, filters]);

  useEffect(() => {
    fetchAllPlans();
  }, []);

  const fetchAllPlans = async () => {
    try {
      const response = await adminService.getPlans();
      const employerPlans = response.data.plans.filter(plan => plan.type === 'employer');
      setAllPlans(employerPlans);
    } catch (error) {
      console.error('Failed to load plans for filters', error);
    }
  };

  const fetchEmployers = async () => {
    setLoading(true);
    try {
      const params = {
        page: paginationModel.page + 1,
        search
      };

      // Add filters to params
      if (filters.dateFrom) params.date_from = filters.dateFrom;
      if (filters.dateTo) params.date_to = filters.dateTo;
      if (filters.planId) params.plan_id = filters.planId;
      if (filters.accountStatus) params.account_status = filters.accountStatus;

      const response = await adminService.getEmployers(params);
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

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page
  };

  const handleClearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      planId: '',
      accountStatus: ''
    });
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const handleExportToExcel = async () => {
    try {
      const params = { search };

      // Add filters to params
      if (filters.dateFrom) params.date_from = filters.dateFrom;
      if (filters.dateTo) params.date_to = filters.dateTo;
      if (filters.planId) params.plan_id = filters.planId;
      if (filters.accountStatus) params.account_status = filters.accountStatus;

      const response = await adminService.exportEmployers(params);

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `employers_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      enqueueSnackbar('Employers exported successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to export employers', { variant: 'error' });
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

  const handleApprove = async (id) => {
    try {
      await adminService.approveEmployer(id);
      enqueueSnackbar('Employer approved successfully', { variant: 'success' });
      fetchEmployers();
    } catch (error) {
      enqueueSnackbar('Failed to approve employer', { variant: 'error' });
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

  const handleOpenAddJobDialog = (employer) => {
    setSelectedEmployerForJob(employer);
    setOpenAddJobDialog(true);
  };

  const handleViewJobs = async (employer) => {
    setSelectedEmployer(employer);
    setOpenJobsDialog(true);
    setLoadingJobs(true);
    try {
      const response = await adminService.getEmployer(employer.id);
      setEmployerJobs(response.data.employer.jobs || []);
    } catch (error) {
      enqueueSnackbar('Failed to load jobs', { variant: 'error' });
      setEmployerJobs([]);
    } finally {
      setLoadingJobs(false);
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
      field: 'added_by',
      headerName: 'Added By',
      width: 180,
      renderCell: (params) => {
        if (params.row.added_by_admin_id) {
          return (
            <Box>
              <Chip
                label="Admin"
                size="small"
                color="info"
                sx={{ mb: 0.5 }}
              />
              {params.row.added_by_admin && (
                <Typography variant="caption" display="block" color="text.secondary">
                  {params.row.added_by_admin.name}
                </Typography>
              )}
            </Box>
          );
        }
        return <Chip label="Self Registered" size="small" color="default" />;
      }
    },
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
      field: 'account_status',
      headerName: 'Account',
      width: 100,
      renderCell: (params) => {
        const status = params.row.account_status || 'pending';
        const colorMap = {
          approved: 'success',
          pending: 'warning',
          rejected: 'error'
        };
        return (
          <Chip
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            size="small"
            color={colorMap[status] || 'default'}
          />
        );
      }
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
      width: 250,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton size="small" onClick={() => handleViewDetails(params.row.id)} title="View Details">
            <Visibility />
          </IconButton>
          <IconButton size="small" color="info" onClick={() => handleViewJobs(params.row)} title="View Jobs">
            <List />
          </IconButton>
          <IconButton size="small" color="secondary" onClick={() => handleOpenAddJobDialog(params.row)} title="Add Job">
            <WorkOutline />
          </IconButton>
          {params.row.account_status !== 'approved' && (
            <IconButton size="small" color="success" onClick={() => handleApprove(params.row.id)} title="Approve">
              <CheckCircle />
            </IconButton>
          )}
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Employer Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add Employer
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Search employers"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              sx={{ minWidth: 200 }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Date From"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ minWidth: 150 }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Date To"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ minWidth: 150 }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth sx={{ minWidth: 200 }}>
              <InputLabel>Plan</InputLabel>
              <Select
                value={filters.planId}
                onChange={(e) => handleFilterChange('planId', e.target.value)}
                label="Plan"
              >
                <MenuItem value="">All Plans</MenuItem>
                {allPlans.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth sx={{ minWidth: 200 }}>
              <InputLabel>Approval Status</InputLabel>
              <Select
                value={filters.accountStatus}
                onChange={(e) => handleFilterChange('accountStatus', e.target.value)}
                label="Approval Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<Download />}
            onClick={handleExportToExcel}
          >
            Export to Excel
          </Button>
        </Box>
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
                <Typography>
                  <strong>Address:</strong>{' '}
                  {[
                    selectedEmployer.address.street,
                    selectedEmployer.address.city,
                    selectedEmployer.address.state,
                    selectedEmployer.address.zip,
                    selectedEmployer.address.country
                  ].filter(Boolean).join(', ')}
                </Typography>
              )}
              {selectedEmployer.industry && (
                <Typography><strong>Industry:</strong> {selectedEmployer.industry.name}</Typography>
              )}
              {selectedEmployer.added_by_admin_id && (
                <Typography>
                  <strong>Created By:</strong> {selectedEmployer.added_by_admin ?
                    `${selectedEmployer.added_by_admin.name} (${selectedEmployer.added_by_admin.email})` :
                    `Admin (ID: ${selectedEmployer.added_by_admin_id})`}
                  <Chip label="Admin Created" size="small" color="info" sx={{ ml: 1 }} />
                </Typography>
              )}
              {!selectedEmployer.added_by_admin_id && (
                <Typography>
                  <strong>Registration:</strong> Self-registered
                  <Chip label="Self Registered" size="small" color="default" sx={{ ml: 1 }} />
                </Typography>
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

      <AddEmployerDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onSuccess={fetchEmployers}
      />

      <AddJobDialog
        open={openAddJobDialog}
        onClose={() => setOpenAddJobDialog(false)}
        employer={selectedEmployerForJob}
        onSuccess={fetchEmployers}
      />

      {/* Jobs Dialog */}
      <Dialog open={openJobsDialog} onClose={() => setOpenJobsDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Jobs Posted by {selectedEmployer?.company_name}
        </DialogTitle>
        <DialogContent>
          {loadingJobs ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : employerJobs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Jobs Posted Yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This employer hasn't posted any jobs yet.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              {employerJobs.map((job, index) => (
                <Box
                  key={job.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ mb: 0.5 }}>
                        {index + 1}. {job.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        {job.location && (
                          <Chip
                            label={`📍 ${job.location.name}, ${job.location.state}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {job.category && (
                          <Chip
                            label={`📂 ${job.category.name}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {job.salary && (
                          <Chip
                            label={`💰 ${job.salary}`}
                            size="small"
                            variant="outlined"
                            color="success"
                          />
                        )}
                        {job.is_featured && (
                          <Chip
                            label="⭐ Featured"
                            size="small"
                            color="warning"
                          />
                        )}
                      </Box>
                    </Box>
                    <Chip
                      label={`Posted: ${dayjs(job.created_at).format('MMM D, YYYY')}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {job.description.length > 300
                      ? job.description.substring(0, 300) + '...'
                      : job.description}
                  </Typography>
                  {job.applications_count !== undefined && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {job.applications_count} application{job.applications_count !== 1 ? 's' : ''}
                    </Typography>
                  )}
                </Box>
              ))}
              <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Total Jobs:</strong> {employerJobs.length}
                  {selectedEmployer?.plan && (
                    <>
                      {' | '}
                      <strong>Plan Limit:</strong>{' '}
                      {selectedEmployer.plan.jobs_can_post === -1
                        ? 'Unlimited'
                        : `${employerJobs.length}/${selectedEmployer.plan.jobs_can_post}`}
                    </>
                  )}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJobsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployerList;
