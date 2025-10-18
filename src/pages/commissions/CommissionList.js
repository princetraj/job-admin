import React, { useEffect, useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import dayjs from 'dayjs';

const CommissionList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { isSuperAdmin } = useAuth();
  const [tab, setTab] = useState(0);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommissions();
  }, [tab]);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const response = tab === 0 && isSuperAdmin()
        ? await adminService.getAllCommissions()
        : await adminService.getMyCommissions();

      let commissionsData;
      if (tab === 0) {
        commissionsData = response.data.commissions.data || response.data.commissions || [];
      } else {
        commissionsData = response.data.commissions || [];
      }
      setCommissions(Array.isArray(commissionsData) ? commissionsData : []);
    } catch (error) {
      enqueueSnackbar('Failed to load commissions', { variant: 'error' });
      setCommissions([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    ...(tab === 0 ? [{ field: 'admin_name', headerName: 'Admin', flex: 1 }] : []),
    { field: 'amount', headerName: 'Amount', width: 120, valueFormatter: (params) => `$${params}` },
    { field: 'type', headerName: 'Type', flex: 1 },
    {
      field: 'created_at',
      headerName: 'Date',
      width: 150,
      valueFormatter: (params) => dayjs(params).format('MMM D, YYYY HH:mm')
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Commission Management</Typography>
      {isSuperAdmin() && (
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="All Commissions" />
          <Tab label="My Commissions" />
        </Tabs>
      )}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid rows={commissions} columns={columns} loading={loading} />
      </Box>
    </Box>
  );
};

export default CommissionList;
