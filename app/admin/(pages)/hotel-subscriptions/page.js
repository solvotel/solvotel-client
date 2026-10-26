'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Tooltip,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';

import {
  Add as AddIcon,
  Search as SearchIcon,
  VisibilityOutlined,
  EditOutlined,
  DeleteOutline,
  Close as CloseIcon,
} from '@mui/icons-material';
import { CreateNewData, DeleteData, UpdateData } from '@/utils/ApiFunctions';
import { useAuth } from '@/context';
import { fetcher, BASEURL } from '@/config/MainApi';
import useSWR from 'swr';
import { GetCustomDate } from '@/utils/DateFetcher';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';
import { Loader } from '@/component/common';

// ───────── Form Default State ─────────
const defaultFormState = {
  order_id: '',
  plan: '',
  start_date: '',
  expiry_date: '',
  amount: '',
  transaction_id: '',
  payment_method: '',
  notes: '',
  hotel: null,
  renewed_from: null,
};

const getPlanStatus = ({ start_date, expiry_date }) => {
  if (!start_date || !expiry_date) return 'Expired';

  const start = new Date(`${start_date.slice(0, 10)}T00:00:00`);
  const expiry = new Date(`${expiry_date.slice(0, 10)}T00:00:00`);
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(expiry.getTime()) ||
    start > expiry
  ) {
    return 'Expired';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= start && today <= expiry ? 'Active' : 'Expired';
};

export default function SubscriptionsPage() {
  const { auth } = useAuth(); // Assuming you have a custom hook for authentication
  // ───────── State ─────────

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Selection & Form states
  const [selectedSub, setSelectedSub] = useState(null);
  const [formData, setFormData] = useState(defaultFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const { data: subscriptions } = useSWR(
    `${BASEURL}/hotel-subscriptions?sort=createdAt:DESC&populate=*`,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 500,
    },
  );

  const { data: outlets } = useSWR(
    `${BASEURL}/hotels?sort=createdAt:DESC&populate=*`,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 500,
    },
  );

  // ───────── Handlers ─────────
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenView = (sub) => {
    setSelectedSub(sub);
    setViewModalOpen(true);
  };

  const handleOpenCreate = () => {
    setFormData(defaultFormState);
    setFormErrors({});

    setIsEditing(false);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (sub) => {
    setFormData({
      order_id: sub.order_id || '',
      plan: sub.plan || '',
      start_date: sub.start_date || '',
      expiry_date: sub.expiry_date || '',
      amount: sub.amount || '',
      transaction_id: sub.transaction_id || '',
      payment_method: sub.payment_method || '',
      notes: sub.notes || '',

      hotel: sub.hotel?.documentId || null,
      renewed_from: sub.renewed_from?.documentId || null,
    });
    setFormErrors({});
    setSelectedSub(sub);
    setIsEditing(true);
    setFormModalOpen(true);
  };

  const handleOpenDelete = (sub) => {
    setSelectedSub(sub);
    setDeleteModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors((errors) => ({ ...errors, [name]: false }));
  };

  const handleSaveForm = async () => {
    const requiredFields = [
      'order_id',
      'plan',
      'start_date',
      'expiry_date',
      'amount',
      'transaction_id',
      'payment_method',
      'notes',
      'hotel',
    ];
    const errors = Object.fromEntries(
      requiredFields.map((field) => [
        field,
        formData[field] == null ||
          (typeof formData[field] === 'string' && !formData[field].trim()),
      ]),
    );
    setFormErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    try {
      if (isEditing) {
        await UpdateData({
          auth,
          endPoint: 'hotel-subscriptions',
          id: selectedSub.documentId,
          payload: {
            data: formData,
          },
        });
        SuccessToast('Subscription updated successfully');
      } else {
        await CreateNewData({
          auth,
          endPoint: 'hotel-subscriptions',
          payload: {
            data: formData,
          },
        });
        SuccessToast('Subscription created successfully');
      }
      setFormModalOpen(false);
    } catch (err) {
      console.error('Error saving subscription:', err);
      ErrorToast(
        'An error occurred while saving the subscription. Please try again.',
      );
    }
  };

  const handleDeleteConfirm = async () => {
    await DeleteData({
      auth,
      endPoint: 'hotel-subscriptions',
      id: selectedSub.documentId,
    });

    setDeleteModalOpen(false);
    SuccessToast('Subscription deleted successfully');
  };

  // ───────── Derived Data (Search & Pagination) ─────────
  const filteredData = useMemo(() => {
    if (!searchQuery) return subscriptions;
    const lowerQuery = searchQuery.toLowerCase();
    return subscriptions.filter((sub) =>
      [
        sub.order_id,
        getPlanStatus(sub),
        sub.hotel?.name,
        sub.hotel?.phone,
        sub.plan,
      ].some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(lowerQuery),
      ),
    );
  }, [subscriptions, searchQuery]);

  const paginatedData = useMemo(() => {
    return filteredData?.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [filteredData, page, rowsPerPage]);

  // Helper for status chip colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Expired':
        return 'error';
      default:
        return 'default';
    }
  };

  if (!subscriptions) {
    return <Loader />;
  }

  return (
    <Box>
      {/* ───────── Page Header ───────── */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Subscriptions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your hotel&apos;s subscription plans and billing history.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
        >
          Create New
        </Button>
      </Box>

      {/* ───────── Toolbar (Search & Filter) ───────── */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, border: '1px solid #e5e7eb', borderRadius: 3 }}
      >
        <TextField
          placeholder="Search by Order ID, Status, Outlet Name, Phone, or Plan..."
          size="small"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: { sm: 500 } }}
        />
      </Paper>

      {/* ───────── Data Table ───────── */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e5e7eb',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell fontWeight={600}>Order ID</TableCell>
                <TableCell fontWeight={600}>Plan</TableCell>
                <TableCell fontWeight={600}>Outlet Name</TableCell>
                <TableCell fontWeight={600}>Phone</TableCell>
                <TableCell fontWeight={600}>Start Date</TableCell>
                <TableCell fontWeight={600}>Expiry Date</TableCell>
                <TableCell fontWeight={600}>Amount</TableCell>
                <TableCell fontWeight={600}>Plan Status</TableCell>
                <TableCell align="right" fontWeight={600}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {row.order_id}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.plan}</TableCell>
                    <TableCell>{row.hotel.hotel_name || 'N/A'}</TableCell>
                    <TableCell>{row.hotel.hotel_mobile || 'N/A'}</TableCell>
                    <TableCell>{GetCustomDate(row.start_date)}</TableCell>
                    <TableCell>{GetCustomDate(row.expiry_date)}</TableCell>
                    <TableCell>
                      ₹{Number(row.amount).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getPlanStatus(row)}
                        color={getStatusColor(getPlanStatus(row))}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenView(row)}
                          color="primary"
                        >
                          <VisibilityOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(row)}
                          color="info"
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDelete(row)}
                          color="error"
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      No subscriptions found matching your search.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* ───────── VIEW MODAL ───────── */}
      <Dialog
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            Subscription Details
            <Chip
              label={getPlanStatus(selectedSub || {})}
              color={getStatusColor(getPlanStatus(selectedSub || {}))}
              size="small"
              sx={{ fontWeight: 500, ml: 2 }}
            />
          </Box>

          <IconButton onClick={() => setViewModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedSub && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  Hotel
                </Typography>
                <Typography variant="body1" fontWeight={500} mt={0.5}>
                  {selectedSub.hotel.hotel_name || 'N/A'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  Outlet Phone
                </Typography>
                <Typography variant="body1" fontWeight={500} mt={0.5}>
                  {selectedSub.hotel.hotel_mobile || 'N/A'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  Order ID
                </Typography>
                <Typography variant="body1" fontWeight={500} mt={0.5}>
                  {selectedSub.order_id}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  Plan
                </Typography>
                <Typography variant="body1" fontWeight={500} mt={0.5}>
                  {selectedSub.plan}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  Start Date
                </Typography>
                <Typography variant="body1" fontWeight={500} mt={0.5}>
                  {GetCustomDate(selectedSub.start_date)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  Expiry Date
                </Typography>
                <Typography variant="body1" fontWeight={500} mt={0.5}>
                  {GetCustomDate(selectedSub.expiry_date)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  Amount
                </Typography>
                <Typography variant="body1" fontWeight={500} mt={0.5}>
                  {selectedSub.amount}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  Transaction ID
                </Typography>
                <Typography variant="body1" fontWeight={500} mt={0.5}>
                  {selectedSub.transaction_id}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  Payment Method
                </Typography>
                <Typography variant="body1" fontWeight={500} mt={0.5}>
                  {selectedSub.payment_method}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  renewed From
                </Typography>
                <Typography variant="body1" fontWeight={500} mt={0.5}>
                  {selectedSub?.renewed_from?.order_id || 'None'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  Notes
                </Typography>
                <Typography variant="body1" fontWeight={500} mt={0.5}>
                  {selectedSub.notes}
                </Typography>
              </Grid>{' '}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setViewModalOpen(false)}
            variant="outlined"
            sx={{ textTransform: 'none' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ───────── CREATE / EDIT MODAL ───────── */}
      <Dialog
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {isEditing ? 'Edit Subscription' : 'Create New Subscription'}
          <IconButton onClick={() => setFormModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Order ID"
                name="order_id"
                value={formData.order_id}
                onChange={handleFormChange}
                size="small"
                required
                error={formErrors.order_id}
                helperText={formErrors.order_id ? 'Order ID is required' : ''}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Plan"
                name="plan"
                value={formData.plan}
                onChange={handleFormChange}
                size="small"
                required
                error={formErrors.plan}
                helperText={formErrors.plan ? 'Plan is required' : ''}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Start Date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleFormChange}
                size="small"
                InputLabelProps={{ shrink: true }}
                required
                error={formErrors.start_date}
                helperText={
                  formErrors.start_date ? 'Start date is required' : ''
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Expiry Date"
                name="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={handleFormChange}
                size="small"
                InputLabelProps={{ shrink: true }}
                required
                error={formErrors.expiry_date}
                helperText={
                  formErrors.expiry_date ? 'Expiry date is required' : ''
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleFormChange}
                size="small"
                required
                error={formErrors.amount}
                helperText={formErrors.amount ? 'Amount is required' : ''}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Transaction ID"
                name="transaction_id"
                value={formData.transaction_id}
                onChange={handleFormChange}
                size="small"
                required
                error={formErrors.transaction_id}
                helperText={
                  formErrors.transaction_id ? 'Transaction ID is required' : ''
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Payment Method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleFormChange}
                size="small"
                required
                error={formErrors.payment_method}
                helperText={
                  formErrors.payment_method ? 'Payment method is required' : ''
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleFormChange}
                size="small"
                required
                error={formErrors.notes}
                helperText={formErrors.notes ? 'Notes are required' : ''}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl
                fullWidth
                size="small"
                required
                error={formErrors.hotel}
              >
                <InputLabel id="hotel-label">Hotel</InputLabel>
                <Select
                  fullWidth
                  label="Hotel"
                  name="hotel"
                  value={formData.hotel}
                  onChange={handleFormChange}
                  size="small"
                >
                  <MenuItem value="">Select a Hotel</MenuItem>
                  {/* Add your Hotel options here */}
                  {outlets?.map((outlet) => (
                    <MenuItem key={outlet.id} value={outlet.documentId}>
                      {outlet.hotel_name || 'N/A'} -{' '}
                      {outlet.hotel_mobile || 'N/A'}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.hotel && (
                  <FormHelperText>Hotel is required</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="renewed-from-label">Renewed From</InputLabel>
                <Select
                  fullWidth
                  label="Renewed From"
                  name="renewed_from"
                  value={formData.renewed_from}
                  onChange={handleFormChange}
                  size="small"
                >
                  <MenuItem value={null}>Select a Subscription</MenuItem>
                  {/* Add your Hotel options here */}
                  {subscriptions
                    ?.filter((sub) => sub.documentId !== formData.documentId)
                    ?.map((sub) => (
                      <MenuItem key={sub.id} value={sub.documentId}>
                        {sub.order_id} - {sub.plan || 'N/A'}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setFormModalOpen(false)}
            variant="outlined"
            color="inherit"
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveForm}
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            {isEditing ? 'Save Changes' : 'Create Subscription'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ───────── DELETE CONFIRMATION MODAL ───────── */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the subscription{' '}
            <strong>{selectedSub?.order_id}</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteModalOpen(false)}
            variant="outlined"
            color="inherit"
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
