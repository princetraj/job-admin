import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab
} from '@mui/material';
import { Visibility, Search } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { adminService } from '../../services/adminService';

const OrderList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (tabValue === 0) {
      fetchOrders();
    } else if (tabValue === 1) {
      fetchTransactions();
    } else if (tabValue === 2) {
      fetchStats();
    }
  }, [tabValue, statusFilter, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await adminService.getPlanOrders(params);
      const ordersData = response.data.orders?.data || response.data.orders || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      enqueueSnackbar('Failed to load orders', { variant: 'error' });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await adminService.getPaymentTransactions(params);
      const transactionsData = response.data.transactions?.data || response.data.transactions || [];
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
    } catch (error) {
      enqueueSnackbar('Failed to load transactions', { variant: 'error' });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPaymentStats();
      setStats(response.data);
    } catch (error) {
      enqueueSnackbar('Failed to load statistics', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await adminService.getPlanOrder(orderId);
      setSelectedOrder(response.data.order);
      setOpenOrderDialog(true);
    } catch (error) {
      enqueueSnackbar('Failed to load order details', { variant: 'error' });
    }
  };

  const handleViewTransaction = async (transactionId) => {
    try {
      const response = await adminService.getPaymentTransaction(transactionId);
      setSelectedTransaction(response.data.transaction);
      setOpenTransactionDialog(true);
    } catch (error) {
      enqueueSnackbar('Failed to load transaction details', { variant: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'success':
        return 'success';
      case 'created':
        return 'warning';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setStatusFilter('');
    setSearchTerm('');
  };

  if (loading && (orders.length === 0 && transactions.length === 0 && !stats)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Payment Orders & Transactions
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Orders" />
          <Tab label="Transactions" />
          <Tab label="Statistics" />
        </Tabs>
      </Box>

      {/* Filters */}
      {(tabValue === 0 || tabValue === 1) && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            select
            label="Status Filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 200 }}
            size="small"
          >
            <MenuItem value="">All</MenuItem>
            {tabValue === 0 ? (
              <>
                <MenuItem value="created">Created</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </>
            ) : (
              <>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </>
            )}
          </TextField>
          <TextField
            label="Search"
            placeholder="Search by ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <Search />
            }}
          />
        </Box>
      )}

      {/* Orders Tab */}
      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Razorpay Order ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id.substring(0, 8)}...</TableCell>
                    <TableCell>{order.razorpay_order_id}</TableCell>
                    <TableCell>
                      {order.employee ? (
                        <div>
                          <Typography variant="body2">{order.employee.name}</Typography>
                          <Typography variant="caption" color="textSecondary">Employee</Typography>
                        </div>
                      ) : order.employer ? (
                        <div>
                          <Typography variant="body2">{order.employer.company_name}</Typography>
                          <Typography variant="caption" color="textSecondary">Employer</Typography>
                        </div>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>{order.plan?.name || 'N/A'}</TableCell>
                    <TableCell>{formatCurrency(order.amount)}</TableCell>
                    <TableCell>
                      <Chip label={order.status} color={getStatusColor(order.status)} size="small" />
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewOrder(order.id)} size="small">
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Transactions Tab */}
      {tabValue === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Payment ID</TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.id.substring(0, 8)}...</TableCell>
                    <TableCell>{transaction.razorpay_payment_id || 'N/A'}</TableCell>
                    <TableCell>{transaction.order?.razorpay_order_id || 'N/A'}</TableCell>
                    <TableCell>
                      {transaction.order?.employee ? (
                        <div>
                          <Typography variant="body2">{transaction.order.employee.name}</Typography>
                          <Typography variant="caption" color="textSecondary">Employee</Typography>
                        </div>
                      ) : transaction.order?.employer ? (
                        <div>
                          <Typography variant="body2">{transaction.order.employer.company_name}</Typography>
                          <Typography variant="caption" color="textSecondary">Employer</Typography>
                        </div>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>{transaction.method || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip label={transaction.status} color={getStatusColor(transaction.status)} size="small" />
                    </TableCell>
                    <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewTransaction(transaction.id)} size="small">
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Statistics Tab */}
      {tabValue === 2 && stats && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Total Orders</Typography>
                  <Typography variant="h4">{stats.total_orders}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Paid Orders</Typography>
                  <Typography variant="h4" color="success.main">{stats.total_paid_orders}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Pending Orders</Typography>
                  <Typography variant="h4" color="warning.main">{stats.total_pending_orders}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Failed Orders</Typography>
                  <Typography variant="h4" color="error.main">{stats.total_failed_orders}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Total Revenue</Typography>
                  <Typography variant="h4" color="primary.main">{formatCurrency(stats.total_revenue)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Total Transactions</Typography>
                  <Typography variant="h4">{stats.total_transactions}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Success Rate</Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.total_transactions > 0
                      ? ((stats.successful_transactions / stats.total_transactions) * 100).toFixed(1)
                      : 0}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Monthly Revenue (Last 12 Months)</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.monthly_revenue?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.month}</TableCell>
                      <TableCell align="right">{formatCurrency(item.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      )}

      {/* Order Details Dialog */}
      <Dialog open={openOrderDialog} onClose={() => setOpenOrderDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Order ID</Typography>
                  <Typography variant="body1">{selectedOrder.id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Razorpay Order ID</Typography>
                  <Typography variant="body1">{selectedOrder.razorpay_order_id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">User</Typography>
                  <Typography variant="body1">
                    {selectedOrder.employee ? selectedOrder.employee.name + ' (Employee)' :
                     selectedOrder.employer ? selectedOrder.employer.company_name + ' (Employer)' : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Plan</Typography>
                  <Typography variant="body1">{selectedOrder.plan?.name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Amount</Typography>
                  <Typography variant="body1">{formatCurrency(selectedOrder.amount)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Currency</Typography>
                  <Typography variant="body1">{selectedOrder.currency}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Chip label={selectedOrder.status} color={getStatusColor(selectedOrder.status)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Created At</Typography>
                  <Typography variant="body1">{formatDate(selectedOrder.created_at)}</Typography>
                </Grid>
                {selectedOrder.transaction && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mt: 2 }}>Transaction Details</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Payment ID</Typography>
                      <Typography variant="body1">{selectedOrder.transaction.razorpay_payment_id}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Payment Method</Typography>
                      <Typography variant="body1">{selectedOrder.transaction.method || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Transaction Status</Typography>
                      <Chip label={selectedOrder.transaction.status} color={getStatusColor(selectedOrder.transaction.status)} />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOrderDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Transaction Details Dialog */}
      <Dialog open={openTransactionDialog} onClose={() => setOpenTransactionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Transaction ID</Typography>
                  <Typography variant="body1">{selectedTransaction.id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Razorpay Payment ID</Typography>
                  <Typography variant="body1">{selectedTransaction.razorpay_payment_id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Razorpay Order ID</Typography>
                  <Typography variant="body1">{selectedTransaction.razorpay_order_id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Amount</Typography>
                  <Typography variant="body1">{formatCurrency(selectedTransaction.amount)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Payment Method</Typography>
                  <Typography variant="body1">{selectedTransaction.method || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Chip label={selectedTransaction.status} color={getStatusColor(selectedTransaction.status)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Created At</Typography>
                  <Typography variant="body1">{formatDate(selectedTransaction.created_at)}</Typography>
                </Grid>
                {selectedTransaction.error_description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="error">Error Description</Typography>
                    <Typography variant="body1" color="error">{selectedTransaction.error_description}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTransactionDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderList;
