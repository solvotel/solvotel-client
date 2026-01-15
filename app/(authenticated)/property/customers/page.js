'use client';

import { useAuth } from '@/context';
import {
  GetDataList,
  CreateNewData,
  UpdateData,
  DeleteData,
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
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useState, useMemo } from 'react';
import { CheckUserPermission } from '@/utils/UserPermissions';

const Page = () => {
  const { auth } = useAuth();
  const permissions = CheckUserPermission(auth?.user?.permissions);
  const data = GetDataList({
    auth,
    endPoint: 'customers',
  });

  const [search, setSearch] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(initialForm());
  const [errors, setErrors] = useState({});

  function initialForm() {
    return {
      name: '',
      mobile: '',
      email: '',
      address: '',
      dob: null,
      doa: null,
      company_name: '',
      gst_no: '',
      id_type: '',
      id_number: '',
      passport_issue_date: null,
      passport_exp_date: null,
      visa_number: '',
      visa_issue_date: null,
      visa_exp_date: null,
      hotel_id: auth?.user?.hotel_id || '',
    };
  }

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) =>
      item.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const handleEdit = (row) => {
    setEditing(true);
    setFormData({
      ...row,
      passport_issue_date: row.passport_issue_date || null,
      passport_exp_date: row.passport_exp_date || null,
      visa_number: row.visa_number || null,
      visa_issue_date: row.visa_issue_date || null,
      visa_exp_date: row.visa_exp_date || null,
    });
    setFormOpen(true);
    setErrors({});
  };

  const handleCreate = () => {
    setEditing(false);
    setFormData(initialForm());
    setFormOpen(true);
    setErrors({});
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.mobile) newErrors.mobile = 'Mobile is required';
    else if (!/^[0-9]{10}$/.test(formData.mobile))
      newErrors.mobile = 'Enter valid 10-digit number';
    // ✅ Email validation (optional but must be valid if entered)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (formData.id_type === 'Passport') {
      if (!formData.passport_issue_date)
        newErrors.passport_issue_date = 'Passport Issue Date is required';
      if (!formData.passport_exp_date)
        newErrors.passport_exp_date = 'Passport Expiry Date is required';
      if (!formData.visa_number)
        newErrors.visa_number = 'Visa Number is required';
      if (!formData.visa_issue_date)
        newErrors.visa_issue_date = 'Visa Issue Date is required';
      if (!formData.visa_exp_date)
        newErrors.visa_exp_date = 'Visa Expiry Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    if (editing) {
      const { id, documentId, createdAt, updatedAt, publishedAt, ...body } =
        formData;

      await UpdateData({
        auth,
        endPoint: 'customers',
        id: formData.documentId,
        payload: {
          data: { ...body, user_updated: auth?.user?.username },
        },
      });
      SuccessToast('Guest updated successfully');
    } else {
      await CreateNewData({
        auth,
        endPoint: 'customers',
        payload: { data: { ...formData, user_created: auth?.user?.username } },
      });
      SuccessToast('Guest created successfully');
    }
    setFormOpen(false);
    setFormData(initialForm());
  };

  const handleDeleteClick = (row) => {
    setSelectedRow(row);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    await DeleteData({
      auth,
      endPoint: 'customers',
      id: selectedRow.documentId,
    });
    SuccessToast('Guest deleted successfully');
    setDeleteOpen(false);
    setSelectedRow(null);
  };

  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link underline="hover" color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">Guests</Typography>
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
              label="Search by Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              sx={{ borderRadius: 2 }}
              disabled={!permissions.canCreate}
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
                    'Name',
                    'Phone',
                    'Email',
                    'DOB',
                    'DOA',
                    'Company',
                    'Created By',
                    'Updated By',
                    'Actions',
                  ].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 'bold' }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData?.map((row) => (
                  <TableRow key={row.documentId}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.mobile}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.dob}</TableCell>
                    <TableCell>{row.doa}</TableCell>
                    <TableCell>{row.company_name}</TableCell>
                    <TableCell>{row.user_created}</TableCell>
                    <TableCell>{row.user_updated}</TableCell>
                    <TableCell>
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
                    <TableCell colSpan={7} align="center">
                      No guests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Delete Dialog */}
          <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
            <DialogTitle>Delete Guest</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete{' '}
                <strong>{selectedRow?.name}</strong>?
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
            <DialogTitle>{editing ? 'Edit Guest' : 'Create Guest'}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Mobile"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile: e.target.value })
                    }
                    error={!!errors.mobile}
                    helperText={errors.mobile}
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
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Date of birth"
                    type="date"
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData({ ...formData, dob: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Date of anniversary"
                    type="date"
                    value={formData.doa}
                    onChange={(e) =>
                      setFormData({ ...formData, doa: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="GST No"
                    value={formData.gst_no}
                    onChange={(e) =>
                      setFormData({ ...formData, gst_no: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    select
                    fullWidth
                    label="ID Type"
                    value={formData.id_type}
                    onChange={(e) =>
                      setFormData({ ...formData, id_type: e.target.value })
                    }
                    error={!!errors.id_type}
                    helperText={errors.id_type}
                  >
                    <MenuItem value="Aadhaar Card">Aadhaar Card</MenuItem>
                    <MenuItem value="PAN Card">PAN Card</MenuItem>
                    <MenuItem value="Driving License">Driving License</MenuItem>
                    <MenuItem value="Passport">Passport</MenuItem>
                    <MenuItem value="Others">Others</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="ID Number"
                    value={formData.id_number}
                    onChange={(e) =>
                      setFormData({ ...formData, id_number: e.target.value })
                    }
                    error={!!errors.id_number}
                    helperText={errors.id_number}
                  />
                </Grid>

                {formData.id_type === 'Passport' && (
                  <>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Passport Issue Date"
                        InputLabelProps={{ shrink: true }}
                        value={formData.passport_issue_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            passport_issue_date: e.target.value,
                          })
                        }
                        error={!!errors.passport_issue_date}
                        helperText={errors.passport_issue_date}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Passport Expiry Date"
                        InputLabelProps={{ shrink: true }}
                        value={formData.passport_exp_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            passport_exp_date: e.target.value,
                          })
                        }
                        error={!!errors.passport_exp_date}
                        helperText={errors.passport_exp_date}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Visa Number"
                        value={formData.visa_number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            visa_number: e.target.value,
                          })
                        }
                        error={!!errors.visa_number}
                        helperText={errors.visa_number}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Visa Expiry Date"
                        InputLabelProps={{ shrink: true }}
                        value={formData.visa_issue_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            visa_issue_date: e.target.value,
                          })
                        }
                        error={!!errors.visa_issue_date}
                        helperText={errors.visa_issue_date}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Visa Expiry Date"
                        InputLabelProps={{ shrink: true }}
                        value={formData.visa_exp_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            visa_exp_date: e.target.value,
                          })
                        }
                        error={!!errors.visa_exp_date}
                        helperText={errors.visa_exp_date}
                      />
                    </Grid>
                  </>
                )}
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
