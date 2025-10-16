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
import { SuccessToast } from '@/utils/GenerateToast';
import { Loader } from '@/component/common';

const Page = () => {
  const { auth } = useAuth();
  const data = GetDataList({
    auth,
    endPoint: 'room-categories',
  });

  const [search, setSearch] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Create/Edit dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData());
  const [editing, setEditing] = useState(false);

  function initialFormData() {
    return {
      name: '',
      description: '',
      bed_type: '',
      hsn: '',
      tariff: 0,
      gst: 0,
      total: 0,
      base_adults: 1,
      base_child: 0,
      max_adults: 1,
      max_child: 0,
      max_capacity: 1,
      extra_adult: 0,
      extra_child: 0,
      ep: 'No',
      ap: 'No',
      cp: 'No',
      cap: 'No',
      booking_engine: 'No',
      conference_room: 'No',
      active: 'Yes',
      hotel_id: auth?.user?.hotel_id || '',
    };
  }

  // filter data by name
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) =>
      item.name?.toLowerCase().includes(search.toLowerCase())
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

  const handleSave = async () => {
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
        endPoint: 'room-categories',
        id: formData.documentId,
        payload: {
          data: updateBody,
        },
      });
      SuccessToast('Category updated successfully');
    } else {
      await CreateNewData({
        auth,
        endPoint: 'room-categories',
        payload: {
          data: formData,
        },
      });
      SuccessToast('Category created successfully');
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
      endPoint: 'room-categories',
      id: selectedRow.documentId,
    });
    SuccessToast('Category deleted successfully');
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
          <Typography color="text.primary">Room Categories</Typography>
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
              Create New Category
            </Button>
          </Box>

          {/* Data Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  {[
                    'Name',
                    'Bead Type',
                    'HSN/SAC',
                    'Tariff',
                    'GST',
                    'Total',
                    'Status',
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
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.bed_type}</TableCell>
                    <TableCell>{row.hsn}</TableCell>
                    <TableCell>{row.tariff}</TableCell>
                    <TableCell>{row.gst}</TableCell>
                    <TableCell>{row.total}</TableCell>
                    <TableCell>
                      {row.active === 'Yes' || row.active === true ? (
                        <Chip label="Active" color="success" size="small" />
                      ) : (
                        <Chip label="Inactive" color="error" size="small" />
                      )}
                    </TableCell>
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
                      No categories found
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
            <DialogTitle id="delete-dialog-title">Delete Category</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete
                <strong>{selectedRow?.name}</strong>? This action cannot be
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
              {editing ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Name"
                    fullWidth
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Bed Type"
                    fullWidth
                    value={formData.bed_type}
                    onChange={(e) =>
                      setFormData({ ...formData, bed_type: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    margin="dense"
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="HSN/SAC"
                    fullWidth
                    value={formData.hsn}
                    onChange={(e) =>
                      setFormData({ ...formData, hsn: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    margin="dense"
                    label="Tariff"
                    type="number"
                    fullWidth
                    value={formData.tariff}
                    onChange={(e) => {
                      const tariff = parseFloat(e.target.value) || 0;
                      const gst = parseFloat(formData.gst) || 0;
                      setFormData({
                        ...formData,
                        tariff,
                        total: tariff + (tariff * gst) / 100,
                      });
                    }}
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
                      const tariff = parseFloat(formData.tariff) || 0;
                      setFormData({
                        ...formData,
                        gst,
                        total: tariff + (tariff * gst) / 100,
                      });
                    }}
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
                {[
                  'ep',
                  'ap',
                  'cp',
                  'cap',
                  'booking_engine',
                  'conference_room',
                  'active',
                ].map((field) => (
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
                ))}
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
