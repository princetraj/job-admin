import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  People,
  Business,
  Work,
  Description,
  LocalOffer,
  AttachMoney
} from '@mui/icons-material';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';

const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: 2,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { isSuperAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getDashboardStats();
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Employees"
            value={stats?.total_employees || 0}
            icon={<People sx={{ fontSize: 40, color: 'white' }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Employers"
            value={stats?.total_employers || 0}
            icon={<Business sx={{ fontSize: 40, color: 'white' }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Jobs"
            value={stats?.total_jobs || 0}
            icon={<Work sx={{ fontSize: 40, color: 'white' }} />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Jobs"
            value={stats?.active_jobs || 0}
            icon={<Work sx={{ fontSize: 40, color: 'white' }} />}
            color="#0288d1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Applications"
            value={stats?.total_applications || 0}
            icon={<Description sx={{ fontSize: 40, color: 'white' }} />}
            color="#7b1fa2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pending CV Requests"
            value={stats?.pending_cv_requests || 0}
            icon={<Description sx={{ fontSize: 40, color: 'white' }} />}
            color="#c62828"
          />
        </Grid>
        {isSuperAdmin() && (
          <>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Total Commissions"
                value={`$${stats?.total_commissions || '0.00'}`}
                icon={<AttachMoney sx={{ fontSize: 40, color: 'white' }} />}
                color="#388e3c"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Total Coupons"
                value={stats?.total_coupons || 0}
                icon={<LocalOffer sx={{ fontSize: 40, color: 'white' }} />}
                color="#f57c00"
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
