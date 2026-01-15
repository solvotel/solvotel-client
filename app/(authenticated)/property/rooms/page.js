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
  const data = GetDataList({
    auth,
    endPoint: 'rooms',
  });

  const roomCategories = GetDataList({
    auth,
    endPoint: 'room-categories',
  });

  const [search, setSearch] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData());
  const [formErrors, setFormErrors] = useState({});
  const [editing, setEditing] = useState(false);

  function initialFormData() {
    return {
      room_no: '',
      floor: '',
      category: '',
      hotel_id: auth?.user?.hotel_id || '',
    };
  }

  // ✅ Validation function
  const validateForm = (data) => {
    const errors = {};

    if (!data.room_no?.trim()) errors.room_no = 'Room number is required';
    if (!data.floor?.trim()) errors.floor = 'Floor is required';
    if (!data.category) errors.category = 'Category is required';

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return false;
    }
    return true;
  };

  const isDuplicateName = (room_no, id = null) => {
    if (!data) return false;

    return data.some(
      (item) =>
        item.room_no?.trim().toLowerCase() === room_no.trim().toLowerCase() &&
        item.documentId !== id
    );
  };

  // ✅ Save handler
  const handleSave = async () => {
    if (!validateForm(formData)) {
      ErrorToast('Enter required fields');
      return;
    }

    // 🔍 NEW: Check duplicate category name before save
    const duplicate = isDuplicateName(
      formData.room_no,
      editing ? formData.documentId : null
    );

    if (duplicate) {
      ErrorToast('Room already exists');
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
        endPoint: 'rooms',
        id: formData.documentId,
        payload: {
          data: { ...updateBody, user_updated: auth?.user?.username },
        },
      });
      SuccessToast('Room updated successfully');
    } else {
      await CreateNewData({
        auth,
        endPoint: 'rooms',
        payload: { data: { ...formData, user_created: auth?.user?.username } },
      });
      SuccessToast('Room created successfully');
    }
    setFormOpen(false);
  };

  // Filtered list
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) =>
      item.room_no?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  // Edit room
  const handleEdit = (row) => {
    setEditing(true);
    setFormData({ ...row, category: row?.category?.documentId });
    setFormErrors({});
    setFormOpen(true);
  };

  // Create room
  const handleCreate = () => {
    setEditing(false);
    setFormData(initialFormData());
    setFormErrors({});
    setFormOpen(true);
  };

  // Delete handlers
  const handleDeleteClick = (row) => {
    setSelectedRow(row);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    await DeleteData({
      auth,
      endPoint: 'rooms',
      id: selectedRow.documentId,
    });
    SuccessToast('Room deleted successfully');
    setDeleteOpen(false);
    setSelectedRow(null);
  };

  const handleCancelDelete = () => {
    setDeleteOpen(false);
    setSelectedRow(null);
  };

  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">Rooms</Typography>
        </Breadcrumbs>
      </Box>

      {!data || !roomCategories ? (
        <Loader />
      ) : (
        <Box p={3}>
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <TextField
              size="small"
              label="Search by Room No"
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
              Create New Room
            </Button>
          </Box>

          {/* Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  {[
                    'Room No',
                    'Floor',
                    'Category',
                    'HSN/SAC',
                    'Tariff',
                    'GST (%)',
                    'Total',
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
                    <TableCell>{row.room_no}</TableCell>
                    <TableCell>{row.floor}</TableCell>
                    <TableCell>{row.category?.name}</TableCell>
                    <TableCell>{row.category?.hsn}</TableCell>
                    <TableCell>{row.category?.tariff}</TableCell>
                    <TableCell>{row.category?.gst}</TableCell>
                    <TableCell>{row.category?.total}</TableCell>
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
                    <TableCell colSpan={8} align="center">
                      No room found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Delete Dialog */}
          <Dialog
            open={deleteOpen}
            onClose={handleCancelDelete}
            aria-labelledby="delete-dialog-title"
          >
            <DialogTitle id="delete-dialog-title">Delete Room</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete{' '}
                <strong>{selectedRow?.room_no}</strong>? This action cannot be
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
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>{editing ? 'Edit Room' : 'Create Room'}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Room No"
                    fullWidth
                    value={formData.room_no}
                    onChange={(e) =>
                      setFormData({ ...formData, room_no: e.target.value })
                    }
                    error={!!formErrors.room_no}
                    helperText={formErrors.room_no}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Floor"
                    fullWidth
                    value={formData.floor}
                    onChange={(e) =>
                      setFormData({ ...formData, floor: e.target.value })
                    }
                    error={!!formErrors.floor}
                    helperText={formErrors.floor}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    select
                    margin="dense"
                    label="Room Category"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    error={!!formErrors.category}
                    helperText={formErrors.category}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="">-- Select Category --</option>
                    {roomCategories?.map((cat) => (
                      <option key={cat.documentId} value={cat.documentId}>
                        {cat?.name}
                      </option>
                    ))}
                  </TextField>
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
