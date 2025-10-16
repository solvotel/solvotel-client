'use client';

import { useAuth } from '@/context';
import {
  GetDataList,
  CreateNewData,
  UpdateData,
  DeleteData,
  GetUsers,
  GetUserList,
} from '@/utils/ApiFunctions';
import { SuccessToast } from '@/utils/GenerateToast';
import { Loader } from '@/component/common';

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
  DialogActions,
  DialogContentText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  MenuItem,
  Chip,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useState, useMemo } from 'react';

const Page = () => {
  const { auth } = useAuth();

  const data = GetUserList({
    auth,
  });

  const [search, setSearch] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(initialForm());
  const [errors, setErrors] = useState({});
  const [password, setPassword] = useState('');

  function initialForm() {
    return {
      username: '',
      email: '',
      confirmed: false,
      blocked: false,
      role: 1,
      access: [],
      hotel_id: auth?.user?.hotel_id || '',
    };
  }

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) =>
      item.username?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const handleEdit = (row) => {
    setEditing(true);
    setFormData({
      access: row.access,
      blocked: row.blocked,
      confirmed: row.confirmed,
      hotel_id: row.hotel_id,
      role: row.role.id || 1,
      username: row.username,
      email: row.email,
      id: row.id,
    });
    setFormOpen(true);
    setPassword('');
    setErrors({});
  };

  const handleCreate = () => {
    setEditing(false);
    setFormData(initialForm());
    setPassword('');
    setFormOpen(true);
    setErrors({});
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!password.trim() && !editing)
      newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    if (editing) {
      let data = {
        access: formData.access,
        blocked: formData.blocked,
        confirmed: formData.confirmed,
        hotel_id: formData.hotel_id,
        role: formData.role,
        username: formData.username,
      };
      if (password) {
        data = {
          ...data,
          password: password,
        };
      }

      await UpdateData({
        auth,
        endPoint: 'users',
        id: formData.id,
        payload: data,
      });
      SuccessToast('User updated successfully');
    } else {
      await CreateNewData({
        auth,
        endPoint: 'users',
        payload: { ...formData, password: password },
      });
      SuccessToast('User created successfully');
    }
    setFormOpen(false);
    setFormData(initialForm());
    setPassword('');
  };

  const handleDeleteClick = (row) => {
    setSelectedRow(row);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    await DeleteData({
      auth,
      endPoint: 'users',
      id: selectedRow.id,
    });
    SuccessToast('User deleted successfully');
    setDeleteOpen(false);
    setSelectedRow(null);
  };

  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Typography color="text.primary">Users</Typography>
        </Breadcrumbs>
      </Box>

      {!data ? (
        <Loader />
      ) : (
        <Box p={3}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" mb={2}>
            <TextField
              size="small"
              label="Search by Username"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              sx={{ borderRadius: 2 }}
            >
              Create New
            </Button>
          </Box>

          {/* Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  {[
                    'Username',
                    'Email',
                    'Role',
                    'Access',
                    'Status',
                    'Actions',
                  ].map((h) => (
                    <TableCell
                      key={h}
                      sx={{ fontWeight: 'bold' }}
                      align={h === 'Access' ? 'center' : 'left'}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData?.map((row) => (
                  <TableRow key={row.documentId}>
                    <TableCell>{row.username}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>
                      {row.role?.name === 'hotel-admin'
                        ? 'Hotel Admin'
                        : 'Employee'}
                    </TableCell>
                    <TableCell width={300} align="center">
                      {row.role?.name === 'hotel-admin' ? (
                        <Chip
                          label="Full Access"
                          variant="contained"
                          size="small"
                          sx={{
                            m: 0.5,
                            fontSize: '0.7rem',
                            color: 'black',
                            height: 20,
                            '& .MuiChip-label': {
                              px: 0.5,
                              py: 0.5,
                            },
                          }}
                        />
                      ) : (
                        <>
                          {row.access.map((acc, index) => (
                            <Chip
                              key={index}
                              label={acc}
                              variant="contained"
                              size="small"
                              sx={{
                                m: 0.5,
                                fontSize: '0.7rem',
                                color: 'black',
                                height: 20,
                                '& .MuiChip-label': {
                                  textTransform: 'capitalize',
                                  p: 0.5,
                                },
                              }}
                            />
                          ))}
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.confirmed ? (
                        <Chip label="Active" color="success" size="small" />
                      ) : (
                        <Chip label="Deactive" color="error" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
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
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Delete Dialog */}
          <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
            <DialogTitle>Delete User</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete{' '}
                <strong>{selectedRow?.username}</strong>?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
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
            <DialogTitle>{editing ? 'Edit User' : 'Create User'}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    error={!!errors.username}
                    helperText={errors.username}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    select
                    fullWidth
                    label="Access"
                    SelectProps={{ multiple: true }}
                    value={formData.access}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access:
                          typeof e.target.value === 'string'
                            ? e.target.value.split(',')
                            : e.target.value,
                      })
                    }
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="frontoffice">Frontoffice</MenuItem>
                    <MenuItem value="property">Property</MenuItem>
                    <MenuItem value="housekeeping">Housekeeping</MenuItem>
                    <MenuItem value="restaurant">Restaurant</MenuItem>
                    <MenuItem value="inventory">Inventory</MenuItem>
                    <MenuItem value="accounts">Accounts</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Confirmed"
                    value={formData.confirmed}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmed: e.target.value,
                      })
                    }
                  >
                    <MenuItem value={true}>🟢 Active</MenuItem>
                    <MenuItem value={false}>🔴 Deactive</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleSave}>
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
