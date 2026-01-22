import { CreateNewData, UpdateData } from '@/utils/ApiFunctions';
import { GetTodaysDate } from '@/utils/DateFetcher';
import { SuccessToast, ErrorToast } from '@/utils/GenerateToast';
import { GetCurrentTime } from '@/utils/Timefetcher';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const CreateOrderInvoice = ({
  auth,
  invoiceOpen,
  setInvoiceOpen,
  selectedRow,
  setSelectedRow,
  invoices,
  paymentMethods,
}) => {
  const todaysDate = GetTodaysDate().dateString;
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_gst: '',
    customer_address: '',
    payments: [],
  });
  const [loading, setLoading] = useState(false);
  const generateNextInvoiceNo = () => {
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

  const handleAddPayment = () => {
    // Calculate current totals
    const totalAmount = selectedRow.food_items.reduce(
      (acc, cur) => acc + cur.rate * cur.qty,
      0,
    );
    const tax = selectedRow.food_items.reduce(
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

  const validateForm = () => {
    // Check if at least one payment exists
    if (formData.payments.length === 0) {
      ErrorToast('Please add at least one payment');
      return false;
    }

    // Check each payment has valid MOP and amount > 0
    for (let i = 0; i < formData.payments.length; i++) {
      const payment = formData.payments[i];
      if (!payment.mop || payment.mop.trim() === '') {
        ErrorToast(`Payment ${i + 1}: Please select a mode of payment`);
        return false;
      }
      if (!payment.amount || parseFloat(payment.amount) <= 0) {
        ErrorToast(`Payment ${i + 1}: Payment amount must be greater than 0`);
        return false;
      }
    }

    // Check total payments don't exceed payable amount
    const totalAmount = selectedRow.food_items.reduce(
      (acc, cur) => acc + cur.rate * cur.qty,
      0,
    );
    const tax = selectedRow.food_items.reduce(
      (acc, cur) => acc + (cur.rate * cur.qty * cur.gst) / 100,
      0,
    );
    const payable = totalAmount + tax;
    const totalPaid = formData.payments.reduce(
      (acc, payment) => acc + (parseFloat(payment.amount) || 0),
      0,
    );

    if (totalPaid > payable) {
      ErrorToast('Total payment amount cannot exceed the payable amount');
      return false;
    }

    return true;
  };

  const createInvoice = async () => {
    // recalc before save
    const totalAmount = selectedRow.food_items.reduce(
      (acc, cur) => acc + cur.rate * cur.qty,
      0,
    );
    const tax = selectedRow.food_items.reduce(
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
    const cleanedMenuItems = selectedRow.food_items.map(
      ({ id, documentId, room, ...rest }) => rest,
    );

    const cleanedPayments = formData.payments.map(
      ({ id, documentId, ...rest }) => rest,
    );

    const newInvoiceNO = generateNextInvoiceNo();
    const time = GetCurrentTime();
    const finalData = {
      ...formData,
      invoice_no: newInvoiceNO,
      date: todaysDate,
      time: time,
      total_amount: totalAmount,
      tax,
      payable_amount: payable,
      payments: cleanedPayments,
      due,
      menu_items: cleanedMenuItems,
    };

    const res = await CreateNewData({
      auth,
      endPoint: 'restaurant-invoices',
      payload: { data: finalData },
    });
    return res;
  };
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await createInvoice();

      await UpdateData({
        auth,
        endPoint: 'table-orders',
        id: selectedRow.documentId,
        payload: {
          data: {
            closing_method: 'Restaurant Invoice',
            token_status: 'Closed',
            restaurant_invoice: res.data.data.documentId,
          },
        },
      });

      SuccessToast('Invoice created successfully');

      setInvoiceOpen(false);
      setFormData({
        customer_name: '',
        customer_phone: '',
        customer_gst: '',
        customer_address: '',
        payments: [],
      });
      setSelectedRow(null);
    } catch (error) {
      ErrorToast('Failed to create invoice. Please try again.');
      console.error('Create invoice error:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {/* Create/Edit Dialog */}
      <Dialog
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Invoice</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>
            Invoice Info
          </Typography>
          <Grid container spacing={2} mb={2}>
            <Grid item size={{ xs: 12, sm: 4 }}>
              <Typography>
                Invoice No: <b>{generateNextInvoiceNo()}</b>
              </Typography>
            </Grid>
            <Grid item size={{ xs: 12, sm: 4 }}>
              <Typography>
                Date: <b>{todaysDate}</b>
              </Typography>
            </Grid>
            <Grid item size={{ xs: 12, sm: 4 }}>
              <Typography>
                Time: <b>{GetCurrentTime()}</b>
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

          {selectedRow?.food_items?.length > 0 && (
            <TableContainer component={Paper} sx={{ borderRadius: 1, mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Name', 'HSN', 'Rate', 'Qty', 'GST %', 'Total'].map(
                      (h) => (
                        <TableCell key={h}>{h}</TableCell>
                      ),
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedRow?.food_items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.item}</TableCell>
                      <TableCell>{item.hsn}</TableCell>
                      <TableCell>₹{item.rate}</TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell>{item.gst}%</TableCell>
                      <TableCell>₹{item.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Summary Section */}
          <Typography variant="h6" gutterBottom>
            Summary
          </Typography>
          {(() => {
            const totalAmount = selectedRow?.food_items?.reduce(
              (acc, cur) => acc + cur.rate * cur.qty,
              0,
            );
            const tax = selectedRow?.food_items?.reduce(
              (acc, cur) => acc + (cur.rate * cur.qty * cur.gst) / 100,
              0,
            );
            const payable = totalAmount + tax;
            const totalPaid = formData.payments.reduce(
              (acc, payment) => acc + (parseFloat(payment.amount) || 0),
              0,
            );
            const due = Math.max(0, payable - totalPaid);

            return (
              <Grid container spacing={2} mb={2}>
                <Grid item size={{ xs: 12, sm: 3 }}>
                  <Typography>
                    Total: <b>₹{totalAmount?.toFixed(2)}</b>
                  </Typography>
                </Grid>
                <Grid item size={{ xs: 12, sm: 3 }}>
                  <Typography>
                    SGST: <b>₹{(tax?.toFixed(2) / 2)?.toFixed(2)}</b>
                  </Typography>
                </Grid>
                <Grid item size={{ xs: 12, sm: 3 }}>
                  <Typography>
                    CGST: <b>₹{(tax?.toFixed(2) / 2)?.toFixed(2)}</b>
                  </Typography>
                </Grid>
                <Grid item size={{ xs: 12, sm: 3 }}>
                  <Typography>
                    Payable: <b>₹{payable?.toFixed(2)}</b>
                  </Typography>
                </Grid>
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

          {/* Payment Section */}
          <Typography variant="h6" gutterBottom>
            Payments
          </Typography>

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
                              handleUpdatePayment(idx, 'mop', e.target.value)
                            }
                            SelectProps={{ native: true }}
                          >
                            <option value="">-- Select --</option>
                            {paymentMethods?.map((method) => (
                              <option
                                key={method.documentId}
                                value={method.name}
                              >
                                {method?.name}
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
                            inputProps={{ min: 0, step: 0.01 }}
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
                      startIcon={<AddIcon />}
                      disabled={(() => {
                        const totalAmount = selectedRow?.food_items?.reduce(
                          (acc, cur) => acc + cur.rate * cur.qty,
                          0,
                        );
                        const tax = selectedRow?.food_items?.reduce(
                          (acc, cur) =>
                            acc + (cur.rate * cur.qty * cur.gst) / 100,
                          0,
                        );
                        const payable = totalAmount + tax;
                        const totalPaid = formData.payments.reduce(
                          (acc, payment) =>
                            acc + (parseFloat(payment.amount) || 0),
                          0,
                        );
                        const due = Math.max(0, payable - totalPaid);
                        return due <= 0;
                      })()}
                    >
                      Add Payment
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setInvoiceOpen(false);
              setFormData({
                customer_name: '',
                customer_phone: '',
                customer_gst: '',
                customer_address: '',
                payments: [],
              });
              setSelectedRow(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateOrderInvoice;
