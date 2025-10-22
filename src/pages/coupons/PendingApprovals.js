import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { ArrowBack, CheckCircle, Cancel, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { adminService } from '../../services/adminService';
import dayjs from 'dayjs';

const PendingApprovals = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchPendingCoupons();
  }, []);

  const fetchPendingCoupons = async () => {
    try {
      const response = await adminService.getPendingCoupons();
      setCoupons(response.data.coupons || []);
    } catch (error) {
      enqueueSnackbar('Failed to load pending coupons', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminService.approveCoupon(id, { status: 'approved' });
      enqueueSnackbar('Coupon approved successfully', { variant: 'success' });
      fetchPendingCoupons();
      setOpenDialog(false);
    } catch (error) {
      enqueueSnackbar('Failed to approve coupon', { variant: 'error' });
    }
  };

  const handleReject = async (id) => {
    try {
      await adminService.approveCoupon(id, { status: 'rejected' });
      enqueueSnackbar('Coupon rejected successfully', { variant: 'success' });
      fetchPendingCoupons();
      setOpenDialog(false);
    } catch (error) {
      enqueueSnackbar('Failed to reject coupon', { variant: 'error' });
    }
  };

  const handleViewDetails = (coupon) => {
    setSelectedCoupon(coupon);
    setOpenDialog(true);
  };

  const getCouponTypeChip = (type) => {
    return <Chip label={type === 'employee' ? 'Employee' : 'Employer'} color="info" size="small" variant="outlined" />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/coupons')} sx={{ mb: 3 }}>
        Back to Coupons
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Pending Coupon Approvals</Typography>
        <Chip label={`${coupons.length} Pending`} color="warning" />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Discount %</TableCell>
              <TableCell>For</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No pending coupons for approval
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon.id} hover>
                  <TableCell><strong>{coupon.code}</strong></TableCell>
                  <TableCell>{coupon.name}</TableCell>
                  <TableCell>{coupon.discount_percentage}%</TableCell>
                  <TableCell>{getCouponTypeChip(coupon.coupon_for)}</TableCell>
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
                    <IconButton onClick={() => handleViewDetails(coupon)} size="small" color="primary" title="View Details">
                      <Visibility />
                    </IconButton>
                    <IconButton onClick={() => handleApprove(coupon.id)} size="small" color="success" title="Approve">
                      <CheckCircle />
                    </IconButton>
                    <IconButton onClick={() => handleReject(coupon.id)} size="small" color="error" title="Reject">
                      <Cancel />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Coupon Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        {selectedCoupon && (
          <>
            <DialogTitle>
              <Typography variant="h5">{selectedCoupon.code}</Typography>
              <Typography variant="subtitle2" color="text.secondary">{selectedCoupon.name}</Typography>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Discount</Typography>
                  <Typography variant="h6">{selectedCoupon.discount_percentage}%</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Coupon For</Typography>
                  <Box sx={{ mt: 0.5 }}>{getCouponTypeChip(selectedCoupon.coupon_for)}</Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Expiry Date</Typography>
                  <Typography>{dayjs(selectedCoupon.expiry_date).format('MMMM D, YYYY')}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Created By</Typography>
                  <Typography>{selectedCoupon.creator?.name || 'N/A'}</Typography>
                  <Typography variant="caption">{dayjs(selectedCoupon.created_at).format('MMM D, YYYY HH:mm')}</Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={() => handleReject(selectedCoupon.id)}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => handleApprove(selectedCoupon.id)}
              >
                Approve
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default PendingApprovals;
