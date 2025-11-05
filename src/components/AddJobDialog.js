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
  CircularProgress,
  Grid,
  Alert,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { adminService } from '../services/adminService';

const AddJobDialog = ({ open, onClose, employer, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    salary: '',
    location_id: '',
    category_id: '',
  });

  useEffect(() => {
    if (open) {
      fetchCatalogs();
      resetForm();
    }
  }, [open]);

  const fetchCatalogs = async () => {
    setLoadingCatalogs(true);
    try {
      const [locationsRes, categoriesRes] = await Promise.all([
        adminService.getLocations(),
        adminService.getCategories(),
      ]);
      setLocations(locationsRes.data.locations || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error('Failed to load catalogs:', error);
      enqueueSnackbar('Failed to load form data', { variant: 'error' });
    } finally {
      setLoadingCatalogs(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      salary: '',
      location_id: '',
      category_id: '',
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.description) {
      enqueueSnackbar('Please fill all required fields', { variant: 'warning' });
      return;
    }

    if (!formData.location_id) {
      enqueueSnackbar('Please select a location', { variant: 'warning' });
      return;
    }

    if (!formData.category_id) {
      enqueueSnackbar('Please select a category', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        salary: formData.salary || undefined,
        location_id: formData.location_id,
        category_id: formData.category_id,
      };

      await adminService.addJobForEmployer(employer.id, jobData);
      enqueueSnackbar('Job created successfully for ' + employer.company_name, { variant: 'success' });
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating job:', error);
      const errorMessage = error.response?.data?.message ||
        (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : 'Failed to create job');
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Calculate job posting info
  const getJobPostingInfo = () => {
    if (!employer || !employer.plan) {
      return { canPost: false, message: 'No plan assigned' };
    }

    const jobsCanPost = employer.plan.jobs_can_post;
    const currentJobs = employer.jobs ? employer.jobs.length : 0;

    if (jobsCanPost === -1) {
      return {
        canPost: true,
        message: `Unlimited job postings (Currently: ${currentJobs} jobs)`,
        color: 'success'
      };
    }

    const remaining = jobsCanPost - currentJobs;
    if (remaining <= 0) {
      return {
        canPost: false,
        message: `Job limit reached (${currentJobs}/${jobsCanPost}). Upgrade plan to post more.`,
        color: 'error'
      };
    }

    return {
      canPost: true,
      message: `${remaining} job posting${remaining !== 1 ? 's' : ''} remaining (${currentJobs}/${jobsCanPost})`,
      color: remaining <= 2 ? 'warning' : 'info'
    };
  };

  const jobPostingInfo = getJobPostingInfo();

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
          Post Job for {employer?.company_name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create a new job posting on behalf of this employer
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ px: 4 }}>
        {loadingCatalogs ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ mt: 1 }}>
            {/* Plan Info Alert */}
            <Alert severity={jobPostingInfo.color} sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Plan: {employer?.plan?.name || 'No Plan'}</strong>
              </Typography>
              <Typography variant="body2">
                {jobPostingInfo.message}
              </Typography>
            </Alert>

            {jobPostingInfo.canPost ? (
              <Grid container spacing={3}>
                {/* Job Title */}
                <Grid item xs={12}>
                  <TextField
                    label="Job Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    fullWidth
                    required
                    placeholder="e.g. Senior Software Engineer"
                  />
                </Grid>

                {/* Job Description */}
                <Grid item xs={12}>
                  <TextField
                    label="Job Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    fullWidth
                    required
                    multiline
                    rows={6}
                    placeholder="Describe the job responsibilities, requirements, qualifications..."
                  />
                </Grid>

                {/* Salary */}
                <Grid item xs={12}>
                  <TextField
                    label="Salary (Optional)"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    fullWidth
                    placeholder="e.g. $80,000 - $120,000 or Competitive"
                    helperText="Enter a salary range or leave blank"
                  />
                </Grid>

                {/* Location */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Location</InputLabel>
                    <Select
                      value={formData.location_id}
                      onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                      label="Location"
                    >
                      <MenuItem value="">Select Location</MenuItem>
                      {locations.map((location) => (
                        <MenuItem key={location.id} value={location.id}>
                          {location.name}, {location.state}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Category */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Job Category</InputLabel>
                    <Select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      label="Job Category"
                    >
                      <MenuItem value="">Select Category</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h6" color="error" gutterBottom>
                  Cannot Create Job
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This employer has reached their job posting limit. Please upgrade their plan first.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} size="large" disabled={loading}>
          Cancel
        </Button>
        {jobPostingInfo.canPost && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            disabled={loading || loadingCatalogs}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Job'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddJobDialog;
