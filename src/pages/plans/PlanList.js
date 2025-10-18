import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { adminService } from '../../services/adminService';

const PlanList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await adminService.getPlans();
      const plansData = response.data.plans || [];
      setPlans(Array.isArray(plansData) ? plansData : []);
    } catch (error) {
      enqueueSnackbar('Failed to load plans', { variant: 'error' });
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Plan Management</Typography>
        <Button variant="contained" startIcon={<Add />}>Add Plan</Button>
      </Box>

      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>{plan.name}</Typography>
                <Chip label={plan.type} color="primary" size="small" sx={{ mb: 1 }} />
                <Typography variant="h4" color="primary">${plan.price}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {plan.validity_days} days validity
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {plan.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Edit</Button>
                <Button size="small" color="error">Delete</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PlanList;
