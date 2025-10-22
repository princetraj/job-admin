import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Grid,
  IconButton,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { adminService } from '../../services/adminService';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import dayjs from 'dayjs';

const ProfilePhotoApproval = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0
  });

  useEffect(() => {
    fetchProfilePhotos(statusFilter);
  }, [statusFilter]);

  const fetchProfilePhotos = async (status = 'pending') => {
    setLoading(true);
    try {
      const response = await adminService.getProfilePhotos(status);
      const employeesData = response.data.employees || [];
      setEmployees(Array.isArray(employeesData) ? employeesData : []);

      // Update count for current status
      setStatusCounts(prev => ({
        ...prev,
        [status]: response.data.count || 0
      }));
    } catch (error) {
      enqueueSnackbar('Failed to load profile photos', { variant: 'error' });
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPhotos = async () => {
    fetchProfilePhotos('pending');
  };

  const handleApprove = async (employee) => {
    setProcessing(true);
    try {
      await adminService.updateProfilePhotoStatus(employee.id, { status: 'approved' });
      enqueueSnackbar(`Profile photo approved for ${employee.name}`, { variant: 'success' });
      await fetchProfilePhotos(statusFilter); // Refresh current filtered list
    } catch (error) {
      enqueueSnackbar('Failed to approve profile photo', { variant: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectClick = (employee) => {
    setSelectedEmployee(employee);
    setRejectionReason('');
    setRejectionDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      enqueueSnackbar('Please provide a rejection reason', { variant: 'warning' });
      return;
    }

    setProcessing(true);
    try {
      await adminService.updateProfilePhotoStatus(selectedEmployee.id, {
        status: 'rejected',
        rejection_reason: rejectionReason
      });
      enqueueSnackbar(`Profile photo rejected for ${selectedEmployee.name}`, { variant: 'success' });
      setRejectionDialogOpen(false);
      setSelectedEmployee(null);
      setRejectionReason('');
      await fetchProfilePhotos(statusFilter); // Refresh current filtered list
    } catch (error) {
      enqueueSnackbar('Failed to reject profile photo', { variant: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setStatusFilter(newValue);
  };

  // No longer needed - API now returns full URLs
  // Keep for backward compatibility in case old data exists
  const getPhotoUrl = (employee) => {
    // If profile_photo_full_url is available, use it directly
    if (employee.profile_photo_full_url) {
      return employee.profile_photo_full_url;
    }

    // Fallback for old data format
    if (employee.profile_photo_url) {
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      const baseUrl = apiBaseUrl.replace('/api/v1', '');
      return `${baseUrl}${employee.profile_photo_url}`;
    }

    return null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Profile Photo Management</Typography>
        <IconButton onClick={() => fetchProfilePhotos(statusFilter)} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Status Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={statusFilter} onChange={handleTabChange} aria-label="profile photo status tabs">
          <Tab
            label={
              <Badge badgeContent={statusCounts.pending} color="warning">
                Pending
              </Badge>
            }
            value="pending"
          />
          <Tab
            label={
              <Badge badgeContent={statusCounts.approved} color="success">
                Approved
              </Badge>
            }
            value="approved"
          />
          <Tab
            label={
              <Badge badgeContent={statusCounts.rejected} color="error">
                Rejected
              </Badge>
            }
            value="rejected"
          />
          <Tab
            label={
              <Badge badgeContent={statusCounts.all} color="primary">
                All
              </Badge>
            }
            value="all"
          />
        </Tabs>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : employees.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              No {statusFilter === 'all' ? '' : statusFilter} profile photos found
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {employees.map((employee) => (
            <Grid item xs={12} sm={6} md={4} key={employee.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="300"
                  image={getPhotoUrl(employee)}
                  alt={employee.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {employee.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {employee.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {employee.mobile}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={employee.profile_photo_status.charAt(0).toUpperCase() + employee.profile_photo_status.slice(1)}
                      color={getStatusColor(employee.profile_photo_status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Uploaded: {dayjs(employee.created_at).format('MMM D, YYYY')}
                  </Typography>
                  {employee.profile_photo_status === 'rejected' && employee.profile_photo_rejection_reason && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: 'error.lighter', borderRadius: 1 }}>
                      <Typography variant="caption" color="error.dark" fontWeight="bold">
                        Rejection Reason:
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {employee.profile_photo_rejection_reason}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                {employee.profile_photo_status === 'pending' && (
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleApprove(employee)}
                      disabled={processing}
                      size="small"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => handleRejectClick(employee)}
                      disabled={processing}
                      size="small"
                    >
                      Reject
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Rejection Dialog */}
      <Dialog
        open={rejectionDialogOpen}
        onClose={() => !processing && setRejectionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Profile Photo</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Employee: <strong>{selectedEmployee?.name}</strong>
          </Typography>
          <TextField
            autoFocus
            multiline
            rows={4}
            label="Rejection Reason"
            placeholder="Please provide a reason for rejection (e.g., inappropriate content, poor quality, etc.)"
            fullWidth
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            disabled={processing}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialogOpen(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleRejectConfirm}
            variant="contained"
            color="error"
            disabled={processing || !rejectionReason.trim()}
          >
            {processing ? 'Rejecting...' : 'Confirm Rejection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePhotoApproval;
