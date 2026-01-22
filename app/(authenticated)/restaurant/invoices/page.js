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
import { Add } from '@mui/icons-material';

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
  const [loading, setLoading] = useState(false);

  const [selectedItem, setSelectedItem] = useState();

  // Calculate payable amount
  const payableAmount = useMemo(() => {
    const totalAmount = formData.menu_items.reduce(
      (acc, cur) => acc + cur.rate * cur.qty,
      0,
    );
    const tax = formData.menu_items.reduce(
      (acc, cur) => acc + (cur.rate * cur.qty * cur.gst) / 100,
      0,
    );
    return totalAmount + tax;
  }, [formData.menu_items]);

  // filter data by name
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) =>
      item.invoice_no?.toLowerCase().includes(search.toLowerCase()),
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

  const handleAddPayment = () => {
    // Calculate current totals
    const totalAmount = formData.menu_items.reduce(
      (acc, cur) => acc + cur.rate * cur.qty,
      0,
    );
    const tax = formData.menu_items.reduce(
      (acc, cur) => acc + (cur.rate * cur.qty * cur.gst) / 100,
      0,
    );
    const payable = totalAmount + tax;
    const totalPaid = formData.payments.reduce(
      (acc, payment) => acc + (parseFloat(payment.amount) || 0),
      0,
    );
    const due = Math.max(0, payable - totalPaid);

    // Validation: Check if there's an outstanding amount to pay
    if (due <= 0) {
      ErrorToast('No outstanding amount to pay');
      return;
    }

    const newPayment = {
      time_stamp: new Date().toISOString(),
      mop: '',
      amount: due,
    };
    setFormData({
      ...formData,
      payments: [...formData.payments, newPayment],
    });
  };

  const handleUpdatePayment = (index, field, value) => {
    if (field === 'amount') {
      const numValue = parseFloat(value) || 0;
      if (numValue < 0) {
        ErrorToast('Payment amount cannot be negative');
        return;
      }
      value = numValue;
    }

    const updatedPayments = [...formData.payments];
    updatedPayments[index][field] = value;
    setFormData({
      ...formData,
      payments: updatedPayments,
    });
  };

  const handleRemovePayment = (index) => {
    const updatedPayments = formData.payments.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      payments: updatedPayments,
    });
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
      payments: [], // Changed from mop to payments array
      due: 0,
      menu_items: [],
      hotel_id: auth?.user?.hotel_id || '',
    };
  }

  // handle edit
  const handleEdit = (row) => {
    setEditing(true);
    let formData = { ...row };
    // Backward compatibility: if old mop exists and no payments, convert to payments
    if (
      formData.mop &&
      (!formData.payments || formData.payments.length === 0)
    ) {
      formData.payments = [
        {
          time_stamp: new Date().toISOString(),
          mop: formData.mop,
          amount: formData.payable_amount - (formData.due || 0),
        },
      ];
      delete formData.mop; // remove old field
    }
    setFormData(formData);
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

    // Calculate payable amount
    const totalAmount = formData.menu_items.reduce(
      (acc, cur) => acc + cur.rate * cur.qty,
      0,
    );
    const tax = formData.menu_items.reduce(
      (acc, cur) => acc + (cur.rate * cur.qty * cur.gst) / 100,
      0,
    );
    const payable = totalAmount + tax;

    // Calculate total paid
    const totalPaid = formData.payments.reduce(
      (acc, payment) => acc + (parseFloat(payment.amount) || 0),
      0,
    );

    if (totalPaid > payable) {
      errors.payments = 'Total payment amount cannot exceed payable amount';
    }

    // Validate each payment has MOP and amount > 0
    if (formData.payments && formData.payments.length > 0) {
      for (let i = 0; i < formData.payments.length; i++) {
        const payment = formData.payments[i];
        if (!payment.mop || payment.mop.trim() === '') {
          errors.payments = `Payment ${i + 1}: Please select a mode of payment`;
          break;
        }
        if (!payment.amount || parseFloat(payment.amount) <= 0) {
          errors.payments = `Payment ${i + 1}: Amount must be greater than 0`;
          break;
        }
      }
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      // show first error toast
      ErrorToast(Object.values(errors)[0]);
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm(formData)) {
      return;
    }

    setLoading(true);

    try {
      // recalc before save
      const totalAmount = formData.menu_items.reduce(
        (acc, cur) => acc + cur.rate * cur.qty,
        0,
      );
      const tax = formData.menu_items.reduce(
        (acc, cur) => acc + (cur.rate * cur.qty * cur.gst) / 100,
        0,
      );
      const payable = totalAmount + tax;

      const totalPaid = formData.payments.reduce(
        (acc, payment) => acc + (parseFloat(payment.amount) || 0),
        0,
      );
      const due = Math.max(0, payable - totalPaid);

      // ✅ Clean menu_items (remove id/documentId/etc.)
      const cleanedMenuItems = formData.menu_items.map(
        ({ id, documentId, ...rest }) => rest,
      );

      const cleanedPayments = formData.payments.map(
        ({ id, documentId, ...rest }) => rest,
      );

      const finalData = {
        ...formData,
        total_amount: totalAmount,
        tax,
        payable_amount: payable,
        payments: cleanedPayments,
        due,
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
          payload: {
            data: { ...finalData, user_created: auth?.user?.username },
          },
        });
        SuccessToast('Invoice created successfully');
      }

      setFormOpen(false);
    } catch (error) {
      ErrorToast('Failed to save invoice. Please try again.');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
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
                    'Total (₹)',
                    'SGST (₹) ',
                    'CGST (₹) ',
                    'Payable (₹) ',
                    'Paid (₹)',
                    'Due (₹)',
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
                    <TableCell>
                      {row.payments
                        ?.reduce(
                          (acc, p) => acc + (parseFloat(p.amount) || 0),
                          0,
                        )
                        .toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell>{row.due || '0.00'}</TableCell>
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
                    <TableCell colSpan={11} align="center">
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
                                  (_, i) => i !== idx,
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
                Payments
              </Typography>
              {formErrors.payments && (
                <Typography color="error" sx={{ mb: 1 }}>
                  {formErrors.payments}
                </Typography>
              )}

              <TableContainer component={Paper} sx={{ borderRadius: 1, mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['Timestamp', 'MOP', 'Amount', 'Actions'].map((h) => (
                        <TableCell key={h}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.payments?.length > 0 ? (
                      <>
                        {formData.payments.map((payment, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              {new Date(payment.time_stamp).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                fullWidth
                                value={payment.mop}
                                onChange={(e) =>
                                  handleUpdatePayment(
                                    idx,
                                    'mop',
                                    e.target.value,
                                  )
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
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                size="small"
                                value={payment.amount}
                                onChange={(e) =>
                                  handleUpdatePayment(
                                    idx,
                                    'amount',
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                sx={{ width: 100 }}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                color="error"
                                onClick={() => handleRemovePayment(idx)}
                                size="small"
                              >
                                <DeleteIcon fontSize="inherit" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          Payment not added yet!!
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={handleAddPayment}
                          startIcon={<Add />}
                          disabled={payableAmount === 0}
                        >
                          Add Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Payment Summary */}
              {(() => {
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
                const totalPaid = formData.payments.reduce(
                  (acc, payment) => acc + (parseFloat(payment.amount) || 0),
                  0,
                );
                const due = Math.max(0, payable - totalPaid);

                return (
                  <Grid container spacing={2} mb={2}>
                    <Grid item size={{ xs: 12, sm: 3 }}>
                      <Typography>
                        Total Paid: <b>₹{totalPaid.toFixed(2)}</b>
                      </Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 3 }}>
                      <Typography>
                        Due: <b>₹{due.toFixed(2)}</b>
                      </Typography>
                    </Grid>
                  </Grid>
                );
              })()}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button
                onClick={handleSave}
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Saving...' : editing ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </>
  );
};

export default Page;
