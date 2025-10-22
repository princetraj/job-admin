import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Chip,
  Grid,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert
} from '@mui/material';
import { ArrowBack, Delete, PersonAdd, CheckCircle, Cancel } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const CouponDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [assignForm, setAssignForm] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCouponDetails();
  }, [id]);

  const fetchCouponDetails = async () => {
    try {
      const response = await adminService.getCoupon(id);
      setCoupon(response.data.coupon);
      setAssignedUsers(response.data.assigned_users || []);
    } catch (error) {
      enqueueSnackbar('Failed to load coupon details', { variant: 'error' });
      navigate('/coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (status) => {
    if (!window.confirm(`Are you sure you want to ${status} this coupon?`)) return;
    try {
      await adminService.approveCoupon(id, { status });
      enqueueSnackbar(`Coupon ${status} successfully`, { variant: 'success' });
      fetchCouponDetails();
    } catch (error) {
      enqueueSnackbar(`Failed to ${status} coupon`, { variant: 'error' });
    }
  };

  const handleOpenAssignDialog = () => {
    // Initialize form with correct type based on coupon
    if (coupon) {
      setAssignForm([{ identifier: '', type: coupon.coupon_for }]);
      setOpenAssignDialog(true);
    }
  };

  const handleAddUser = () => {
    setAssignForm([...assignForm, { identifier: '', type: coupon.coupon_for }]);
  };

  const handleRemoveFormRow = (index) => {
    setAssignForm(assignForm.filter((_, i) => i !== index));
  };

  const handleSubmitAssign = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const users = assignForm.filter(u => u.identifier.trim() !== '');
      const response = await adminService.assignUsersToCoupon(id, { users });

      const { assigned, failed } = response.data;

      if (assigned.length > 0) {
        enqueueSnackbar(`Successfully assigned ${assigned.length} user(s)`, { variant: 'success' });
      }

      if (failed.length > 0) {
        failed.forEach(f => {
          enqueueSnackbar(`${f.identifier}: ${f.reason}`, { variant: 'warning' });
        });
      }

      setOpenAssignDialog(false);
      setAssignForm([]);
      fetchCouponDetails();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to assign users';
      enqueueSnackbar(errorMsg, { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveUser = async (assignmentId) => {
    if (!window.confirm('Remove this user from the coupon?')) return;
    try {
      await adminService.removeUserFromCoupon(id, assignmentId);
      enqueueSnackbar('User removed successfully', { variant: 'success' });
      fetchCouponDetails();
    } catch (error) {
      enqueueSnackbar('Failed to remove user', { variant: 'error' });
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: 'warning', label: 'Pending', icon: null },
      approved: { color: 'success', label: 'Approved', icon: <CheckCircle /> },
      rejected: { color: 'error', label: 'Rejected', icon: <Cancel /> }
    };
    const config = statusConfig[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} icon={config.icon} />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!coupon) {
    return <Typography>Coupon not found</Typography>;
  }

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/coupons')} sx={{ mb: 3 }}>
        Back to Coupons
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {coupon.code}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {coupon.name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {getStatusChip(coupon.status)}
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" color="text.secondary">
              Discount
            </Typography>
            <Typography variant="h5">{coupon.discount_percentage}%</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" color="text.secondary">
              Coupon For
            </Typography>
            <Typography variant="h6">
              <Chip label={coupon.coupon_for === 'employee' ? 'Employee' : 'Employer'} color="info" size="small" />
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" color="text.secondary">
              Expiry Date
            </Typography>
            <Typography variant="body1">
              <Chip
                label={dayjs(coupon.expiry_date).format('MMM D, YYYY')}
                color={dayjs(coupon.expiry_date).isAfter(dayjs()) ? 'success' : 'error'}
                size="small"
              />
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" color="text.secondary">
              Assigned Users
            </Typography>
            <Typography variant="h5">{assignedUsers.length}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">Created By</Typography>
            <Typography>{coupon.creator?.name || 'N/A'}</Typography>
            <Typography variant="caption">{dayjs(coupon.created_at).format('MMM D, YYYY HH:mm')}</Typography>
          </Grid>
          {coupon.approver && (
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">Approved By</Typography>
              <Typography>{coupon.approver.name}</Typography>
              <Typography variant="caption">{dayjs(coupon.approved_at).format('MMM D, YYYY HH:mm')}</Typography>
            </Grid>
          )}
        </Grid>

        {isSuperAdmin() && coupon.status === 'pending' && (
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => handleApprove('approved')}
            >
              Approve Coupon
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => handleApprove('rejected')}
            >
              Reject Coupon
            </Button>
          </Box>
        )}
      </Paper>

      {coupon.status === 'approved' ? (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Assigned Users</Typography>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={handleOpenAssignDialog}
            >
              Assign Users
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Assigned By</TableCell>
                  <TableCell>Assigned At</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No users assigned yet. Click "Assign Users" to add users to this coupon.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  assignedUsers.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.user_data?.name || 'N/A'}</TableCell>
                      <TableCell>{assignment.user_data?.email || 'N/A'}</TableCell>
                      <TableCell>{assignment.user_data?.mobile || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip label={assignment.user_type} size="small" color="info" variant="outlined" />
                      </TableCell>
                      <TableCell>{assignment.assigned_by?.name || 'N/A'}</TableCell>
                      <TableCell>{dayjs(assignment.assigned_at).format('MMM D, YYYY HH:mm')}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => handleRemoveUser(assignment.id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Alert severity="info">
          Users can only be assigned after the coupon is approved by a Super Admin.
        </Alert>
      )}

      {/* Assign Users Dialog */}
      <Dialog open={openAssignDialog} onClose={() => { setOpenAssignDialog(false); setAssignForm([]); }} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmitAssign}>
          <DialogTitle>Assign Users to Coupon</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter email address or phone number of {coupon?.coupon_for}s to assign to this coupon.
            </Typography>
            {assignForm.length > 0 && assignForm.map((form, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Email or Phone"
                  value={form.identifier}
                  onChange={(e) => {
                    const newForm = [...assignForm];
                    newForm[index].identifier = e.target.value;
                    setAssignForm(newForm);
                  }}
                  placeholder="email@example.com or 1234567890"
                  required
                />
                <IconButton
                  color="error"
                  onClick={() => handleRemoveFormRow(index)}
                  disabled={assignForm.length === 1}
                >
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button onClick={handleAddUser} variant="outlined" size="small">
              + Add Another
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenAssignDialog(false); setAssignForm([]); }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={24} /> : 'Assign Users'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CouponDetails;
