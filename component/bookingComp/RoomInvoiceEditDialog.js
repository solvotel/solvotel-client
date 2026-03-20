import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Divider,
  Box,
  IconButton,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { UpdateData } from '@/utils/ApiFunctions';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';

export default function EditRoomInvoiceDialog({
  editOpen,
  setEditOpen,
  editData,
  auth,
  paymentMethods,
}) {
  const [loading, setLoading] = useState(false);
  const [invData, setInvData] = useState({});
  const [roomTokens, setRoomTokens] = useState([]);
  const [serviceTokens, setServiceTokens] = useState([]);
  const [foodTokens, setFoodTokens] = useState([]);
  const [payments, setPayments] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (editData) {
      // Handle backward compatibility: if old mop exists and no payments, convert to payments
      let paymentsData = editData.payments || [];
      if (
        editData.mop &&
        (!editData.payments || editData.payments.length === 0)
      ) {
        paymentsData = [
          {
            time_stamp: new Date().toISOString(),
            mop: editData.mop,
            amount: editData.payable_amount - (editData.due || 0),
          },
        ];
      }

      setInvData({
        customer_name: editData.customer_name || '',
        customer_phone: editData.customer_phone || '',
        customer_address: editData.customer_address || '',
        customer_gst: editData.customer_gst || '',
        mop: editData.mop || '', // Keep for backward compatibility
      });
      setRoomTokens(editData?.room_tokens || []);
      setServiceTokens(editData?.service_tokens || []);
      setFoodTokens(editData?.food_tokens || []);
      setPayments(paymentsData);
    }
  }, [editData]);

  // --- CALCULATIONS ---

  const calcAmount = (rate, gst) => {
    const r = parseFloat(rate) || 0;
    const g = parseFloat(gst) || 0;
    return +(r + (r * g) / 100).toFixed(2);
  };

  const calcRateFromAmount = (amount, gst) => {
    const a = parseFloat(amount) || 0;
    const g = parseFloat(gst) || 0;
    return +(a / (1 + g / 100)).toFixed(2);
  };

  const calcTotals = (items) => {
    let totalAmount = 0;
    let totalGst = 0;
    items.forEach((i) => {
      const rate = parseFloat(i.rate) || 0;
      const gst = parseFloat(i.gst) || 0;
      const gstAmt = (rate * gst) / 100;
      totalAmount += rate + gstAmt;
      totalGst += gstAmt;
    });
    return {
      total_amount: +totalAmount.toFixed(2),
      total_gst: +totalGst.toFixed(2),
    };
  };

  // --- HANDLERS ---

  const handleRoomChange = (index, field, value) => {
    const updated = [...roomTokens];
    const item = updated[index];
    item[field] = value;

    if (field === 'rate' || field === 'gst') {
      item.amount = calcAmount(item.rate, item.gst);
    } else if (field === 'amount') {
      item.rate = calcRateFromAmount(value, item.gst);
    }

    setRoomTokens(updated);
  };

  const handleServiceItemChange = (tokenIndex, itemIndex, field, value) => {
    const updated = [...serviceTokens];
    const item = updated[tokenIndex].items[itemIndex];
    item[field] = value;

    if (field === 'rate' || field === 'gst') {
      item.amount = calcAmount(item.rate, item.gst);
    } else if (field === 'amount') {
      item.rate = calcRateFromAmount(value, item.gst);
    }

    const totals = calcTotals(updated[tokenIndex].items);
    updated[tokenIndex].total_amount = totals.total_amount;
    updated[tokenIndex].total_gst = totals.total_gst;

    setServiceTokens(updated);
  };

  const handleFoodItemChange = (tokenIndex, itemIndex, field, value) => {
    const updated = [...foodTokens];
    const item = updated[tokenIndex].items[itemIndex];
    item[field] = value;

    if (field === 'rate' || field === 'gst') {
      item.amount = calcAmount(item.rate, item.gst);
    } else if (field === 'amount') {
      item.rate = calcRateFromAmount(value, item.gst);
    }

    const totals = calcTotals(updated[tokenIndex].items);
    updated[tokenIndex].total_amount = totals.total_amount;
    updated[tokenIndex].total_gst = totals.total_gst;

    setFoodTokens(updated);
  };

  // --- SAVE DATA ---
  const handleSave = async () => {
    // Validation
    const errors = {};

    // Calculate payable amount
    const serviceAndFood = [...foodTokens, ...serviceTokens];
    const totalRoomAmount = roomTokens.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0,
    );
    const totalOtherAmount = serviceAndFood.reduce(
      (sum, item) => sum + (parseFloat(item.total_amount) || 0),
      0,
    );
    const payableAmount = totalOtherAmount + totalRoomAmount;

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      ErrorToast(Object.values(errors)[0]);
      return;
    }

    const totalRoomRate = roomTokens.reduce(
      (sum, item) => sum + (parseFloat(item.rate * item.days) || 0),
      0,
    );
    const totalRoomGst = totalRoomAmount - totalRoomRate;
    const totalOtherGst = serviceAndFood.reduce(
      (sum, item) => sum + (parseFloat(item.total_gst) || 0),
      0,
    );
    const totalGst = totalRoomGst + totalOtherGst;

    try {
      setLoading(true);
      const cleanedRoomTokens = roomTokens.map(({ id, ...rest }) => rest);

      const payload = {
        data: {
          ...invData,
          room_tokens: cleanedRoomTokens,
          food_tokens: foodTokens,
          service_tokens: serviceTokens,
          payable_amount: payableAmount,
          tax: totalGst,
          total_amount: payableAmount - totalGst,
        },
      };
      await UpdateData({
        auth,
        endPoint: 'room-invoices',
        id: editData.documentId,
        payload: payload,
      });
      SuccessToast('Invoice Updated Successfully');
      setLoading(false);
      setEditOpen(false);
    } catch (err) {
      console.log(err);
      ErrorToast('Something went wrong. Please try again');
      setLoading(false);
    }
  };

  // --- UI ---

  return (
    <Dialog
      open={editOpen}
      onClose={() => setEditOpen(false)}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>Edit Invoice</DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          🧾 Invoice: {editData?.invoice_no}
        </Typography>

        {/* CUSTOMER INFO */}
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Customer Name"
              value={invData?.customer_name || ''}
              onChange={(e) =>
                setInvData({ ...invData, customer_name: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Customer Phone"
              value={invData?.customer_phone || ''}
              onChange={(e) =>
                setInvData({ ...invData, customer_phone: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Customer GST"
              value={invData?.customer_gst || ''}
              onChange={(e) =>
                setInvData({ ...invData, customer_gst: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Customer Address"
              value={invData?.customer_address || ''}
              onChange={(e) =>
                setInvData({ ...invData, customer_address: e.target.value })
              }
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* ROOM TOKENS */}
        <Typography variant="h6" gutterBottom>
          🏨 Room Charges
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>HSN</TableCell>
                <TableCell width={200}>Rate</TableCell>
                <TableCell width={100}>GST %</TableCell>
                <TableCell width={200}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roomTokens.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.item}</TableCell>
                  <TableCell>{row.hsn}</TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={row.rate}
                      onChange={(e) =>
                        handleRoomChange(i, 'rate', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={row.gst}
                      onChange={(e) =>
                        handleRoomChange(i, 'gst', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={row.amount}
                      onChange={(e) =>
                        handleRoomChange(i, 'amount', e.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 2 }} />

        {/* SERVICE TOKENS */}
        {serviceTokens.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              🧰 Service Charges
            </Typography>
            {serviceTokens.map((token, ti) => (
              <Box key={ti} mb={2}>
                <Typography variant="subtitle2">
                  Room No: {token.room_no}
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>HSN</TableCell>
                        <TableCell align="right">Rate</TableCell>
                        <TableCell align="right">GST %</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {token.items.map((item, ii) => (
                        <TableRow key={ii}>
                          <TableCell>{item.item}</TableCell>
                          <TableCell>{item.hsn}</TableCell>
                          <TableCell align="right">
                            <TextField
                              size="small"
                              type="number"
                              value={item.rate}
                              onChange={(e) =>
                                handleServiceItemChange(
                                  ti,
                                  ii,
                                  'rate',
                                  e.target.value,
                                )
                              }
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              size="small"
                              type="number"
                              value={item.gst}
                              onChange={(e) =>
                                handleServiceItemChange(
                                  ti,
                                  ii,
                                  'gst',
                                  e.target.value,
                                )
                              }
                              sx={{ width: 60 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              size="small"
                              type="number"
                              value={item.amount}
                              onChange={(e) =>
                                handleServiceItemChange(
                                  ti,
                                  ii,
                                  'amount',
                                  e.target.value,
                                )
                              }
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} />
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="right">
                          ₹{token.total_amount || 0}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* FOOD TOKENS */}
        {foodTokens.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              🍽️ Food Charges
            </Typography>
            {foodTokens.map((token, ti) => (
              <Box key={ti} mb={2}>
                <Typography variant="subtitle2">
                  Type: {token.type} | Room: {token.room_no}
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>HSN</TableCell>
                        <TableCell align="right">Rate</TableCell>
                        <TableCell align="right">GST %</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {token.items.map((item, ii) => (
                        <TableRow key={ii}>
                          <TableCell>{item.item}</TableCell>
                          <TableCell>{item.hsn}</TableCell>
                          <TableCell align="right">
                            <TextField
                              size="small"
                              type="number"
                              value={item.rate}
                              onChange={(e) =>
                                handleFoodItemChange(
                                  ti,
                                  ii,
                                  'rate',
                                  e.target.value,
                                )
                              }
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              size="small"
                              type="number"
                              value={item.gst}
                              onChange={(e) =>
                                handleFoodItemChange(
                                  ti,
                                  ii,
                                  'gst',
                                  e.target.value,
                                )
                              }
                              sx={{ width: 60 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              size="small"
                              type="number"
                              value={item.amount}
                              onChange={(e) =>
                                handleFoodItemChange(
                                  ti,
                                  ii,
                                  'amount',
                                  e.target.value,
                                )
                              }
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} />
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="right">
                          ₹{token.total_amount || 0}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setEditOpen(false)}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
