'use client';

import { useAuth } from '@/context';
import {
  DeleteData,
  GetDataList,
  CreateNewData,
  UpdateData,
} from '@/utils/ApiFunctions';
import { useState, useMemo } from 'react';

// mui
import {
  Box,
  Button,
  Breadcrumbs,
  Link,
  Typography,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControlLabel,
  Switch,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';
import { Loader } from '@/component/common';

const Page = () => {
  const { auth } = useAuth();
  const data = GetDataList({
    auth,
    endPoint: 'restaurant-menus',
  });

  const [search, setSearch] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Create/Edit dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData());
  const [editing, setEditing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  function initialFormData() {
    return {
      item: '',
      category: '',
      segment: '',
      code: '',
      hsn: '',
      rate: 0,
      gst: 0,
      total: 0,
      store_code: '',
      ingredient_code: '',
      show_in_profile: 'No',
      is_special: 'No',
      discount_allowed: 'No',
      hotel_id: auth?.user?.hotel_id || '',
    };
  }

  // filter data by item
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) =>
      item.item?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  // handle edit
  const handleEdit = (row) => {
    setEditing(true);
    setFormData(row);
    setFormOpen(true);
  };

  // handle create
  const handleCreate = () => {
    setEditing(false);
    setFormData(initialFormData());
    setFormOpen(true);
  };

  const validateForm = (data) => {
    const errors = {};

    if (!data.item?.trim()) errors.item = 'Name is required';
    if (!data.category?.trim()) errors.category = 'Category is required';
    if (!data.hsn?.trim()) errors.hsn = 'HSN/SAC is required';
    if (!data.rate || data.rate <= 0) errors.rate = 'Enter a valid rate';
    if (data.gst === '' || data.gst < 0) errors.gst = 'Enter a valid GST (%)';

    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      ErrorToast('Please fix the highlighted errors before saving');
      return;
    }
    if (editing) {
      const {
        id,
        documentId,
        publishedAt,
        updatedAt,
        createdAt,
        ...updateBody
      } = formData;

      await UpdateData({
        auth,
        endPoint: 'restaurant-menus',
        id: formData.documentId,
        payload: {
          data: updateBody,
        },
      });
      SuccessToast('Menu Item updated successfully');
    } else {
      await CreateNewData({
        auth,
        endPoint: 'restaurant-menus',
        payload: {
          data: formData,
        },
      });
      SuccessToast('Menu Item created successfully');
    }
    setFormOpen(false);
  };

  // handle delete
  const handleDeleteClick = (row) => {
    setSelectedRow(row);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    await DeleteData({
      auth,
      endPoint: 'restaurant-menus',
      id: selectedRow.documentId,
    });
    SuccessToast('menu item deleted successfully');
    setDeleteOpen(false);
    setSelectedRow(null);
  };

  const handleCancelDelete = () => {
    setDeleteOpen(false);
    setSelectedRow(null);
  };
  if (!data) {
    <Loader />;
  }
  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Typography color="text.primary">Menu Items</Typography>
        </Breadcrumbs>
      </Box>
      {!data ? (
        <Loader />
      ) : (
        <Box p={3}>
          {/* Header Section */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <TextField
              size="small"
              label="Search by Name"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2, textTransform: 'none' }}
              onClick={handleCreate}
            >
              Create New
            </Button>
          </Box>

          {/* Data Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  {[
                    'Name',
                    'Category',
                    'Segment',
                    'HSN/SAC',
                    'Rate',
                    'SGST (%)',
                    'CGST (%)',
                    'Amount',
                    'Actions',
                  ].map((item, index) => (
                    <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                      {item}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData?.map((row) => (
                  <TableRow key={row.documentId}>
                    <TableCell>{row.item}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.segment}</TableCell>
                    <TableCell>{row.hsn}</TableCell>
                    <TableCell>{row.rate / 2}</TableCell>
                    <TableCell>{row.rate / 2}</TableCell>
                    <TableCell>{row.gst}</TableCell>
                    <TableCell>{row.total}</TableCell>
                    <TableCell sx={{ width: '100px' }}>
                      <Tooltip title="Edit">
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(row)}
                          size="small"
                        >
                          <EditIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(row)}
                          size="small"
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No menu item found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteOpen}
            onClose={handleCancelDelete}
            aria-labelledby="delete-dialog-title"
          >
            <DialogTitle id="delete-dialog-title">Delete menu item</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete
                <strong>{selectedRow?.item}</strong>? This action cannot be
                undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelDelete}>Cancel</Button>
              <Button
                onClick={handleConfirmDelete}
                color="error"
                variant="contained"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Create/Edit Dialog */}
          <Dialog
            open={formOpen}
            onClose={() => setFormOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              {editing ? 'Edit Menu Item' : 'Create Menu Item'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Name"
                    fullWidth
                    value={formData.item}
                    onChange={(e) =>
                      setFormData({ ...formData, item: e.target.value })
                    }
                    error={!!formErrors.item}
                    helperText={formErrors.item}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Category"
                    fullWidth
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    error={!!formErrors.category}
                    helperText={formErrors.category}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Segment"
                    fullWidth
                    value={formData.segment}
                    onChange={(e) =>
                      setFormData({ ...formData, segment: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Code"
                    fullWidth
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    margin="dense"
                    label="Store Code"
                    fullWidth
                    value={formData.store_code}
                    onChange={(e) =>
                      setFormData({ ...formData, store_code: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    margin="dense"
                    label="Ingredient Code"
                    fullWidth
                    value={formData.ingredient_code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ingredient_code: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    margin="dense"
                    label="HSN/SAC"
                    fullWidth
                    value={formData.hsn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hsn: e.target.value,
                      })
                    }
                    error={!!formErrors.hsn}
                    helperText={formErrors.hsn}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    margin="dense"
                    label="Rate"
                    type="number"
                    fullWidth
                    value={formData.rate}
                    onChange={(e) => {
                      const rate = parseFloat(e.target.value) || 0;
                      const gst = parseFloat(formData.gst) || 0;
                      setFormData({
                        ...formData,
                        rate,
                        total: rate + (rate * gst) / 100,
                      });
                    }}
                    error={!!formErrors.rate}
                    helperText={formErrors.rate}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    margin="dense"
                    label="GST (%)"
                    type="number"
                    fullWidth
                    value={formData.gst}
                    onChange={(e) => {
                      const gst = parseFloat(e.target.value) || 0;
                      const rate = parseFloat(formData.rate) || 0;
                      setFormData({
                        ...formData,
                        gst,
                        total: rate + (rate * gst) / 100,
                      });
                    }}
                    error={!!formErrors.gst}
                    helperText={formErrors.gst}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    margin="dense"
                    label="Total"
                    type="number"
                    fullWidth
                    value={formData.total}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                {/* Switches */}
                {['show_in_profile', 'is_special', 'discount_allowed'].map(
                  (field) => (
                    <Grid size={{ xs: 12, sm: 4 }} key={field}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={
                              formData[field] === 'Yes' ||
                              formData[field] === true
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [field]: e.target.checked ? 'Yes' : 'No',
                              })
                            }
                          />
                        }
                        label={field.replace('_', ' ').toUpperCase()}
                      />
                    </Grid>
                  )
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} variant="contained">
                {editing ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </>
  );
};

export default Page;
