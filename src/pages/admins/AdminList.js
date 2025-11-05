import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Grid
} from '@mui/material';
import { Add, Edit, Delete, PersonAdd } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const roles = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' }
];

const AdminList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { role: currentUserRole } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [assigningStaff, setAssigningStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    manager_id: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [roleFilter, setRoleFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');

  // Check if current user is a manager
  const isManager = currentUserRole === 'manager';
  const isSuperAdmin = currentUserRole === 'super_admin';

  useEffect(() => {
    fetchAdmins();
    fetchManagers();
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [roleFilter, managerFilter]);

  const fetchAdmins = async () => {
    try {
      const params = {};

      // Only apply filters for super admin (backend handles manager filtering automatically)
      if (isSuperAdmin) {
        if (roleFilter) params.role = roleFilter;
        if (managerFilter) params.manager_id = managerFilter;
      }

      const response = await adminService.getAdmins(params);
      // Laravel pagination returns {data: [...], total, per_page, etc}
      const adminsData = response.data.admins.data || response.data.admins;
      setAdmins(Array.isArray(adminsData) ? adminsData : []);
    } catch (error) {
      enqueueSnackbar('Failed to load admins', { variant: 'error' });
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await adminService.getManagers();
      setManagers(response.data.managers || []);
    } catch (error) {
      console.error('Failed to load managers', error);
    }
  };

  const handleOpenDialog = (admin = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        name: admin.name,
        email: admin.email,
        password: '',
        role: admin.role,
        manager_id: admin.manager_id || ''
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'staff',
        manager_id: ''
      });
    }
    setOpenDialog(true);
  };

  const handleOpenAssignDialog = (staff) => {
    setAssigningStaff(staff);
    setFormData({
      ...formData,
      manager_id: staff.manager_id || ''
    });
    setOpenAssignDialog(true);
  };

  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
    setAssigningStaff(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAdmin(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const dataToSubmit = { ...formData };
      if (editingAdmin && !dataToSubmit.password) {
        delete dataToSubmit.password;
      }

      // Only include manager_id for staff role
      if (dataToSubmit.role !== 'staff') {
        delete dataToSubmit.manager_id;
      } else if (dataToSubmit.manager_id === '') {
        dataToSubmit.manager_id = null;
      }

      if (editingAdmin) {
        await adminService.updateAdmin(editingAdmin.id, dataToSubmit);
        enqueueSnackbar('Admin updated successfully', { variant: 'success' });
      } else {
        await adminService.createAdmin(dataToSubmit);
        enqueueSnackbar('Admin created successfully', { variant: 'success' });
      }

      handleCloseDialog();
      fetchAdmins();
    } catch (error) {
      console.error('Admin creation error:', error);
      console.error('Error response:', error.response);

      let message = 'Operation failed';

      if (error.response?.data?.errors) {
        // Validation errors
        const errors = error.response.data.errors;
        message = Object.values(errors).flat().join(', ');
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignManager = async () => {
    if (!assigningStaff) return;

    setSubmitting(true);
    try {
      await adminService.assignStaffToManager(assigningStaff.id, {
        manager_id: formData.manager_id || null
      });
      enqueueSnackbar(
        formData.manager_id
          ? 'Staff assigned to manager successfully'
          : 'Staff unassigned from manager successfully',
        { variant: 'success' }
      );
      handleCloseAssignDialog();
      fetchAdmins();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to assign manager';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) {
      return;
    }

    try {
      await adminService.deleteAdmin(id);
      enqueueSnackbar('Admin deleted successfully', { variant: 'success' });
      fetchAdmins();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete admin';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'error';
      case 'manager': return 'primary';
      case 'staff': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          {isManager ? 'My Staff' : 'Admin Management'}
        </Typography>
        {isSuperAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Admin
          </Button>
        )}
      </Box>

      {/* Filters - Only show for super admin */}
      {isSuperAdmin && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={(roleFilter || managerFilter) ? 5 : 6}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Filter by Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                  sx={{
                    minHeight: 56,
                    '& .MuiSelect-select': {
                      paddingTop: '16.5px',
                      paddingBottom: '16.5px',
                    }
                  }}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={(roleFilter || managerFilter) ? 5 : 6}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Manager</InputLabel>
                <Select
                  value={managerFilter}
                  label="Filter by Manager"
                  onChange={(e) => setManagerFilter(e.target.value)}
                  sx={{
                    minHeight: 56,
                    '& .MuiSelect-select': {
                      paddingTop: '16.5px',
                      paddingBottom: '16.5px',
                    }
                  }}
                >
                  <MenuItem value="">All Managers</MenuItem>
                  {managers.map((manager) => (
                    <MenuItem key={manager.id} value={manager.id}>
                      {manager.name} ({manager.staff_count || 0} staff)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {(roleFilter || managerFilter) && (
              <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  onClick={() => {
                    setRoleFilter('');
                    setManagerFilter('');
                  }}
                  variant="outlined"
                  fullWidth
                  sx={{ height: 56 }}
                >
                  Clear Filters
                </Button>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No admins found
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={admin.role.replace('_', ' ').toUpperCase()}
                      color={getRoleColor(admin.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {admin.role === 'staff' ? (
                      admin.manager ? (
                        <Chip
                          label={admin.manager.name}
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not assigned
                        </Typography>
                      )
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{dayjs(admin.created_at).format('MMM D, YYYY')}</TableCell>
                  <TableCell align="right">
                    {isSuperAdmin && admin.role === 'staff' && (
                      <IconButton
                        onClick={() => handleOpenAssignDialog(admin)}
                        size="small"
                        color="primary"
                        title="Assign Manager"
                      >
                        <PersonAdd />
                      </IconButton>
                    )}
                    {isSuperAdmin && (
                      <>
                        <IconButton onClick={() => handleOpenDialog(admin)} size="small">
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(admin.id)} size="small" color="error">
                          <Delete />
                        </IconButton>
                      </>
                    )}
                    {isManager && (
                      <Typography variant="body2" color="text.secondary">
                        View Only
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Admin Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingAdmin ? 'Edit Admin' : 'Add Admin'}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              disabled={!!editingAdmin}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required={!editingAdmin}
              helperText={editingAdmin ? 'Leave blank to keep current password' : ''}
            />
            <TextField
              fullWidth
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              margin="normal"
              required
            >
              {roles.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            {formData.role === 'staff' && (
              <TextField
                fullWidth
                select
                label="Manager (Optional)"
                name="manager_id"
                value={formData.manager_id}
                onChange={handleChange}
                margin="normal"
              >
                <MenuItem value="">No Manager</MenuItem>
                {managers.map((manager) => (
                  <MenuItem key={manager.id} value={manager.id}>
                    {manager.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={24} /> : editingAdmin ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Assign Manager Dialog */}
      <Dialog open={openAssignDialog} onClose={handleCloseAssignDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign Manager to {assigningStaff?.name}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Manager"
            name="manager_id"
            value={formData.manager_id}
            onChange={handleChange}
            margin="normal"
            helperText="Select a manager or leave empty to unassign"
          >
            <MenuItem value="">No Manager (Unassign)</MenuItem>
            {managers.map((manager) => (
              <MenuItem key={manager.id} value={manager.id}>
                {manager.name} ({manager.staff_count || 0} staff)
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog}>Cancel</Button>
          <Button
            onClick={handleAssignManager}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminList;
