import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Alert, CircularProgress } from '@mui/material';
import { adminService } from '../../services/adminService';

const AdminDiagnostic = () => {
  const [profile, setProfile] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await adminService.getProfile();
      setProfile(response.data.admin);
    } catch (error) {
      console.error('Profile fetch error:', error);
      setProfile({ error: error.message });
    }
  };

  const testAdminCreation = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const testAdmin = {
        name: 'Test Staff Diagnostic',
        email: `test_${Date.now()}@test.com`,
        password: 'password123',
        role: 'staff',
      };

      console.log('Attempting to create admin:', testAdmin);
      const response = await adminService.createAdmin(testAdmin);

      setTestResult({
        success: true,
        message: 'Admin created successfully!',
        data: response.data,
      });

      // Delete the test admin
      if (response.data.admin?.id) {
        await adminService.deleteAdmin(response.data.admin.id);
      }
    } catch (error) {
      console.error('Test failed:', error);
      console.error('Error response:', error.response);

      setTestResult({
        success: false,
        message: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors,
        status: error.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Admin Creation Diagnostic
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Current Admin Profile
        </Typography>
        {profile ? (
          <Box>
            {profile.error ? (
              <Alert severity="error">Error: {profile.error}</Alert>
            ) : (
              <>
                <Typography>Name: {profile.name}</Typography>
                <Typography>Email: {profile.email}</Typography>
                <Typography>
                  Role: <strong>{profile.role}</strong>
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  {profile.role === 'super_admin' ? (
                    <Alert severity="success">
                      ✓ You have super_admin role - can create admins
                    </Alert>
                  ) : (
                    <Alert severity="warning">
                      ✗ You don't have super_admin role - cannot create admins
                    </Alert>
                  )}
                </Typography>
              </>
            )}
          </Box>
        ) : (
          <CircularProgress />
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Test Admin Creation
        </Typography>
        <Button
          variant="contained"
          onClick={testAdminCreation}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Test Create Staff Admin'}
        </Button>

        {testResult && (
          <Box sx={{ mt: 2 }}>
            <Alert severity={testResult.success ? 'success' : 'error'}>
              <Typography variant="subtitle1">
                {testResult.success ? '✓ Success' : '✗ Failed'}
              </Typography>
              <Typography>{testResult.message}</Typography>
              {testResult.status && (
                <Typography variant="caption">
                  HTTP Status: {testResult.status}
                </Typography>
              )}
              {testResult.errors && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Validation Errors:</Typography>
                  <pre>{JSON.stringify(testResult.errors, null, 2)}</pre>
                </Box>
              )}
              {testResult.data && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Response Data:</Typography>
                  <pre>{JSON.stringify(testResult.data, null, 2)}</pre>
                </Box>
              )}
            </Alert>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          System Info
        </Typography>
        <Typography>API Base URL: {process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1'}</Typography>
        <Typography>Auth Token: {localStorage.getItem('auth_token') ? 'Present' : 'Missing'}</Typography>
        <Typography>Admin Role (localStorage): {localStorage.getItem('admin_role') || 'Not set'}</Typography>
      </Paper>
    </Box>
  );
};

export default AdminDiagnostic;
