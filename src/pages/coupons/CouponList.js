import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
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
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import { Add, Delete, Visibility, CheckCircle, Cancel } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const CouponList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    discount_percentage: '',
    coupon_for: 'employee',
    expiry_date: null
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCoupons();
    if (isSuperAdmin()) {
      fetchPendingCount();
    }
  }, [statusFilter]);

  const fetchCoupons = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await adminService.getCoupons(params);
      const couponsData = response.data.coupons || [];
      setCoupons(Array.isArray(couponsData) ? couponsData : []);
    } catch (error) {
      enqueueSnackbar('Failed to load coupons', { variant: 'error' });
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const response = await adminService.getPendingCoupons();
      setPendingCount(response.data.count || 0);
    } catch (error) {
      console.error('Failed to load pending count', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminService.createCoupon({
        code: formData.code.toUpperCase(),
        name: formData.name,
        discount_percentage: parseFloat(formData.discount_percentage),
        coupon_for: formData.coupon_for,
        expiry_date: formData.expiry_date ? dayjs(formData.expiry_date).format('YYYY-MM-DD') : null
      });
      enqueueSnackbar('Coupon created successfully and pending approval', { variant: 'success' });
      setOpenDialog(false);
      fetchCoupons();
      if (isSuperAdmin()) fetchPendingCount();
      setFormData({ code: '', name: '', discount_percentage: '', coupon_for: 'employee', expiry_date: null });
    } catch (error) {
      const errorMsg = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(', ')
        : 'Failed to create coupon';
      enqueueSnackbar(errorMsg, { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon? Only coupons with no assigned users can be deleted.')) return;
    try {
      await adminService.deleteCoupon(id);
      enqueueSnackbar('Coupon deleted successfully', { variant: 'success' });
      fetchCoupons();
      if (isSuperAdmin()) fetchPendingCount();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete coupon';
      enqueueSnackbar(errorMsg, { variant: 'error' });
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/coupons/${id}`);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: 'warning', label: 'Pending' },
      approved: { color: 'success', label: 'Approved' },
      rejected: { color: 'error', label: 'Rejected' }
    };
    const config = statusConfig[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getCouponTypeChip = (type) => {
    return <Chip label={type === 'employee' ? 'Employee' : 'Employer'} color="info" size="small" variant="outlined" />;
  };

  if (loading) return <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Coupon Management</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {isSuperAdmin() && pendingCount > 0 && (
              <Button
                variant="outlined"
                color="warning"
                onClick={() => navigate('/coupons/pending')}
              >
                <Badge badgeContent={pendingCount} color="error">
                  Pending Approvals
                </Badge>
              </Button>
            )}
            <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
              Create Coupon
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={statusFilter}
              label="Status Filter"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Discount %</TableCell>
                <TableCell>For</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="text.secondary">No coupons found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow key={coupon.id} hover>
                    <TableCell><strong>{coupon.code}</strong></TableCell>
                    <TableCell>{coupon.name}</TableCell>
                    <TableCell>{coupon.discount_percentage}%</TableCell>
                    <TableCell>{getCouponTypeChip(coupon.coupon_for)}</TableCell>
                    <TableCell>{getStatusChip(coupon.status)}</TableCell>
                    <TableCell>
                      <Chip
                        label={dayjs(coupon.expiry_date).format('MMM D, YYYY')}
                        color={dayjs(coupon.expiry_date).isAfter(dayjs()) ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{coupon.creator?.name || 'N/A'}</TableCell>
                    <TableCell>{dayjs(coupon.created_at).format('MMM D, YYYY')}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleViewDetails(coupon.id)} size="small" color="primary" title="View Details">
                        <Visibility />
                      </IconButton>
                      {isSuperAdmin() && (
                        <IconButton onClick={() => handleDelete(coupon.id)} size="small" color="error" title="Delete">
                          <Delete />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>Create New Coupon</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Coupon Code"
                name="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                margin="normal"
                required
                helperText="Will be converted to uppercase"
              />
              <TextField
                fullWidth
                label="Coupon Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
                helperText="e.g., '50% Discount for Premium Users'"
              />
              <TextField
                fullWidth
                label="Discount Percentage"
                name="discount_percentage"
                type="number"
                value={formData.discount_percentage}
                onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                margin="normal"
                required
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Coupon For</InputLabel>
                <Select
                  value={formData.coupon_for}
                  label="Coupon For"
                  onChange={(e) => setFormData({ ...formData, coupon_for: e.target.value })}
                >
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="employer">Employer</MenuItem>
                </Select>
              </FormControl>
              <DatePicker
                label="Expiry Date"
                value={formData.expiry_date}
                onChange={(newValue) => setFormData({ ...formData, expiry_date: newValue })}
                minDate={dayjs()}
                sx={{ width: '100%', mt: 2 }}
                slotProps={{
                  textField: {
                    required: true,
                    helperText: 'Must be today or future date'
                  }
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? <CircularProgress size={24} /> : 'Create Coupon'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default CouponList;
