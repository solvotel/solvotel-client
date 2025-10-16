'use client';

import { useAuth } from '@/context';
import {
  DeleteData,
  GetDataList,
  CreateNewData,
  UpdateData,
} from '@/utils/ApiFunctions';
import { useState, useMemo, useEffect } from 'react';

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
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { SuccessToast } from '@/utils/GenerateToast';
import { Loader } from '@/component/common';
import { GetCustomDate, GetTodaysDate } from '@/utils/DateFetcher';

const Page = () => {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;
  const data = GetDataList({
    auth,
    endPoint: 'inventory-sales',
  });

  const inventoryItemList = GetDataList({
    auth,
    endPoint: 'inventory-items',
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
      date: todaysDate,
      order_id: '',
      invoice_no: '',
      inventory_item: '',
      rate: 0,
      tax: 0,
      qty: 0,
      total_price: 0,
      hotel_id: auth?.user?.hotel_id || '',
    };
  }
  console.log(formData);

  // ⏳ Calculation values
  const [baseAmount, setBaseAmount] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);

  // 🔢 Auto-calculate total amount whenever qty/rate/tax changes
  useEffect(() => {
    const qty = Number(formData.qty) || 0;
    const rate = Number(formData.rate) || 0;
    const tax = Number(formData.tax) || 0;

    const base = qty * rate;
    const gst = (base * tax) / 100;
    const total = base + gst;

    setBaseAmount(base);
    setGstAmount(gst);

    setFormData((prev) => ({
      ...prev,
      total_price: Number(total.toFixed(2)),
    }));
  }, [formData.qty, formData.rate, formData.tax]);

  // filter data by name
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) =>
      item.invoice_no?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  // handle edit
  const handleEdit = (row) => {
    setEditing(true);
    setFormData({
      ...row,
      inventory_item: row?.inventory_item?.documentId || row.inventory_item,
    });
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
        inventory_item: inv,
        ...updateBody
      } = formData;

      await UpdateData({
        auth,
        endPoint: 'inventory-sales',
        id: formData.documentId,
        payload: {
          data: {
            ...updateBody,
            inventory_item: inv,
          },
        },
      });
      SuccessToast('Inventory Sales updated successfully');
    } else {
      await CreateNewData({
        auth,
        endPoint: 'inventory-sales',
        payload: {
          data: formData,
        },
      });
      SuccessToast('Inventory Sales created successfully');
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
      endPoint: 'inventory-sales',
      id: selectedRow.documentId,
    });
    SuccessToast('Inventory Sales deleted successfully');
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
          <Typography color="text.primary">Inventory Sales</Typography>
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
              label="Search by Invoice No"
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
                    '#Order Id',
                    '#Invoice No',
                    'Date',
                    'Name',
                    'Unit',
                    'QTY',
                    'Rate (₹)',
                    'GST (%)',
                    'Total (₹)',
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
                    <TableCell>{row.order_id}</TableCell>
                    <TableCell>{row.invoice_no}</TableCell>
                    <TableCell>{GetCustomDate(row.date)}</TableCell>
                    <TableCell>{row.inventory_item?.name}</TableCell>
                    <TableCell>{row.inventory_item?.unit}</TableCell>
                    <TableCell>{row.qty}</TableCell>
                    <TableCell>{row.rate}</TableCell>
                    <TableCell>{row.tax}</TableCell>
                    <TableCell>{row.total_price}</TableCell>
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
                    <TableCell colSpan={9} align="center">
                      No inventory Sales found
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
              Delete Inventory Sales
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this purchase? This action
                cannot be undone.
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
              {editing ? 'Edit Inventory Sales' : 'Create Inventory Sales'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Order Id"
                    fullWidth
                    value={formData.order_id}
                    onChange={(e) =>
                      setFormData({ ...formData, order_id: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Invoice NO"
                    fullWidth
                    value={formData.invoice_no}
                    onChange={(e) =>
                      setFormData({ ...formData, invoice_no: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Invoice Date"
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
                    select
                    margin="dense"
                    label="Inventory Item"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    value={formData.inventory_item || ''}
                    onChange={(e) => {
                      const selected = inventoryItemList.find(
                        (item) => item?.documentId == e.target.value
                      );
                      setFormData({
                        ...formData,
                        inventory_item: selected?.documentId,
                        tax: selected?.tax || 0,
                      });
                    }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="">-- Select --</option>
                    {inventoryItemList?.map((cat) => (
                      <option key={cat.documentId} value={cat.documentId}>
                        {cat?.name}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Rate"
                    type="number"
                    fullWidth
                    value={formData.rate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rate: Number(e.target.value),
                      })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Quantity"
                    type="number"
                    fullWidth
                    value={formData.qty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qty: Number(e.target.value),
                      })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    type="number"
                    margin="dense"
                    label="GST (%)"
                    fullWidth
                    value={formData.tax}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tax: Number(e.target.value),
                      })
                    }
                  />
                </Grid>

                {/* 💰 Calculation Summary */}
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'grey.100',
                    }}
                  >
                    <Typography variant="body2">
                      Base Amount: ₹{baseAmount.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      GST Amount: ₹{gstAmount.toFixed(2)}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total: ₹{formData?.total_price}
                    </Typography>
                  </Box>
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
