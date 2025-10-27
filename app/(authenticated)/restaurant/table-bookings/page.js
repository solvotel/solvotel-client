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
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { SuccessToast, WarningToast } from '@/utils/GenerateToast';

import { Loader } from '@/component/common';
import { GetCustomDate, GetTodaysDate } from '@/utils/DateFetcher';

const Page = () => {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;

  const data = GetDataList({
    auth,
    endPoint: 'table-bookings',
  });
  const tableList = GetDataList({
    auth,
    endPoint: 'tables',
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData());
  const [editing, setEditing] = useState(false);

  const [filterDate, setFilterDate] = useState(todaysDate);

  function initialFormData() {
    return {
      date: todaysDate,
      guest: '',
      table_no: '',
      time: '',
      hotel_id: auth?.user?.hotel_id || '',
    };
  }

  // filter bookings by date
  const filteredBookings = useMemo(() => {
    if (!data) return [];
    return data.filter((item) => item.date === filterDate);
  }, [data, filterDate]);

  // available tables = tables not booked on this date
  const availableTables = useMemo(() => {
    if (!tableList) return [];
    const bookedTableNos = filteredBookings.map((b) => b.table_no);
    return tableList.filter((t) => !bookedTableNos.includes(t.table_no));
  }, [tableList, filteredBookings]);

  // --- handlers ---
  const handleEdit = (row) => {
    setEditing(true);
    setFormData(row);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditing(false);
    setFormData(initialFormData());
    setFormOpen(true);
  };

  const handleQuickBook = (tableNo) => {
    setEditing(false);
    setFormData({
      ...initialFormData(),
      table_no: tableNo,
      date: filterDate,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    // duplicate check
    const duplicate = data?.find(
      (item) =>
        item.date === formData.date &&
        item.time === formData.time &&
        item.table_no === formData.table_no &&
        (!editing || item.documentId !== formData.documentId)
    );
    if (duplicate) {
      WarningToast(
        `⚠️ Table ${formData.table_no} is already booked for that slot.`
      );
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
        endPoint: 'table-bookings',
        id: formData.documentId,
        payload: {
          data: updateBody,
        },
      });
      SuccessToast('✅ Booking updated successfully');
    } else {
      await CreateNewData({
        auth,
        endPoint: 'table-bookings',
        payload: {
          data: formData,
        },
      });
      SuccessToast('🎉 Booking created successfully');
    }
    setFormOpen(false);
  };

  const handleDeleteClick = (row) => {
    setSelectedRow(row);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    await DeleteData({
      auth,
      endPoint: 'table-bookings',
      id: selectedRow.documentId,
    });
    SuccessToast('🗑️ Booking deleted successfully');
    setDeleteOpen(false);
    setSelectedRow(null);
  };

  const handleCancelDelete = () => {
    setDeleteOpen(false);
    setSelectedRow(null);
  };

  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#f4f6f8' }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Typography color="text.primary">Restaurant Bookings</Typography>
        </Breadcrumbs>
      </Box>

      {!data || !tableList ? (
        <Loader />
      ) : (
        <Box p={3}>
          {/* Top Filters */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <TextField
              size="small"
              label="📅 Select Date"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2, textTransform: 'none' }}
              onClick={handleCreate}
            >
              Create Booking
            </Button>
          </Box>

          {/* Available Tables */}
          <Typography variant="h6" gutterBottom>
            🎉Tables
          </Typography>
          <Grid container spacing={2} mb={4}>
            {tableList.length > 0 ? (
              tableList.map((table) => (
                <Grid size={{ xs: 12, sm: 6, md: 2 }} key={table.documentId}>
                  <Card
                    sx={{ borderRadius: 3, boxShadow: 3, bgcolor: '#e8f5e9' }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <EventSeatIcon sx={{ mr: 1, color: 'green' }} />
                        Table {table.table_no}
                      </Typography>
                      <Chip
                        label="Available"
                        color="success"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleQuickBook(table.table_no)}
                      >
                        Book Now
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Box width="100%" textAlign="center" py={3}>
                <Typography variant="body1" color="text.secondary">
                  No available tables on {GetCustomDate(filterDate)}
                </Typography>
              </Box>
            )}
          </Grid>

          {/* Bookings */}
          <Typography variant="h6" gutterBottom>
            📅 Bookings on {GetCustomDate(filterDate)}
          </Typography>
          <Grid container spacing={2}>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((row) => (
                <Grid size={{ xs: 12, sm: 6, md: 2 }} key={row.documentId}>
                  <Card
                    sx={{ borderRadius: 3, boxShadow: 3, bgcolor: '#fff3e0' }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <EventSeatIcon sx={{ mr: 1, color: '#ff9800' }} />
                        Table {row.table_no}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                      >
                        <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} />{' '}
                        {GetCustomDate(row.date)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                      >
                        <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />{' '}
                        {row.time}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        <PersonIcon fontSize="small" sx={{ mr: 1 }} />{' '}
                        {row.guest}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Tooltip title="Edit">
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(row)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(row)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Box width="100%" textAlign="center" py={3}>
                <Typography variant="body1" color="text.secondary">
                  No bookings found for this date
                </Typography>
              </Box>
            )}
          </Grid>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteOpen} onClose={handleCancelDelete}>
            <DialogTitle>Delete Booking</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete booking for{' '}
                <strong>Table {selectedRow?.table_no}</strong>?
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
              {editing ? '✏️ Edit Booking' : '➕ Create Booking'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={12}>
                  <TextField
                    select
                    margin="dense"
                    label="Table No"
                    fullWidth
                    value={formData.table_no || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, table_no: e.target.value })
                    }
                    SelectProps={{ native: true }}
                  >
                    <option value="">-- Select --</option>
                    {tableList?.map((cat) => (
                      <option key={cat.documentId} value={cat.table_no}>
                        {cat?.table_no}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Date"
                    fullWidth
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Time"
                    fullWidth
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    margin="dense"
                    label="Guest Name"
                    fullWidth
                    value={formData.guest}
                    onChange={(e) =>
                      setFormData({ ...formData, guest: e.target.value })
                    }
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
