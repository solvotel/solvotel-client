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
    endPoint: 'inventory-items',
  });
  const categoryList = GetDataList({
    auth,
    endPoint: 'inventory-categories',
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
      code: '',
      group: '',
      name: '',
      auditable: '',
      tax: '',
      unit: 'Pcs',
      category: null,
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
    setFormData({ ...row, category: row.category.documentId });
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
        endPoint: 'inventory-items',
        id: formData.documentId,
        payload: {
          data: updateBody,
        },
      });
      SuccessToast('Category updated successfully');
    } else {
      await CreateNewData({
        auth,
        endPoint: 'inventory-items',
        payload: {
          data: formData,
        },
      });
      SuccessToast('Inventory item created successfully');
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
      endPoint: 'inventory-items',
      id: selectedRow.documentId,
    });
    SuccessToast('Inventory item deleted successfully');
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
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Typography color="text.primary">Inventory Item</Typography>
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
                    'Code',
                    'Name',
                    'category',
                    'Unit',
                    'group',
                    'Auditable',
                    'Gst',

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
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.category?.name}</TableCell>
                    <TableCell>{row.unit}</TableCell>
                    <TableCell>{row.group}</TableCell>
                    <TableCell>{row.auditable}</TableCell>
                    <TableCell>{row.tax}</TableCell>
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
                      No inventory categories found
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
            <DialogTitle id="delete-dialog-title">
              Delete Inventory Item
            </DialogTitle>
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
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {editing ? 'Edit Inventory Item' : 'Create Inventory Item'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {/* Code */}
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

                {/* Name */}
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

                {/* Category */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    margin="dense"
                    label="Category"
                    fullWidth
                    value={formData.category || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, category: e.target.value });
                    }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="">-- Select Category --</option>
                    {categoryList?.map((cat) => (
                      <option key={cat.documentId} value={cat.documentId}>
                        {cat?.name}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                {/* Group */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Group"
                    fullWidth
                    value={formData.group}
                    onChange={(e) =>
                      setFormData({ ...formData, group: e.target.value })
                    }
                  />
                </Grid>

                {/* Unit */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    margin="dense"
                    label="Unit"
                    fullWidth
                    value={formData.unit || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, unit: e.target.value });
                    }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="">-- Select Unit --</option>
                    {['Pcs', 'Kg', 'Gm']?.map((item, index) => (
                      <option key={index} value={item}>
                        {item}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                {/* Tax */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    type="number"
                    margin="dense"
                    label="GST (%)"
                    fullWidth
                    value={formData.tax}
                    onChange={(e) =>
                      setFormData({ ...formData, tax: e.target.value })
                    }
                  />
                </Grid>

                {/* Auditable */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={
                          formData.auditable === true ||
                          formData.auditable === 'Yes'
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            auditable: e.target.checked ? 'Yes' : 'No',
                          })
                        }
                      />
                    }
                    label="Auditable"
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
