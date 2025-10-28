import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  TextField,
  MenuItem,
  Button,
  Chip,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import dayjs from 'dayjs';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

const CommissionList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { isSuperAdmin, hasRole } = useAuth();
  const [tab, setTab] = useState(0);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [staffList, setStaffList] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 25,
    total: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    staff_id: '',
    type: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchCommissions();
  }, [tab, pagination.page, pagination.pageSize]);

  const fetchCommissions = async (appliedFilters = filters) => {
    setLoading(true);
    try {
      let response;
      const params = {
        page: pagination.page + 1,
        per_page: pagination.pageSize,
        ...appliedFilters,
      };

      // Super admin sees all commissions
      if (tab === 0 && isSuperAdmin()) {
        response = await adminService.getAllCommissions(params);
      }
      // Manager sees their own and their staff's commissions
      else if (tab === 0 && hasRole('manager')) {
        response = await adminService.getManagerCommissions(params);
      }
      // Staff sees only their own commissions
      else {
        response = await adminService.getMyCommissions();
      }

      let commissionsData;
      if (response.data.commissions?.data) {
        commissionsData = response.data.commissions.data;
        setPagination((prev) => ({
          ...prev,
          total: response.data.commissions.total || commissionsData.length,
        }));
      } else {
        commissionsData = response.data.commissions || [];
        setPagination((prev) => ({
          ...prev,
          total: commissionsData.length,
        }));
      }

      setCommissions(Array.isArray(commissionsData) ? commissionsData : []);
      setTotalEarnings(response.data.total_earnings || response.data.total_earned || 0);

      // Set staff list for managers
      if (response.data.staff_list) {
        setStaffList(response.data.staff_list);
      }
    } catch (error) {
      console.error('Error fetching commissions:', error);
      enqueueSnackbar('Failed to load commissions', { variant: 'error' });
      setCommissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 0 }));
    fetchCommissions(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      staff_id: '',
      type: '',
      start_date: '',
      end_date: '',
    };
    setFilters(clearedFilters);
    setPagination((prev) => ({ ...prev, page: 0 }));
    fetchCommissions(clearedFilters);
  };

  const columns = [
    ...(tab === 0 && (isSuperAdmin() || hasRole('manager'))
      ? [
          {
            field: 'staff_name',
            headerName: 'Staff Name',
            flex: 1,
            valueGetter: (value, row) => row?.staff?.name || 'N/A',
          },
        ]
      : []),
    {
      field: 'amount_earned',
      headerName: 'Commission',
      width: 120,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 'bold', color: 'success.main' }}>
          ₹{Number(params.value || 0).toFixed(2)}
        </Typography>
      ),
    },
    {
      field: 'transaction_amount',
      headerName: 'Transaction Amount',
      width: 150,
      renderCell: (params) => `₹${Number(params.value || 0).toFixed(2)}`,
    },
    {
      field: 'discount_amount',
      headerName: 'Discount Amount',
      width: 140,
      renderCell: (params) => `₹${Number(params.value || 0).toFixed(2)}`,
    },
    {
      field: 'discount_percentage',
      headerName: 'Discount %',
      width: 120,
      renderCell: (params) => `${Number(params.value || 0).toFixed(2)}%`,
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value === 'coupon_based' ? 'Coupon' : 'Manual'}
          color={params.value === 'coupon_based' ? 'primary' : 'secondary'}
          size="small"
        />
      ),
    },
    {
      field: 'coupon_code',
      headerName: 'Coupon Code',
      width: 130,
      valueGetter: (value, row) => row?.coupon?.code || '-',
    },
    {
      field: 'created_at',
      headerName: 'Date',
      width: 160,
      valueFormatter: (value) => dayjs(value).format('MMM D, YYYY HH:mm'),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Commission Management
      </Typography>

      {/* Summary Card */}
      <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <CardContent>
          <Typography variant="h6">Total Earnings</Typography>
          <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
            ₹{typeof totalEarnings === 'number' ? totalEarnings.toFixed(2) : '0.00'}
          </Typography>
        </CardContent>
      </Card>

      {/* Tabs for Super Admin and Manager */}
      {(isSuperAdmin() || hasRole('manager')) && (
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label={isSuperAdmin() ? 'All Commissions' : 'Team Commissions'} />
          <Tab label="My Commissions" />
        </Tabs>
      )}

      {/* Filters Section - Only show for "All Commissions" or "Team Commissions" tab */}
      {tab === 0 && (isSuperAdmin() || hasRole('manager')) && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Filters</Typography>
          </Box>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {hasRole('manager') && staffList.length > 0 && (
                <TextField
                  select
                  label="Staff Member"
                  value={filters.staff_id}
                  onChange={(e) => handleFilterChange('staff_id', e.target.value)}
                  size="small"
                  sx={{ minWidth: 200, flex: '1 1 200px' }}
                >
                  <MenuItem value="">All Staff</MenuItem>
                  {staffList.map((staff) => (
                    <MenuItem key={staff.id} value={staff.id}>
                      {staff.name} ({staff.role})
                    </MenuItem>
                  ))}
                </TextField>
              )}
              <TextField
                select
                label="Type"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                size="small"
                sx={{ minWidth: 200, flex: '1 1 200px' }}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="coupon_based">Coupon Based</MenuItem>
                <MenuItem value="manual">Manual</MenuItem>
              </TextField>
              <TextField
                label="Start Date"
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 200, flex: '1 1 200px' }}
              />
              <TextField
                label="End Date"
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 200, flex: '1 1 200px' }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<FilterListIcon />}
                onClick={handleApplyFilters}
              >
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Data Grid */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={commissions}
          columns={columns}
          loading={loading}
          pagination
          paginationMode="server"
          rowCount={pagination.total}
          page={pagination.page}
          pageSize={pagination.pageSize}
          onPageChange={(newPage) =>
            setPagination((prev) => ({ ...prev, page: newPage }))
          }
          onPageSizeChange={(newPageSize) =>
            setPagination((prev) => ({ ...prev, pageSize: newPageSize }))
          }
          rowsPerPageOptions={[10, 25, 50, 100]}
          disableSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default CommissionList;
