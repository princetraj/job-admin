import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Grid,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { adminService } from '../services/adminService';

const AddEmployerDialog = ({ open, onClose, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [industries, setIndustries] = useState([]);

  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    contact: '',
    password: '',
    confirmPassword: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    industry_type_id: '',
  });

  useEffect(() => {
    if (open) {
      fetchIndustries();
    }
  }, [open]);

  const fetchIndustries = async () => {
    try {
      const response = await adminService.getIndustries();
      setIndustries(response.data.industries || []);
    } catch (error) {
      console.error('Failed to load industries:', error);
      enqueueSnackbar('Failed to load industries', { variant: 'error' });
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.company_name || !formData.email || !formData.contact || !formData.password || !formData.industry_type_id) {
      enqueueSnackbar('Please fill all required fields', { variant: 'warning' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      enqueueSnackbar('Passwords do not match', { variant: 'error' });
      return;
    }

    if (formData.password.length < 6) {
      enqueueSnackbar('Password must be at least 6 characters', { variant: 'error' });
      return;
    }

    if (!formData.street || !formData.city || !formData.state || !formData.zip || !formData.country) {
      enqueueSnackbar('Please fill all address fields', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const employerData = {
        company_name: formData.company_name,
        email: formData.email,
        contact: formData.contact,
        password: formData.password,
        industry_type_id: formData.industry_type_id,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
        },
      };

      await adminService.addEmployer(employerData);
      enqueueSnackbar('Employer added successfully', { variant: 'success' });
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating employer:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors
        ? JSON.stringify(error.response.data.errors)
        : 'Failed to add employer';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      company_name: '',
      email: '',
      contact: '',
      password: '',
      confirmPassword: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      industry_type_id: '',
    });
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div">
          Add New Employer
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create a new employer account
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ px: 4 }}>
        <Box sx={{ mt: 1 }}>
          {/* Company Information */}
          <Typography variant="h6" sx={{ mb: 2 }}>Company Information</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Company Name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Industry Type</InputLabel>
                <Select
                  value={formData.industry_type_id}
                  onChange={(e) => setFormData({ ...formData, industry_type_id: e.target.value })}
                  label="Industry Type"
                >
                  <MenuItem value="">Select Industry</MenuItem>
                  {industries.map((industry) => (
                    <MenuItem key={industry.id} value={industry.id}>
                      {industry.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Contact Number"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                fullWidth
                required
                placeholder="+1234567890"
              />
            </Grid>
          </Grid>

          {/* Company Address */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Company Address</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Street Address"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="ZIP Code"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                fullWidth
                required
              />
            </Grid>
          </Grid>

          {/* Account Security */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Account Security</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                fullWidth
                required
                helperText="Minimum 6 characters"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                fullWidth
                required
                error={formData.confirmPassword && formData.password !== formData.confirmPassword}
                helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords do not match" : ""}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} size="large" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" size="large" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Create Employer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEmployerDialog;
