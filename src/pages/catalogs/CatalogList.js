import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
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
  CircularProgress
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { adminService } from '../../services/adminService';

const CatalogList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', state: '', country: '' });

  const catalogTypes = ['industries', 'locations', 'categories'];
  const currentType = catalogTypes[tab];

  useEffect(() => {
    fetchItems();
  }, [tab]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      let response;
      if (currentType === 'industries') response = await adminService.getIndustries();
      else if (currentType === 'locations') response = await adminService.getLocations();
      else response = await adminService.getCategories();

      const itemsData = response.data[currentType] || [];
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (error) {
      enqueueSnackbar(`Failed to load ${currentType}`, { variant: 'error' });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentType === 'industries') await adminService.createIndustry(formData);
      else if (currentType === 'locations') await adminService.createLocation(formData);
      else await adminService.createCategory(formData);
      enqueueSnackbar('Item created successfully', { variant: 'success' });
      setOpenDialog(false);
      fetchItems();
      setFormData({ name: '', state: '', country: '' });
    } catch (error) {
      enqueueSnackbar('Failed to create item', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      if (currentType === 'industries') await adminService.deleteIndustry(id);
      else if (currentType === 'locations') await adminService.deleteLocation(id);
      else await adminService.deleteCategory(id);
      enqueueSnackbar('Item deleted successfully', { variant: 'success' });
      fetchItems();
    } catch (error) {
      enqueueSnackbar('Failed to delete item', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Catalog Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
          Add {currentType.slice(0, -1)}
        </Button>
      </Box>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Industries" />
        <Tab label="Locations" />
        <Tab label="Categories" />
      </Tabs>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                {currentType === 'locations' && (
                  <>
                    <TableCell>State</TableCell>
                    <TableCell>Country</TableCell>
                  </>
                )}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  {currentType === 'locations' && (
                    <>
                      <TableCell>{item.state}</TableCell>
                      <TableCell>{item.country}</TableCell>
                    </>
                  )}
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add {currentType.slice(0, -1)}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            {currentType === 'locations' && (
              <>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  margin="normal"
                  required
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CatalogList;
