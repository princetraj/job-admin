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
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { adminService } from '../../services/adminService';
import dayjs from 'dayjs';

const roles = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' }
];

const AdminList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await adminService.getAdmins();
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

  const handleOpenDialog = (admin = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        name: admin.name,
        email: admin.email,
        password: '',
        role: admin.role
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'staff'
      });
    }
    setOpenDialog(true);
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
        <Typography variant="h4">Admin Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Admin
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins.map((admin) => (
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
                <TableCell>{dayjs(admin.created_at).format('MMM D, YYYY')}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog(admin)} size="small">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(admin.id)} size="small" color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={24} /> : editingAdmin ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminList;
