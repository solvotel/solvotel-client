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
} from '@mui/material';
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
  // Initialize editable copies
  const [roomTokens, setRoomTokens] = useState([]);
  const [serviceTokens, setServiceTokens] = useState([]);
  const [foodTokens, setFoodTokens] = useState([]);

  useEffect(() => {
    if (editData) {
      setInvData({
        customer_name: editData.customer_name || '',
        customer_phone: editData.customer_phone || '',
        customer_address: editData.customer_address || '',
        customer_gst: editData.customer_gst || '',
        mop: editData.mop || '',
      });
      setRoomTokens(editData?.room_tokens || []);
      setServiceTokens(editData?.service_tokens || []);
      setFoodTokens(editData?.food_tokens || []);
    }
  }, [editData]);

  // --- UTILS ---
  const calcAmount = (rate, gst) => {
    const r = parseFloat(rate) || 0;
    const g = parseFloat(gst) || 0;
    return +(r + (r * g) / 100).toFixed(2);
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
    updated[index][field] = value;
    updated[index].amount = calcAmount(updated[index].rate, updated[index].gst);
    setRoomTokens(updated);
  };

  const handleServiceItemChange = (tokenIndex, itemIndex, field, value) => {
    const updated = [...serviceTokens];
    updated[tokenIndex].items[itemIndex][field] = value;
    updated[tokenIndex].items[itemIndex].amount = calcAmount(
      updated[tokenIndex].items[itemIndex].rate,
      updated[tokenIndex].items[itemIndex].gst
    );

    const totals = calcTotals(updated[tokenIndex].items);
    updated[tokenIndex].total_amount = totals.total_amount;
    updated[tokenIndex].total_gst = totals.total_gst;

    setServiceTokens(updated);
  };

  const handleFoodItemChange = (tokenIndex, itemIndex, field, value) => {
    const updated = [...foodTokens];
    updated[tokenIndex].items[itemIndex][field] = value;
    updated[tokenIndex].items[itemIndex].amount = calcAmount(
      updated[tokenIndex].items[itemIndex].rate,
      updated[tokenIndex].items[itemIndex].gst
    );

    const totals = calcTotals(updated[tokenIndex].items);
    updated[tokenIndex].total_amount = totals.total_amount;
    updated[tokenIndex].total_gst = totals.total_gst;

    setFoodTokens(updated);
  };

  // save data
  const handleSave = async () => {
    try {
      setLoading(true);
      const cleanedRoomTokens = roomTokens.map(({ id, ...rest }) => rest);
      const payload = {
        data: {
          ...invData,
          room_tokens: cleanedRoomTokens,
          food_tokens: foodTokens,
          service_tokens: serviceTokens,
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

  return (
    <Dialog
      open={editOpen}
      onClose={() => setEditOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Edit Invoice</DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          🧾 Invoice: {editData?.invoice_no}
        </Typography>

        {/* Customer Info */}
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
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Mode of Payment"
              value={invData?.mop || ''}
              onChange={(e) => setInvData({ ...invData, mop: e.target.value })}
              SelectProps={{ native: true }}
            >
              <option value="">-- Select --</option>
              {paymentMethods?.map((pm) => (
                <option key={pm.documentId} value={pm.name}>
                  {pm.name}
                </option>
              ))}
            </TextField>
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
                <TableCell align="right">Rate</TableCell>
                <TableCell align="right">GST %</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roomTokens.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.item}</TableCell>
                  <TableCell>{row.hsn}</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={row.rate}
                      onChange={(e) =>
                        handleRoomChange(i, 'rate', e.target.value)
                      }
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={row.gst}
                      onChange={(e) =>
                        handleRoomChange(i, 'gst', e.target.value)
                      }
                      sx={{ width: 60 }}
                    />
                  </TableCell>
                  <TableCell align="right">{row.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 2 }} />

        {/* SERVICE TOKENS */}
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
                              e.target.value
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
                              e.target.value
                            )
                          }
                          sx={{ width: 60 }}
                        />
                      </TableCell>
                      <TableCell align="right">{item.amount}</TableCell>
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

        {/* FOOD TOKENS */}
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
                            handleFoodItemChange(ti, ii, 'rate', e.target.value)
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
                            handleFoodItemChange(ti, ii, 'gst', e.target.value)
                          }
                          sx={{ width: 60 }}
                        />
                      </TableCell>
                      <TableCell align="right">{item.amount}</TableCell>
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
