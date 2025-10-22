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
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { Add, Star, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { adminService } from '../../services/adminService';

const PlanList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'employee',
    price: '',
    validity_days: '',
    is_default: false,
    // Employee features
    jobs_can_apply: 5,
    contact_details_can_view: 3,
    whatsapp_alerts: false,
    sms_alerts: false,
    employer_can_view_contact_free: false,
    // Employer features
    jobs_can_post: 5,
    employee_contact_details_can_view: 10,
    features: [{ feature_name: '', feature_value: '' }]
  });

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'employee',
      price: '',
      validity_days: '',
      is_default: false,
      // Employee features
      jobs_can_apply: 5,
      contact_details_can_view: 3,
      whatsapp_alerts: false,
      sms_alerts: false,
      employer_can_view_contact_free: false,
      // Employer features
      jobs_can_post: 5,
      employee_contact_details_can_view: 10,
      features: [{ feature_name: '', feature_value: '' }]
    });
    setEditingPlan(null);
  };

  const handleOpenDialog = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description,
        type: plan.type,
        price: plan.price,
        validity_days: plan.validity_days,
        is_default: plan.is_default || false,
        // Employee features
        jobs_can_apply: plan.jobs_can_apply ?? 5,
        contact_details_can_view: plan.contact_details_can_view ?? 3,
        whatsapp_alerts: plan.whatsapp_alerts || false,
        sms_alerts: plan.sms_alerts || false,
        employer_can_view_contact_free: plan.employer_can_view_contact_free || false,
        // Employer features
        jobs_can_post: plan.jobs_can_post ?? 5,
        employee_contact_details_can_view: plan.employee_contact_details_can_view ?? 10,
        features: plan.features && plan.features.length > 0
          ? plan.features.map(f => ({ feature_name: f.feature_name, feature_value: f.feature_value }))
          : [{ feature_name: '', feature_value: '' }]
      });
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle different input types
    let finalValue = value;

    if (type === 'checkbox') {
      finalValue = checked;
    } else if (name === 'is_default') {
      // Ensure boolean value for is_default
      finalValue = value === true || value === 'true' || value === 1;
      console.log('is_default changed:', { originalValue: value, finalValue });
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleFeatureChange = (index, field, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index][field] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { feature_name: '', feature_value: '' }]
    }));
  };

  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, features: newFeatures }));
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate
      if (!formData.name || !formData.description || !formData.price || !formData.validity_days) {
        enqueueSnackbar('Please fill all required fields', { variant: 'error' });
        return;
      }

      // Filter out empty features
      const validFeatures = formData.features.filter(
        f => f.feature_name.trim() && f.feature_value.trim()
      );

      const data = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        price: parseFloat(formData.price),
        validity_days: parseInt(formData.validity_days),
        is_default: formData.is_default,
        features: validFeatures
      };

      // Add employee-specific features
      if (formData.type === 'employee') {
        data.jobs_can_apply = parseInt(formData.jobs_can_apply);
        data.contact_details_can_view = parseInt(formData.contact_details_can_view);
        data.whatsapp_alerts = formData.whatsapp_alerts;
        data.sms_alerts = formData.sms_alerts;
        data.employer_can_view_contact_free = formData.employer_can_view_contact_free;
      }

      // Add employer-specific features
      if (formData.type === 'employer') {
        data.jobs_can_post = parseInt(formData.jobs_can_post);
        data.employee_contact_details_can_view = parseInt(formData.employee_contact_details_can_view);
      }

      if (editingPlan) {
        await adminService.updatePlan(editingPlan.id, data);
        enqueueSnackbar('Plan updated successfully', { variant: 'success' });
      } else {
        await adminService.createPlan(data);
        enqueueSnackbar('Plan created successfully', { variant: 'success' });
      }

      handleCloseDialog();
      fetchPlans();
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to save plan',
        { variant: 'error' }
      );
    }
  };

  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminService.deletePlan(planToDelete.id);
      enqueueSnackbar('Plan deleted successfully', { variant: 'success' });
      setDeleteConfirmOpen(false);
      setPlanToDelete(null);
      fetchPlans();
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to delete plan',
        { variant: 'error' }
      );
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setPlanToDelete(null);
  };

  const filteredPlans = plans.filter(plan => {
    if (tabValue === 0) return true; // All plans
    if (tabValue === 1) return plan.type === 'employee';
    if (tabValue === 2) return plan.type === 'employer';
    return true;
  });

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Plan Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Add Plan
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All Plans" />
          <Tab label="Employee Plans" />
          <Tab label="Employer Plans" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {filteredPlans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {plan.is_default && (
                <Badge
                  badgeContent={<Star fontSize="small" />}
                  color="warning"
                  sx={{ position: 'absolute', top: 16, right: 16 }}
                >
                  <Chip label="DEFAULT" color="warning" size="small" />
                </Badge>
              )}

              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h5" gutterBottom>{plan.name}</Typography>
                  <Chip
                    label={plan.type}
                    color={plan.type === 'employee' ? 'primary' : 'secondary'}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                </Box>

                <Typography variant="h3" color="primary" sx={{ mb: 1 }}>
                  ${plan.price}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {plan.validity_days} days validity
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {plan.description}
                </Typography>

                {/* Display Employee Plan Features */}
                {plan.type === 'employee' && (
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Plan Limits:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      📋 Job Applications: <strong>{plan.jobs_can_apply === -1 ? 'Unlimited' : plan.jobs_can_apply}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      👁️ Contact Views: <strong>{plan.contact_details_can_view === -1 ? 'Unlimited' : plan.contact_details_can_view}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      💬 WhatsApp Alerts: <strong>{plan.whatsapp_alerts ? '✓ Enabled' : '✗ Disabled'}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      📱 SMS Alerts: <strong>{plan.sms_alerts ? '✓ Enabled' : '✗ Disabled'}</strong>
                    </Typography>
                    <Typography variant="body2">
                      🆓 Employer Free Contact View: <strong>{plan.employer_can_view_contact_free ? '✓ Enabled' : '✗ Disabled'}</strong>
                    </Typography>
                  </Box>
                )}

                {/* Display Employer Plan Features */}
                {plan.type === 'employer' && (
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="secondary" gutterBottom>
                      Plan Limits:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      📝 Job Posts: <strong>{plan.jobs_can_post === -1 ? 'Unlimited' : plan.jobs_can_post}</strong>
                    </Typography>
                    <Typography variant="body2">
                      👥 Employee Contact Views: <strong>{plan.employee_contact_details_can_view === -1 ? 'Unlimited' : plan.employee_contact_details_can_view}</strong>
                    </Typography>
                  </Box>
                )}

                {plan.features && plan.features.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Features:
                    </Typography>
                    <List dense>
                      {plan.features.slice(0, 3).map((feature) => (
                        <ListItem key={feature.id} disableGutters>
                          <ListItemText
                            primary={feature.feature_name}
                            secondary={feature.feature_value}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      ))}
                      {plan.features.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                          +{plan.features.length - 3} more features
                        </Typography>
                      )}
                    </List>
                  </>
                )}
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(plan)}
                  >
                    Edit
                  </Button>
                  {!plan.is_default && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      sx={{ ml: 1 }}
                      onClick={() => handleDeleteClick(plan)}
                    >
                      Delete
                    </Button>
                  )}
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredPlans.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary">
            No plans found
          </Typography>
        </Box>
      )}

      {/* Create/Edit Plan Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingPlan ? 'Edit Plan' : 'Create New Plan'}
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Plan Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Plan Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Plan Type"
                >
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="employer">Employer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price ($)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Validity Days"
                name="validity_days"
                type="number"
                value={formData.validity_days}
                onChange={handleInputChange}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Is Default Plan?</InputLabel>
                <Select
                  name="is_default"
                  value={formData.is_default}
                  onChange={handleInputChange}
                  label="Is Default Plan?"
                >
                  <MenuItem value={false}>No</MenuItem>
                  <MenuItem value={true}>Yes</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Current: {formData.is_default ? 'Yes (Default)' : 'No (Regular)'}
              </Typography>
            </Grid>

            {/* Employee Plan Features */}
            {formData.type === 'employee' && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }}>
                    <Chip label="Employee Plan Features" color="primary" />
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Jobs Can Apply"
                    name="jobs_can_apply"
                    type="number"
                    value={formData.jobs_can_apply}
                    onChange={handleInputChange}
                    required
                    inputProps={{ min: -1 }}
                    helperText="Use -1 for unlimited jobs"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Details Can View"
                    name="contact_details_can_view"
                    type="number"
                    value={formData.contact_details_can_view}
                    onChange={handleInputChange}
                    required
                    inputProps={{ min: -1 }}
                    helperText="Use -1 for unlimited contact views"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>WhatsApp Alerts</InputLabel>
                    <Select
                      name="whatsapp_alerts"
                      value={formData.whatsapp_alerts}
                      onChange={handleInputChange}
                      label="WhatsApp Alerts"
                    >
                      <MenuItem value={false}>Disabled</MenuItem>
                      <MenuItem value={true}>Enabled</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Get job alerts via WhatsApp
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>SMS/Text Alerts</InputLabel>
                    <Select
                      name="sms_alerts"
                      value={formData.sms_alerts}
                      onChange={handleInputChange}
                      label="SMS/Text Alerts"
                    >
                      <MenuItem value={false}>Disabled</MenuItem>
                      <MenuItem value={true}>Enabled</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Get job alerts via SMS/Text
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Employer Can View Contact Free</InputLabel>
                    <Select
                      name="employer_can_view_contact_free"
                      value={formData.employer_can_view_contact_free}
                      onChange={handleInputChange}
                      label="Employer Can View Contact Free"
                    >
                      <MenuItem value={false}>Disabled</MenuItem>
                      <MenuItem value={true}>Enabled</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Employers can view contact details without consuming their limit
                  </Typography>
                </Grid>
              </>
            )}

            {/* Employer Plan Features */}
            {formData.type === 'employer' && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }}>
                    <Chip label="Employer Plan Features" color="secondary" />
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Jobs Can Post"
                    name="jobs_can_post"
                    type="number"
                    value={formData.jobs_can_post}
                    onChange={handleInputChange}
                    required
                    inputProps={{ min: -1 }}
                    helperText="Use -1 for unlimited job posts"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee Contact Details Can View"
                    name="employee_contact_details_can_view"
                    type="number"
                    value={formData.employee_contact_details_can_view}
                    onChange={handleInputChange}
                    required
                    inputProps={{ min: -1 }}
                    helperText="Use -1 for unlimited employee contact views"
                  />
                </Grid>
              </>
            )}

            {/* Features Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Features</Typography>
                <Button size="small" onClick={addFeature} variant="outlined">
                  + Add Feature
                </Button>
              </Box>
              {formData.features.map((feature, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="Feature Name"
                        value={feature.feature_name}
                        onChange={(e) => handleFeatureChange(index, 'feature_name', e.target.value)}
                        placeholder="e.g., Job Applications"
                      />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="Feature Value"
                        value={feature.feature_value}
                        onChange={(e) => handleFeatureChange(index, 'feature_value', e.target.value)}
                        placeholder="e.g., 5 per month"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
                      {formData.features.length > 1 && (
                        <Button
                          color="error"
                          onClick={() => removeFeature(index)}
                          fullWidth
                        >
                          Remove
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPlan ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the plan "{planToDelete?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlanList;
