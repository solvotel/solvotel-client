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
import { GetCustomDate, GetTodaysDate } from '@/utils/DateFetcher';
import { GetCurrentTime } from '@/utils/Timefetcher';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { CheckUserPermission } from '@/utils/UserPermissions';

const generateNextInvoiceNo = (invoices) => {
  if (!invoices || invoices.length === 0) {
    return 'INV-1';
  }

  // Extract all numbers from invoice_no like "INV-12" -> 12
  const numbers = invoices
    .map((inv) => parseInt(inv.invoice_no?.replace('INV-', ''), 10))
    .filter((n) => !isNaN(n));

  const maxNumber = Math.max(...numbers);

  return `INV-${maxNumber + 1}`;
};

const Page = () => {
  const { auth } = useAuth();
  const permissions = CheckUserPermission(auth?.user?.permissions);
  const todaysDate = GetTodaysDate().dateString;
  const data = GetDataList({
    auth,
    endPoint: 'restaurant-invoices',
  });
  const paymentMethods = GetDataList({
    auth,
    endPoint: 'payment-methods',
  });

  const menuItems = GetDataList({
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

  const [selectedItem, setSelectedItem] = useState();

  // filter data by name
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) =>
      item.invoice_no?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const handleItemSelect = () => {
    if (!selectedItem) return;

    const itemObj = menuItems.find((m) => m.documentId === selectedItem);
    if (!itemObj) return;

    const rate = itemObj.rate || 0;
    const gstPercent = itemObj.gst || 0;
    const gstValue = (rate * gstPercent) / 100;

    const newItem = {
      item: itemObj.item,
      hsn: itemObj.hsn || '',
      rate,
      qty: 1,
      gst: gstPercent,
      amount: rate + gstValue, // ✅ total includes gst
    };

    setFormData({
      ...formData,
      menu_items: [...formData.menu_items, newItem],
    });

    setSelectedItem('');
  };

  function initialFormData() {
    const newInvoiceNO = generateNextInvoiceNo(data);
    const time = GetCurrentTime();
    return {
      invoice_no: newInvoiceNO,
      date: todaysDate,
      time: time,
      customer_name: '',
      customer_phone: '',
      customer_gst: '',
      customer_address: '',
      total_amount: '',
      tax: '',
      payable_amount: '',
      mop: '',
      menu_items: [],
      hotel_id: auth?.user?.hotel_id || '',
    };
  }

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

  const validateForm = (formData) => {
    const errors = {};

    if (!formData.menu_items || formData.menu_items.length === 0) {
      errors.menu_items = 'Please add at least one menu item';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      // show first error toast

      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm(formData)) {
      ErrorToast('Enter required fields');
      return;
    }
    // recalc before save
    const totalAmount = formData.menu_items.reduce(
      (acc, cur) => acc + cur.rate * cur.qty,
      0
    );
    const tax = formData.menu_items.reduce(
      (acc, cur) => acc + (cur.rate * cur.qty * cur.gst) / 100,
      0
    );
    const payable = totalAmount + tax;

    // ✅ Clean menu_items (remove id/documentId/etc.)
    const cleanedMenuItems = formData.menu_items.map(
      ({ id, documentId, ...rest }) => rest
    );

    const finalData = {
      ...formData,
      total_amount: totalAmount,
      tax,
      payable_amount: payable,
      menu_items: cleanedMenuItems,
    };

    if (editing) {
      const {
        id,
        documentId,
        publishedAt,
        updatedAt,
        createdAt,
        ...updateBody
      } = finalData;

      await UpdateData({
        auth,
        endPoint: 'restaurant-invoices',
        id: formData.documentId, // ✅ only for URL
        payload: {
          data: { ...updateBody, user_updated: auth?.user?.username },
        },
      });
      SuccessToast('Invoice updated successfully');
    } else {
      await CreateNewData({
        auth,
        endPoint: 'restaurant-invoices',
        payload: { data: { ...finalData, user_created: auth?.user?.username } },
      });
      SuccessToast('Invoice created successfully');
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
      endPoint: 'restaurant-invoices',
      id: selectedRow.documentId,
    });
    SuccessToast('Invoice deleted successfully');
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
          <Typography color="text.primary">Restaurant Invoices</Typography>
        </Breadcrumbs>
      </Box>
      {!data || !menuItems || !paymentMethods ? (
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
              label="Search by invoice no"
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
              Create New Invoice
            </Button>
          </Box>

          {/* Data Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  {[
                    'Invoice No',
                    'Date/Time',
                    'Customer Name',
                    'Total Amount ₹',
                    'SGST ₹ ',
                    'CGST ₹ ',
                    'Payable Amount ₹ ',
                    'Payment Method',
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
                    <TableCell>{row.invoice_no}</TableCell>
                    <TableCell>
                      {row.date}:{row.time}
                    </TableCell>
                    <TableCell>{row.customer_name || 'N/A'}</TableCell>
                    <TableCell>{row.total_amount}</TableCell>
                    <TableCell>{row.tax / 2}</TableCell>
                    <TableCell>{row.tax / 2}</TableCell>
                    <TableCell>{row.payable_amount}</TableCell>
                    <TableCell>{row.mop}</TableCell>{' '}
                    <TableCell>{row.user_created}</TableCell>
                    <TableCell>{row.user_updated}</TableCell>
                    <TableCell sx={{ width: '150px' }}>
                      <Tooltip title="View">
                        <IconButton
                          color="secondary"
                          href={`/restaurant/invoices/${row.documentId}`}
                          size="small"
                        >
                          <VisibilityIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>

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
                      No invoice found
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
            <DialogTitle id="delete-dialog-title">Delete Invoice</DialogTitle>
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
              {editing ? 'Edit Invoice' : 'Create Invoice'}
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="h6" gutterBottom>
                Invoice Info
              </Typography>
              <Grid container spacing={2} mb={2}>
                <Grid item size={{ xs: 12, sm: 4 }}>
                  <Typography>
                    Invoice No: <b>{formData.invoice_no}</b>
                  </Typography>
                </Grid>
                <Grid item size={{ xs: 12, sm: 4 }}>
                  <Typography>
                    Date: <b>{GetCustomDate(formData.date)}</b>
                  </Typography>
                </Grid>
                <Grid item size={{ xs: 12, sm: 4 }}>
                  <Typography>
                    Time: <b>{formData.time}</b>
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Customer Info
              </Typography>
              <Grid container spacing={2} mb={2}>
                <Grid item size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Customer Name"
                    size="small"
                    fullWidth
                    value={formData.customer_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer_name: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Phone"
                    size="small"
                    fullWidth
                    value={formData.customer_phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer_phone: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="GST No"
                    size="small"
                    fullWidth
                    value={formData.customer_gst}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_gst: e.target.value })
                    }
                  />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="dense"
                    label="Address"
                    size="small"
                    fullWidth
                    value={formData.customer_address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer_address: e.target.value,
                      })
                    }
                  />
                </Grid>
              </Grid>

              {/* Items Section */}
              <Typography variant="h6" gutterBottom>
                Items
              </Typography>
              {formErrors.menu_items && (
                <Typography color="error" sx={{ mb: 1 }}>
                  {formErrors.menu_items}
                </Typography>
              )}
              <Grid container spacing={2} alignItems="center" mb={2}>
                <Grid item size={{ xs: 10 }}>
                  <TextField
                    select
                    margin="dense"
                    label="Select Menu Item"
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={selectedItem || ''}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    SelectProps={{ native: true }}
                  >
                    <option value="">-- Select --</option>
                    {menuItems?.map((cat) => (
                      <option key={cat.documentId} value={cat.documentId}>
                        {cat?.item}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item size={{ xs: 2 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    onClick={handleItemSelect}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>

              {formData.menu_items?.length > 0 && (
                <TableContainer
                  component={Paper}
                  sx={{ borderRadius: 1, mb: 3 }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {[
                          'Name',
                          'HSN',
                          'Rate',
                          'Qty',
                          'GST %',
                          'Total',
                          'Actions',
                        ].map((h) => (
                          <TableCell key={h}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.menu_items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.item}</TableCell>
                          <TableCell>{item.hsn}</TableCell>

                          {/* Rate Field */}
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={item.rate}
                              onChange={(e) => {
                                const newRate = parseFloat(e.target.value) || 0;
                                const updated = [...formData.menu_items];
                                updated[idx].rate = newRate;
                                const gst = updated[idx].gst || 0;
                                const qty = updated[idx].qty || 1;
                                updated[idx].amount = +(
                                  qty *
                                  newRate *
                                  (1 + gst / 100)
                                ).toFixed(2);
                                setFormData({
                                  ...formData,
                                  menu_items: updated,
                                });
                              }}
                              sx={{ width: 80 }}
                            />
                          </TableCell>

                          {/* Qty Field */}
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={item.qty}
                              onChange={(e) => {
                                const newQty = parseFloat(e.target.value) || 1;
                                const updated = [...formData.menu_items];
                                updated[idx].qty = newQty;
                                const rate = updated[idx].rate || 0;
                                const gst = updated[idx].gst || 0;
                                updated[idx].amount = +(
                                  newQty *
                                  rate *
                                  (1 + gst / 100)
                                ).toFixed(2);
                                setFormData({
                                  ...formData,
                                  menu_items: updated,
                                });
                              }}
                              sx={{ width: 60 }}
                            />
                          </TableCell>

                          {/* GST Field */}
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={item.gst}
                              onChange={(e) => {
                                const newGst = parseFloat(e.target.value) || 0;
                                const updated = [...formData.menu_items];
                                updated[idx].gst = newGst;
                                const rate = updated[idx].rate || 0;
                                const qty = updated[idx].qty || 1;
                                updated[idx].amount = +(
                                  qty *
                                  rate *
                                  (1 + newGst / 100)
                                ).toFixed(2);
                                setFormData({
                                  ...formData,
                                  menu_items: updated,
                                });
                              }}
                              sx={{ width: 60 }}
                            />
                          </TableCell>

                          {/* Amount Field (reverse calculation) */}
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={item.amount}
                              onChange={(e) => {
                                const newAmount =
                                  parseFloat(e.target.value) || 0;
                                const updated = [...formData.menu_items];
                                const gst = updated[idx].gst || 0;
                                const qty = updated[idx].qty || 1;
                                updated[idx].amount = newAmount;
                                // Reverse calculate base rate excluding GST
                                updated[idx].rate = +(
                                  newAmount /
                                  qty /
                                  (1 + gst / 100)
                                ).toFixed(2);
                                setFormData({
                                  ...formData,
                                  menu_items: updated,
                                });
                              }}
                              sx={{ width: 100 }}
                            />
                          </TableCell>

                          {/* Delete Button */}
                          <TableCell>
                            <IconButton
                              color="error"
                              onClick={() => {
                                const updated = formData.menu_items.filter(
                                  (_, i) => i !== idx
                                );
                                setFormData({
                                  ...formData,
                                  menu_items: updated,
                                });
                              }}
                              size="small"
                            >
                              <DeleteIcon fontSize="inherit" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Summary Section */}
              {/* Summary Section */}
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>

              {(() => {
                // ✅ Calculate live totals
                const totalAmount = formData.menu_items.reduce((acc, cur) => {
                  const qty = parseFloat(cur.qty) || 0;
                  const rate = parseFloat(cur.rate) || 0;
                  return acc + qty * rate;
                }, 0);

                const totalTax = formData.menu_items.reduce((acc, cur) => {
                  const qty = parseFloat(cur.qty) || 0;
                  const rate = parseFloat(cur.rate) || 0;
                  const gst = parseFloat(cur.gst) || 0;
                  return acc + (qty * rate * gst) / 100;
                }, 0);

                const payable = totalAmount + totalTax;
                const sgst = totalTax / 2;
                const cgst = totalTax / 2;

                return (
                  <Grid container spacing={2} mb={2}>
                    <Grid item size={{ xs: 12, sm: 3 }}>
                      <Typography>
                        Total: <b>₹{totalAmount.toFixed(2)}</b>
                      </Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 3 }}>
                      <Typography>
                        SGST: <b>₹{sgst.toFixed(2)}</b>
                      </Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 3 }}>
                      <Typography>
                        CGST: <b>₹{cgst.toFixed(2)}</b>
                      </Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 3 }}>
                      <Typography>
                        Payable: <b>₹{payable.toFixed(2)}</b>
                      </Typography>
                    </Grid>
                  </Grid>
                );
              })()}

              {/* Payment Section */}
              <Typography variant="h6" gutterBottom>
                Payment
              </Typography>
              <Grid container spacing={2}>
                <Grid item size={{ xs: 12 }}>
                  <TextField
                    select
                    margin="dense"
                    label="Mode Of Payment"
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={formData.mop}
                    onChange={(e) =>
                      setFormData({ ...formData, mop: e.target.value })
                    }
                    SelectProps={{ native: true }}
                  >
                    <option value="">-- Select --</option>
                    {paymentMethods?.map((cat) => (
                      <option key={cat.documentId} value={cat.name}>
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
