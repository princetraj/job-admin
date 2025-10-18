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
  CircularProgress
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const CouponList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_percentage: '',
    expiry_date: null
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await adminService.getCoupons();
      const couponsData = response.data.coupons || [];
      setCoupons(Array.isArray(couponsData) ? couponsData : []);
    } catch (error) {
      enqueueSnackbar('Failed to load coupons', { variant: 'error' });
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminService.createCoupon({
        code: formData.code,
        discount_percentage: parseFloat(formData.discount_percentage),
        expiry_date: formData.expiry_date ? dayjs(formData.expiry_date).format('YYYY-MM-DD') : null,
        staff_id: user.id
      });
      enqueueSnackbar('Coupon created successfully', { variant: 'success' });
      setOpenDialog(false);
      fetchCoupons();
      setFormData({ code: '', discount_percentage: '', expiry_date: null });
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
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await adminService.deleteCoupon(id);
      enqueueSnackbar('Coupon deleted successfully', { variant: 'success' });
      fetchCoupons();
    } catch (error) {
      enqueueSnackbar('Failed to delete coupon', { variant: 'error' });
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Coupon Management</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
            Add Coupon
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Discount %</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell><strong>{coupon.code}</strong></TableCell>
                  <TableCell>{coupon.discount_percentage}%</TableCell>
                  <TableCell>
                    <Chip
                      label={dayjs(coupon.expiry_date).format('MMM D, YYYY')}
                      color={dayjs(coupon.expiry_date).isAfter(dayjs()) ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{coupon.staff?.name || 'N/A'}</TableCell>
                  <TableCell>{dayjs(coupon.created_at).format('MMM D, YYYY')}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleDelete(coupon.id)} size="small" color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>Add Coupon</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Coupon Code"
                name="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                margin="normal"
                required
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
              <DatePicker
                label="Expiry Date"
                value={formData.expiry_date}
                onChange={(newValue) => setFormData({ ...formData, expiry_date: newValue })}
                sx={{ width: '100%', mt: 2 }}
                slotProps={{
                  textField: {
                    required: true
                  }
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? <CircularProgress size={24} /> : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default CouponList;
