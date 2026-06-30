'use client';

import { useAuth } from '@/context';
import {
  DeleteData,
  GetDataList,
  CreateNewData,
  UpdateData,
  GetPosDataList,
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
import { CheckUserPermission } from '@/utils/UserPermissions';

const Page = () => {
  const { auth } = useAuth();
  const permissions = CheckUserPermission(auth?.user?.permissions);
  const data = GetPosDataList({
    id: auth?.user?.pos_outlet_id,
    endPoint: 'pos-items',
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
      rate: null,
      cgst: null,
      sgst: null,
      total: null,
      pos_outlet_id: auth?.user?.pos_outlet_id || '',
    };
  }

  // filter data by item
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) =>
      item.item?.toLowerCase().includes(search.toLowerCase()),
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

  const validateForm = (formData, allData, isEditing) => {
    const errors = {};

    if (!formData.item?.trim()) errors.item = 'Name is required';

    // Check for duplicate item name
    if (formData.item?.trim()) {
      const isDuplicate = allData?.some(
        (item) =>
          item.item?.toLowerCase() === formData.item.toLowerCase() &&
          (!isEditing || item.documentId !== formData.documentId),
      );
      if (isDuplicate) {
        errors.item = 'An item with this name already exists';
      }
    }

    if (!formData.rate || Number(formData.rate) <= 0)
      errors.rate = 'Enter a valid rate';
    if (formData.cgst === '' || Number(formData.cgst) < 0)
      errors.cgst = 'Enter a valid CGST (%)';
    if (formData.sgst === '' || Number(formData.sgst) < 0)
      errors.sgst = 'Enter a valid SGST (%)';

    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm(formData, data, editing);
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
        endPoint: 'pos-items',
        id: formData.documentId,
        payload: {
          data: { ...updateBody, user_updated: auth?.user?.username },
        },
      });
      SuccessToast('Menu Item updated successfully');
    } else {
      await CreateNewData({
        auth,
        endPoint: 'pos-items',
        payload: {
          data: { ...formData, user_created: auth?.user?.username },
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
      endPoint: 'pos-items',
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
          <Link underline="hover" color="inherit" href="/pos-outlet/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">Manage Items</Typography>
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
              disabled={!permissions.canCreate}
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
                    'CGST (%)',
                    'SGST (%)',
                    'Amount',
                    'Created By',
                    'Updated By',
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
                    <TableCell>{row.category || 'NA'}</TableCell>
                    <TableCell>{row.segment || 'NA'}</TableCell>
                    <TableCell>{row.hsn || 'NA'}</TableCell>
                    <TableCell>{row.rate || 0}</TableCell>
                    <TableCell>{row.cgst || 0}</TableCell>
                    <TableCell>{row.sgst || 0}</TableCell>
                    <TableCell>{row.total || 0}</TableCell>
                    <TableCell>{row.user_created}</TableCell>
                    <TableCell>{row.user_updated}</TableCell>
                    <TableCell sx={{ width: '100px' }}>
                      <Tooltip title="Edit">
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(row)}
                          size="small"
                          disabled={!permissions.canUpdate}
                        >
                          <EditIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(row)}
                          size="small"
                          disabled={!permissions.canDelete}
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} align="center">
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
            <DialogTitle>{editing ? 'Edit Item' : 'Create Item'}</DialogTitle>
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
                <Grid size={{ xs: 12, sm: 4 }}>
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
                <Grid size={{ xs: 12, sm: 4 }}>
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
                    fullWidth
                    value={formData.rate ?? ''}
                    inputProps={{ inputMode: 'decimal' }}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (/^\d*\.?\d*$/.test(value)) {
                        const rate = value === '' ? '' : parseFloat(value);
                        const cgst = parseFloat(formData.cgst) || 0;
                        const sgst = parseFloat(formData.sgst) || 0;

                        setFormData({
                          ...formData,
                          rate,
                          total: rate ? rate + (rate * (cgst + sgst)) / 100 : 0,
                        });
                      }
                    }}
                    error={!!formErrors.rate}
                    helperText={formErrors.rate}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    margin="dense"
                    label="CGST (%)"
                    fullWidth
                    value={formData.cgst ?? ''}
                    inputProps={{ inputMode: 'decimal' }}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (/^\d*\.?\d*$/.test(value)) {
                        const cgst = value === '' ? '' : parseFloat(value);
                        const rate = parseFloat(formData.rate) || 0;
                        const sgst = parseFloat(formData.sgst) || 0;

                        setFormData({
                          ...formData,
                          cgst,
                          total: rate
                            ? rate +
                              (rate * ((parseFloat(cgst) || 0) + sgst)) / 100
                            : 0,
                        });
                      }
                    }}
                    error={!!formErrors.cgst}
                    helperText={formErrors.cgst}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    margin="dense"
                    label="SGST (%)"
                    fullWidth
                    value={formData.sgst ?? ''}
                    inputProps={{ inputMode: 'decimal' }}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (/^\d*\.?\d*$/.test(value)) {
                        const sgst = value === '' ? '' : parseFloat(value);
                        const rate = parseFloat(formData.rate) || 0;
                        const cgst = parseFloat(formData.cgst) || 0;

                        setFormData({
                          ...formData,
                          sgst,
                          total: rate
                            ? rate +
                              (rate * (cgst + (parseFloat(sgst) || 0))) / 100
                            : 0,
                        });
                      }
                    }}
                    error={!!formErrors.sgst}
                    helperText={formErrors.sgst}
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
